import { apiService } from '../services/apiService.js';
import { browseUI } from '../ui/browseUI.js';
import { SortDropdown } from '../../components/SortDropdown.js';
import { PageHeader } from '../../components/PageHeader.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';
import { getEmoji, getOptimizedImageUrl } from '../utils/helpers.js';
import { ProfileCard } from '../../components/ProfileCard.js';

// ─── LOCAL UI STATE ───────────────────────────────────────────────────────────
// Just plain variables — no state manager, no pub/sub.
let products = [];
let total = 0;
let wishlistedIds = new Set(); // product IDs the user has wishlisted
window.selectedSellerId = null;
window.selectedSellerName = null;

// ─── BUILD FILTERS FROM DOM ───────────────────────────────────────────────────
function buildFilters() {
    return {
        category:  window.selectedCategory || 'all',
        minPrice:  document.getElementById('priceMin')?.value || '',
        maxPrice:  document.getElementById('priceMax')?.value || '',
        condition: Array.from(document.querySelectorAll('input[name="condition"]:checked'))
                       .map(cb => cb.value).join(','),
        search:    window.searchQuery || '',
        seller:    window.selectedSellerId || '',
        sellerName: window.selectedSellerName || ''
    };
}

// ─── FETCH → RENDER ───────────────────────────────────────────────────────────
async function fetchAndRender() {
    const grid = document.getElementById('productsGrid');
    if (grid) grid.innerHTML = '<div class="loading-state">Loading products...</div>';

    try {
        const data = await apiService.query({
            filters: buildFilters(),
            sort:    window.currentSort || 'newest',
            page:    1,
            limit:   12,
            fields:  ['_id', 'title', 'description', 'price', 'category', 'condition', 'seller', 'img', 'createdAt']
        });
        products = data.products;
        total    = data.total;
        renderGrid();
        renderActiveFilters();
    } catch (err) {
        if (grid) grid.innerHTML = '<div class="empty-state">Failed to load products.</div>';
    }
}

function renderGrid() {
    browseUI.renderProducts({ products, total, filters: buildFilters() });
    // Sync heart button state from wishlistedIds set
    products.forEach(p => {
        const btn = document.getElementById(`wish-${p._id}`);
        if (!btn) return;
        const wished = wishlistedIds.has(p._id);
        btn.innerHTML = wished ? '❤️' : '♡';
        btn.classList.toggle('active', wished);
        btn.title = wished ? 'Remove from wishlist' : 'Save to wishlist';
    });
}

function renderActiveFilters() {
    browseUI.renderActiveFilters(buildFilters(), {
        onRemoveCategory:  () => window.setCat(null, 'all'),
        onRemovePrice:     () => window.resetPrice(),
        onRemoveCondition: () => window.clearCondition(),
        onRemoveSearch:    () => window.clearSearch(),
        onRemoveSeller:    () => window.clearSeller(),
        onClearAll:        () => window.resetFilters()
    });
}

// ─── CATEGORY ─────────────────────────────────────────────────────────────────
window.setCat = (el, cat) => {
    window.selectedCategory = cat;
    document.querySelectorAll('.cat-filter-item').forEach(item => item.classList.remove('active'));
    const target = el || document.querySelector(`.cat-filter-item[onclick*="'${cat}'"]`);
    if (target) target.classList.add('active');
    fetchAndRender();
};

// ─── SORT ─────────────────────────────────────────────────────────────────────
window.toggleSort = () => {
    document.querySelector('.sort-menu')?.classList.toggle('open');
};

