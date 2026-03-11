import { apiService } from '../services/apiService.js';
import { getEmoji } from '../utils/helpers.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';
import { PageHeader } from '../../components/PageHeader.js';
import { SortDropdown } from '../../components/SortDropdown.js';

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';

const TOKEN = userInfo?.token;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Returns either a real <img> or the category emoji
function productThumb(p) {
    if (p.img) return `<img src="/product-images/${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
    return getEmoji(p.category);
}

// ─── LOCAL SORT STATE ─────────────────────────────────────────────────────────
let myProducts  = [];
let currentSort = 'Newest First';
let activeTab   = 'listings';

// ─── TAB SWITCHING ────────────────────────────────────────────────────────────
window.switchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.dash-tab[data-tab="${tab}"]`)?.classList.add('active');

    document.getElementById('listingsSection').style.display = tab === 'listings' ? '' : 'none';
    document.getElementById('wishlistSection').style.display = tab === 'wishlist'  ? '' : 'none';
    document.getElementById('soldSection').style.display     = tab === 'sold'      ? '' : 'none';
    document.getElementById('ordersSection').style.display   = tab === 'orders'    ? '' : 'none';

    if (tab === 'wishlist') loadAndRenderWishlist();
    if (tab === 'sold')     renderSoldTab();
    if (tab === 'orders')   renderOrdersTab();
};

// ─── MY LISTINGS ─────────────────────────────────────────────────────────────
async function refreshProducts() {
    try {
        myProducts = await apiService.fetchMyProducts(TOKEN);
        applySortAndRender();
    } catch (err) {
        console.error('[dashboard] Error fetching my products:', err);
    }
}

function applySortAndRender() {
    const sorted = [...myProducts];
    if (currentSort === 'Newest First') {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'Price: Low to High') {
        sorted.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'Price: High to Low') {
        sorted.sort((a, b) => b.price - a.price);
    }
    renderMyProducts(sorted);
}

