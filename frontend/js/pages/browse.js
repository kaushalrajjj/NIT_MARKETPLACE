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
// ─── LOCAL UI STATE ───────────────────────────────────────────────────────────
// Just plain variables — no state manager, no pub/sub.
let products = []; // Current list of loaded products
let total = 0;    // Total count of products matching filters
let wishlistedIds = new Set(); // IDs of products the user has liked (for heart icon state)
window.selectedSellerId = null;   // Active seller filter ID
window.selectedSellerName = null; // Active seller filter display name

/** 
 * Scrape current DOM state to build a filter object for the API query.
 */
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

/** 
 * Primary Data Orchestrator:
 * 1. Shows loading state.
 * 2. Fetches filtered data from API.
 * 3. Triggers UI re-renders for grid and active filter tags.
 */
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

/** 
 * Handles drawing the product cards and syncing the 'heart' button visual state.
 */
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

/** 
 * Renders the small 'removable tags' for current active filters (e.g., [x] Books).
 */
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
/** Set active category and re-fetch */
window.setCat = (el, cat) => {
    window.selectedCategory = cat;
    document.querySelectorAll('.cat-filter-item').forEach(item => item.classList.remove('active'));
    const target = el || document.querySelector(`.cat-filter-item[onclick*="'${cat}'"]`);
    if (target) target.classList.add('active');
    fetchAndRender();
};

// ─── SORT ─────────────────────────────────────────────────────────────────────
/** Open/Close sorting dropdown */
window.toggleSort = () => {
    document.querySelector('.sort-menu')?.classList.toggle('open');
};

/** Select sort order and re-fetch */
window.setSort = (el, value, label) => {
    window.currentSort = value;
    browseUI.updateSortLabel(label);
    document.querySelectorAll('.sort-opt').forEach(opt => opt.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelector('.sort-menu')?.classList.remove('open');
    fetchAndRender();
};

// ─── FILTER DROPDOWN ──────────────────────────────────────────────────────────
/** Toggle the advanced filters popover */
window.toggleFilterDropdown = (e) => {
    if (e) e.stopPropagation();
    document.getElementById('filtersPopover')?.classList.toggle('open');
};

/** Apply changes from the popover */
window.applyFilters = () => fetchAndRender();

// Close dropdowns when clicking anywhere else on page
window.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-wrap'))
        document.querySelector('.sort-menu')?.classList.remove('open');
    if (!e.target.closest('.filters-dropdown-container'))
        document.getElementById('filtersPopover')?.classList.remove('open');
});

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
/** 
 * Toggle like/wishlist for a product.
 * Uses 'Optimistic UI' (updates view immediately, then syncs with server).
 */
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
/** 
 * Opens the product detail modal.
 * Guests see a login wall; logged-in users see full contact info and images.
 */
window.openModal = (id) => {
    // Close profile card if it was already open
    window.closeProfileModal();

    const loginWall = document.getElementById('qvLoginWall');
    const content   = document.getElementById('qvContent');

    // Open overlay and disable body scrolling
    document.getElementById('qvModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    // ── Guest: restricted view ───────────────
    if (!apiService.getUserInfo()) {
        document.getElementById('qvTitle').textContent = 'Members Only 🔒';
        if (loginWall) loginWall.style.display = 'block';
        if (content)   content.style.display   = 'none';
        return;
    }

    // ── Logged in: full details ───────────────
    const p = products.find(x => x._id === id);
    if (!p) return;

    document.getElementById('qvTitle').textContent = p.title;

    // Resolve image display (URL resize -> Cloudinary)
    const imgWrap = document.getElementById('qvImgWrap');
    if (imgWrap) {
        if (p.img) {
            let src = p.img.startsWith('http') ? p.img : `/product-images/${p.img}`;
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

    // Fill info grid (Condition, Category, Seller link)
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

    // Generate Call/WhatsApp buttons
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

/** Close modal and restore body scrolling */
window.closeModal = () => {
    document.getElementById('qvModal').classList.remove('open');
    document.body.style.overflow = '';
};

/** Open a specific seller profile card */
window.openProfileModal = (productId) => {
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

/** Close seller profile card */
window.closeProfileModal = () => {
    document.getElementById('profileModal')?.classList.remove('open');
    if (!document.getElementById('qvModal')?.classList.contains('open')) {
        document.body.style.overflow = '';
    }
};

/** Filter the whole browse page by a specific seller */
window.filterBySeller = (sellerId, sellerName) => {
    window.selectedSellerId = sellerId;
    window.selectedSellerName = sellerName;
    window.closeProfileModal();
    window.closeModal(); 
    window.searchQuery = '';
    const s = document.getElementById('navbarSearch');
    if (s) s.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAndRender();
};

/** Remove seller filter */
window.clearSeller = () => {
    window.selectedSellerId = null;
    window.selectedSellerName = null;
    fetchAndRender();
};

// ─── RESET / CLEAR HELPERS ────────────────────────────────────────────────────
/** Wipe all active filters and refresh */
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

/** Clear specifically the search bar filter */
window.clearSearch = () => {
    window.searchQuery = '';
    const s = document.getElementById('navbarSearch');
    if (s) s.value = '';
    fetchAndRender();
};

/** Reset price range inputs only */
window.resetPrice = () => {
    document.getElementById('priceMin') && (document.getElementById('priceMin').value = '');
    document.getElementById('priceMax') && (document.getElementById('priceMax').value = '');
    fetchAndRender();
};

/** Uncheck all condition checkboxes */
window.clearCondition = () => {
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
    fetchAndRender();
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
/** 
 * Page Bootstrap:
 * 1. Initialize Nav & Toast.
 * 2. Sync search from URL params.
 * 3. Pre-load user wishlist state.
 * 4. Run initial fetch.
 */
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

// Listener for navbar search 'Enter' key
document.getElementById('navbarSearch')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        window.searchQuery = e.target.value;
        fetchAndRender();
    }
});