window.setSort = (el, value, label) => {
    window.currentSort = value;
    browseUI.updateSortLabel(label);
    document.querySelectorAll('.sort-opt').forEach(opt => opt.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelector('.sort-menu')?.classList.remove('open');
    fetchAndRender();
};

// ─── FILTER DROPDOWN ──────────────────────────────────────────────────────────
window.toggleFilterDropdown = (e) => {
    if (e) e.stopPropagation();
    document.getElementById('filtersPopover')?.classList.toggle('open');
};

window.applyFilters = () => fetchAndRender();

// Close dropdowns on outside click
window.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-wrap'))
        document.querySelector('.sort-menu')?.classList.remove('open');
    if (!e.target.closest('.filters-dropdown-container'))
        document.getElementById('filtersPopover')?.classList.remove('open');
});

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
window.toggleWish = async (productId, btn) => {
    const userInfo = apiService.getUserInfo();
    if (!userInfo?.token) {
        window.showToast?.('Login to save items', 'error');
        return;
    }

    const isAdded = !wishlistedIds.has(productId);

    // Optimistic update
    isAdded ? wishlistedIds.add(productId) : wishlistedIds.delete(productId);
    btn.innerHTML = isAdded ? '❤️' : '♡';
    btn.classList.toggle('active', isAdded);
    btn.title = isAdded ? 'Remove from wishlist' : 'Save to wishlist';
    window.showToast?.(isAdded ? 'Added to wishlist ❤️' : 'Removed from wishlist', isAdded ? 'success' : 'info');

    // Sync to backend
    try {
        await apiService.syncWishlist(productId, isAdded, userInfo.token);
    } catch {
        // Revert on failure
        isAdded ? wishlistedIds.delete(productId) : wishlistedIds.add(productId);
        btn.innerHTML = isAdded ? '♡' : '❤️';
        btn.classList.toggle('active', !isAdded);
        window.showToast?.('Wishlist sync failed', 'error');
    }
};