function renderMyProducts(products) {
    const grid = document.getElementById('pgrid');
    if (!grid) return;

    const active  = products.filter(p => p.status !== 'sold');
    const countEl = document.getElementById('listingsCount');
    if (countEl) countEl.innerHTML = `You have <strong>${active.length}</strong> active listing${active.length !== 1 ? 's' : ''}`;

    grid.innerHTML = active.length === 0
        ? '<div class="empty-state">No active items yet. <a href="/sell">Start selling</a></div>'
        : active.map(p => {
            const isDeleted = p.status === 'deleted_by_admin';
            return `
            <div class="pc" ${isDeleted ? 'style="opacity:0.6"' : 'onclick="window.location.href=\'/browse\'"'}>
                <div class="pimg">${productThumb(p)}
                    <span class="pcond ${isDeleted ? 'r' : 'n'}" ${isDeleted ? 'style="background:#fee2e2; color:#991b1b; padding: 2px 8px; border-radius:12px; font-weight:bold; font-size:0.75rem;"' : ''}>${isDeleted ? 'Deleted by Admin' : 'Active'}</span>
                    <button class="p-wish-btn"
                            title="Delete Listing"
                            style="color:#ef4444; background:#fff0f3; border-color:#fecdd3; display:flex; align-items:center; justify-content:center;"
                            onclick="event.stopPropagation(); window.deleteProduct('${p._id}')">
                        <img src="../assets/icons/trash.svg" alt="Delete" style="width:18px;height:18px;pointer-events:none">
                    </button>
                </div>
                <div class="pbody">
                    <div class="pcat">${p.category}</div>
                    <div class="ctitle">${p.title}</div>
                    <div class="pmeta"><span>🕒 ${new Date(p.createdAt).toLocaleDateString()}</span></div>
                    <div class="pprice">₹${p.price.toLocaleString('en-IN')}</div>
                    ${!isDeleted ? `
                    <div class="p-actions" style="margin-top:10px; display:flex; gap:8px">
                        <button class="btn btn-blue"
                                onclick="event.stopPropagation(); window.markAsSold('${p._id}')"
                                style="flex:1; font-size:0.75rem">
                            Mark Sold
                        </button>
                        <button class="btn btn-outline"
                                onclick="event.stopPropagation(); window.location.href='/sell?edit=${p._id}'"
                                title="Edit listing"
                                style="font-size:0.75rem; padding:0 12px; display:flex; align-items:center; gap:4px">
                            ✏️
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `}).join('');
}

// ─── SOLD TAB ─────────────────────────────────────────────────────────────────
function renderSoldTab() {
    const grid = document.getElementById('sgrid');
    if (!grid) return;

    const sold  = myProducts.filter(p => p.status === 'sold');
    const count = document.getElementById('soldCount');
    if (count) count.innerHTML = `<strong>${sold.length}</strong> item${sold.length !== 1 ? 's' : ''} sold`;

    grid.innerHTML = sold.length === 0
        ? '<div class="empty-state" style="grid-column:1/-1">🤝<h3>No items sold yet</h3></div>'
        : sold.map(p => `
            <div class="pc sold-pc">
                <div class="pimg" style="filter:grayscale(0.5); opacity:0.8;">
                    ${productThumb(p)}
                    <span class="pcond r">Sold</span>
                </div>
                <div class="pbody">
                    <div class="pcat">${p.category}</div>
                    <div class="ctitle">${p.title}</div>
                    <div class="pmeta"><span>🕒 Sold on ${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span></div>
                    <div class="pprice">₹${p.price.toLocaleString('en-IN')}</div>
                </div>
            </div>
        `).join('');
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function renderOrdersTab() {
    const grid = document.getElementById('ogrid');
    if (!grid) return;
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">📦<h3>Order history coming soon</h3></div>';
}

// ─── WISHLIST TAB ─────────────────────────────────────────────────────────────
async function loadAndRenderWishlist() {
    const grid = document.getElementById('wgrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state">Loading wishlist...</div>';

    try {
        const list = await apiService.fetchWishlist(TOKEN);
        renderWishlistTab(list);
        updateWishBadge(list.length);
    } catch {
        grid.innerHTML = '<div class="empty-state">Failed to load wishlist.</div>';
    }
}

function renderWishlistTab(list) {
    const grid  = document.getElementById('wgrid');
    if (!grid) return;

    const count = document.getElementById('wishlistCount');
    if (count) count.innerHTML = `<strong>${list.length}</strong> saved item${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">❤️<h3>No saved items yet</h3><a href="/browse" class="browse-btn">🏪 Browse Items</a></div>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="pc" id="wc-${p._id}">
            <div class="pimg">
                ${getEmoji(p.category)}
                <span class="pcond u">${p.condition || 'Used'}</span>
                <button class="p-wish-btn active" title="Remove" onclick="window.removeWish('${p._id}')">❤️</button>
            </div>
            <div class="pbody">
                <div class="pcat">${p.category || 'General'}</div>
                <div class="ctitle">${p.title}</div>
                <div class="pprice">₹${p.price?.toLocaleString('en-IN') ?? '—'}</div>
            </div>
            <div class="p-actions" style="padding:14px; padding-top:0; display:flex; gap:10px">
                <button class="btn btn-blue" onclick="window.location.href='/browse'" style="flex:1; font-size:0.75rem">View Item</button>
                <button class="btn btn-danger" onclick="window.removeWish('${p._id}')" style="font-size:0.75rem; background:#fee2e2; color:#ef4444; border:1px solid #fecaca; padding:0 12px">Remove</button>
            </div>
        </div>
    `).join('');
}

window.removeWish = async (productId) => {
    try {
        await apiService.syncWishlist(productId, false, TOKEN);
        document.getElementById(`wc-${productId}`)?.remove();
        const remaining = document.querySelectorAll('#wgrid .pc').length;
        updateWishBadge(remaining);
        const count = document.getElementById('wishlistCount');
        if (count) count.innerHTML = `<strong>${remaining}</strong> saved item${remaining !== 1 ? 's' : ''}`;
        if (remaining === 0) {
            document.getElementById('wgrid').innerHTML = '<div class="empty-state" style="grid-column:1/-1">❤️<h3>No saved items yet</h3><a href="/browse" class="browse-btn">🏪 Browse Items</a></div>';
        }
        window.showToast?.('Removed from wishlist', 'info');
    } catch {
        window.showToast?.('Failed to remove from wishlist', 'error');
    }
};

// ─── SORT ─────────────────────────────────────────────────────────────────────
window.toggleSort = () => {
    document.querySelector('.sort-menu')?.classList.toggle('open');
};

window.setSort = (el, value, label) => {
    currentSort = label;
    document.querySelectorAll('.sort-opt').forEach(opt => opt.classList.toggle('active', opt === el));
    const sortLbl = document.getElementById('sortLbl');
    if (sortLbl) sortLbl.textContent = label;
    applySortAndRender();
    document.querySelector('.sort-menu')?.classList.remove('open');
};

// ─── PRODUCT ACTIONS ──────────────────────────────────────────────────────────
window.markAsSold = async (id) => {
    if (!confirm('Mark this item as sold?')) return;
    try {
        await apiService.updateStatus(id, 'sold', TOKEN);
        await refreshProducts();
    } catch (err) {
        console.error('[dashboard] markAsSold failed:', err);
        window.showToast?.('Failed to mark as sold: ' + err.message, 'error');
    }
};

window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
        await apiService.delete(id, TOKEN);
        await refreshProducts();
    } catch (err) {
        console.error('[dashboard] deleteProduct failed:', err);
        window.showToast?.('Delete failed: ' + err.message, 'error');
    }
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function updateWishBadge(count) {
    const badge = document.getElementById('wishBadge');
    if (!badge) return;
    badge.textContent = count || '';
    badge.classList.toggle('visible', count > 0);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initToast();

    const hdrContainer = document.getElementById('page-header-root');
    if (hdrContainer) {
        hdrContainer.innerHTML = PageHeader({
            title: 'My Dashboard',
            description: 'Track your selling activity.',
            breadcrumbText: 'My Dashboard',
            actionText: '✚ Sell an Item',
            actionUrl: '/sell',
            showAction: true
        });
    }

    const sortRoot = document.getElementById('sort-root');
    if (sortRoot) {
        sortRoot.innerHTML = SortDropdown({ defaultActiveLabel: currentSort });
    }

    await refreshProducts();

    // Load wishlist badge count from backend
    try {
        const activity = await apiService.fetchActivity(TOKEN);
        updateWishBadge((activity.wishlisted || []).length);
    } catch { /* non-fatal */ }

    // Handle ?tab= URL param
    const urlTab    = new URLSearchParams(window.location.search).get('tab');
    const validTabs = ['listings', 'wishlist', 'sold', 'orders'];
    window.switchTab(validTabs.includes(urlTab) ? urlTab : 'listings');
});