// ─── QUICK VIEW MODAL ─────────────────────────────────────────────────────────
window.openModal = (id) => {
    // Close profile card if open
    window.closeProfileModal();

    const loginWall = document.getElementById('qvLoginWall');
    const content   = document.getElementById('qvContent');

    // Always open the overlay first
    document.getElementById('qvModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    // ── Guest: show login wall, hide content ───────────────
    if (!apiService.getUserInfo()) {
        document.getElementById('qvTitle').textContent = 'Members Only 🔒';
        if (loginWall) loginWall.style.display = 'block';
        if (content)   content.style.display   = 'none';
        return;
    }

    // ── Logged in: show full product details ───────────────
    const p = products.find(x => x._id === id);
    if (!p) return;

    document.getElementById('qvTitle').textContent = p.title;

    // Image — real photo or emoji fallback
    const imgWrap = document.getElementById('qvImgWrap');
    if (imgWrap) {
        if (p.img) {
            let src = p.img.startsWith('http') ? p.img : `/product-images/${p.img}`;
            // Auto-resize for modal view (width: 800)
            src = getOptimizedImageUrl(src, 800);
            
            imgWrap.innerHTML = `<img src="${src}" alt="${p.title}" 
                                      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                                      style="width:100%; max-height:100%; object-fit:contain; border-radius:12px; background:#f9fafb;">
                                 <span class="fallback-emoji" style="display:none; font-size:4rem; width:100%; height:350px; align-items:center; justify-content:center; background:var(--pri-light); border-radius:12px;">${getEmoji(p.category)}</span>`;
        } else {
            imgWrap.innerHTML = `<span style="font-size:3.5rem">${getEmoji(p.category)}</span>`;
        }
    }

    document.getElementById('qvPrice').textContent  = `₹${p.price.toLocaleString('en-IN')}`;
    document.getElementById('qvDesc').textContent   = p.description;

    const infoRows = document.getElementById('qvInfoRows');
    if (infoRows) {
        const sellerLabel = p.seller?.rollNo
            ? `${p.seller.name || 'Anonymous'} (${p.seller.rollNo})`
            : (p.seller?.name || 'Anonymous');
        infoRows.innerHTML = [
            ['🏷️ Condition', p.condition  || '—'],
            ['📂 Category',  p.category   || '—'],
            ['👤 Seller',    `<span class="seller-trigger" onclick="event.stopPropagation(); window.openProfileModal('${p._id}')">${sellerLabel}</span>`]
        ].map(([label, value]) =>
            `<div class="modal-info-row"><span class="modal-info-label">${label}</span><span>${value}</span></div>`
        ).join('');
    }

    const contactArea = document.getElementById('modalContactActions');
    if (contactArea) {
        const mobile   = p.seller?.mobileNo || '';
        const whatsapp = p.seller?.whatsappNo || '';
        
        let actionsHtml = '';
        if (mobile) {
            actionsHtml += `<a class="btn btn-blue" href="tel:${mobile}">📞 Call ${mobile}</a>`;
        }
        if (whatsapp) {
            actionsHtml += `<a class="btn btn-whatsapp" href="https://wa.me/${whatsapp.replace(/\D/g,'')}" target="_blank">💬 WhatsApp</a>`;
        }
        
        contactArea.innerHTML = actionsHtml || `<p style="color:var(--text-3);font-size:.85rem;font-style:italic">No contact info provided.</p>`;
    }

    if (loginWall) loginWall.style.display = 'none';
    if (content)   content.style.display   = 'block';
};

window.closeModal = () => {
    document.getElementById('qvModal').classList.remove('open');
    document.body.style.overflow = '';
    // Reset panels so next open is clean
    const loginWall = document.getElementById('qvLoginWall');
    const content   = document.getElementById('qvContent');
    if (loginWall) loginWall.style.display = 'none';
    if (content)   content.style.display   = 'none';
};

window.openProfileModal = (productId) => {
    // Close product details if open
    window.closeModal();

    const p = products.find(x => x._id === productId);
    if (!p || !p.seller) return;

    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileModalContent');
    if (modal && content) {
        content.innerHTML = ProfileCard(p.seller);
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

window.closeProfileModal = () => {
    document.getElementById('profileModal')?.classList.remove('open');
    // Only restore overflow if product modal is also closed
    if (!document.getElementById('qvModal')?.classList.contains('open')) {
        document.body.style.overflow = '';
    }
};

window.filterBySeller = (sellerId, sellerName) => {
    window.selectedSellerId = sellerId;
    window.selectedSellerName = sellerName;
    window.closeProfileModal();
    window.closeModal(); // Close product qv too

    // Clear search for better focus
    window.searchQuery = '';
    const s = document.getElementById('navbarSearch');
    if (s) s.value = '';

    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAndRender();
};

window.clearSeller = () => {
    window.selectedSellerId = null;
    window.selectedSellerName = null;
    fetchAndRender();
};

// ─── RESET / CLEAR HELPERS ────────────────────────────────────────────────────
window.resetFilters = () => {
    window.searchQuery = '';
    document.getElementById('priceMin') && (document.getElementById('priceMin').value = '');
    document.getElementById('priceMax') && (document.getElementById('priceMax').value = '');
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
    window.setCat(null, 'all');
    window.selectedSellerId = null;
    window.selectedSellerName = null;
    fetchAndRender();
};

window.clearSearch = () => {
    window.searchQuery = '';
    const s = document.getElementById('navbarSearch');
    if (s) s.value = '';
    fetchAndRender();
};

window.resetPrice = () => {
    document.getElementById('priceMin') && (document.getElementById('priceMin').value = '');
    document.getElementById('priceMax') && (document.getElementById('priceMax').value = '');
    fetchAndRender();
};

window.clearCondition = () => {
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
    fetchAndRender();
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initToast();

    // Carry search from URL
    const search = new URLSearchParams(window.location.search).get('search');
    if (search) {
        window.searchQuery = search;
        const s = document.getElementById('navbarSearch');
        if (s) s.value = search;
    }

    const hdrContainer = document.getElementById('page-header-root');
    if (hdrContainer) {
        hdrContainer.innerHTML = PageHeader({
            title: 'Browse Marketplace',
            description: 'Explore campus listings.',
            breadcrumbText: 'Browse Items',
            showAction: false
        });
    }

    const sortRoot = document.getElementById('sort-root');
    if (sortRoot) {
        sortRoot.innerHTML = SortDropdown({
            options: [
                { label: 'Newest First',       value: 'newest'     },
                { label: 'Price: Low to High', value: 'price_low'  },
                { label: 'Price: High to Low', value: 'price_high' }
            ],
            defaultActiveLabel: 'Newest First'
        });
    }

    // Pre-load wishlisted IDs so hearts are correct on first render
    const userInfo = apiService.getUserInfo();
    if (userInfo?.token) {
        try {
            const activity = await apiService.fetchActivity(userInfo.token);
            wishlistedIds = new Set(activity.wishlisted || []);
        } catch { /* non-fatal */ }
    }

    fetchAndRender();
});

// Navbar search submit on Enter
document.getElementById('navbarSearch')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        window.searchQuery = e.target.value;
        fetchAndRender();
    }
});
