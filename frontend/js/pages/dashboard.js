import { fetchMyProducts, markAsSold, deleteProduct } from '../api/productApi.js';
import { getUserInfo, logout } from '../api/authApi.js';
import { getEmoji } from '../utils/helpers.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { getWishlist, removeFromWishlist } from '../utils/wishlist-utils.js';
import { PageHeader } from '../../components/PageHeader.js';

const userInfo = getUserInfo();
if (!userInfo) window.location.href = '/auth';

let myProducts = [];
let currentSort = 'Newest First';
let activeTab = 'listings'; // 'listings' | 'wishlist'

// ─── TAB SWITCHING ─────────────────────────────────────────────────────────────

window.switchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.dash-tab[data-tab="${tab}"]`)?.classList.add('active');

    document.getElementById('listingsSection').style.display = tab === 'listings' ? '' : 'none';
    document.getElementById('wishlistSection').style.display = tab === 'wishlist' ? '' : 'none';

    if (tab === 'wishlist') renderWishlistTab();
};

// ─── MY LISTINGS ───────────────────────────────────────────────────────────────

async function refreshProducts() {
    try {
        const products = await fetchMyProducts(userInfo.token);
        myProducts = products;
        applySortAndRender();
    } catch (error) {
        console.error('Error fetching my products:', error);
    }
}

function applySortAndRender() {
    let sortedProducts = [...myProducts];
    if (currentSort === 'Newest First') {
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'Price: Low to High') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'Price: High to Low') {
        sortedProducts.sort((a, b) => b.price - a.price);
    }
    renderMyProducts(sortedProducts);
}

function renderMyProducts(products) {
    const grid = document.getElementById('pgrid');
    if (!grid) return;
    document.getElementById('listingsCount').innerHTML = `You have <strong>${products.length}</strong> listing${products.length !== 1 ? 's' : ''}`;

    grid.innerHTML = products.length === 0 ? '<div class="empty-state">No items yet. <a href="/sell">Start selling</a></div>' : products.map(p => `
        <div class="pc">
            <div class="pimg">${getEmoji(p.category)}
                <span class="pcond ${p.status === 'sold' ? 'r' : 'n'}">${p.status === 'sold' ? 'Sold' : 'Active'}</span>
            </div>
            <div class="pbody">
                <div class="pcat">${p.category}</div>
                <div class="ctitle">${p.title}</div>
                <div class="pmeta">
                    <span>🕒 ${new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="pprice">₹${p.price}</div>
                <div class="p-actions" style="margin-top:10px; display:flex; gap:10px">
                    ${p.status !== 'sold' ? `<button class="btn btn-blue" onclick="window.markAsSold('${p._id}')" style="flex:1; font-size:0.75rem">Mark Sold</button>` : ''}
                    <button class="btn btn-danger" onclick="window.deleteProduct('${p._id}')" style="flex:1; font-size:0.75rem; background:#fee2e2; color:#ef4444; border:1px solid #fecaca">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── WISHLIST TAB ──────────────────────────────────────────────────────────────

function renderWishlistTab() {
    const list = getWishlist();
    const grid = document.getElementById('wgrid');
    const count = document.getElementById('wishlistCount');
    if (!grid) return;

    if (count) count.innerHTML = `<strong>${list.length}</strong> saved item${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                ❤️
                <h3>No saved items yet</h3>
                <p>Browse products and click the ♡ to save them here.</p>
                <a href="/browse" class="browse-btn">🏪 Browse Items</a>
            </div>`;
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="pc" id="wc-${p._id}">
            <div class="pimg">
                ${getEmoji(p.category)}
                <span class="pcond">${p.condition || 'Used'}</span>
                <button class="premove" title="Remove from saved" onclick="removeWish('${p._id}')">
                    💔
                </button>
            </div>
            <div class="pbody">
                <div class="pcat">${p.category || 'General'}</div>
                <div class="ctitle">${p.title}</div>
                <div class="pmeta">
                    <span>📍 ${p.location || 'NIT KKR'}</span>
                </div>
                <div class="pprice">₹${p.price?.toLocaleString('en-IN') ?? '—'}</div>
            </div>
            <div class="pfoot">
                <a href="/browse" class="pbtn pbtn-contact" style="text-decoration:none;">
                    🏪 Browse
                </a>
                <button class="pbtn pbtn-view" onclick="removeWish('${p._id}')">
                    💔
                </button>
            </div>
        </div>
    `).join('');
}

window.removeWish = (id) => {
    removeFromWishlist(id);
    renderWishlistTab();
};

// Listen for wishlist changes from browse page
window.addEventListener('wishlistChanged', () => {
    if (activeTab === 'wishlist') renderWishlistTab();
});

// ─── GLOBAL EXPORTS ────────────────────────────────────────────────────────────

window.toggleSort = () => {
    const menu = document.querySelector('.sort-menu');
    if (menu) menu.classList.toggle('open');
};

window.setSort = (el, type) => {
    document.querySelectorAll('.sort-opt').forEach(opt => opt.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('sortLbl').textContent = type;

    currentSort = type;
    const menu = document.querySelector('.sort-menu');
    if (menu) menu.classList.remove('open');

    applySortAndRender();
};

window.setView = (type) => {
    const grid = document.getElementById('pgrid');
    const gbtn = document.getElementById('gvBtn');
    const lbtn = document.getElementById('lvBtn');

    if (type === 'g') {
        grid.classList.remove('lv');
        if (gbtn) gbtn.classList.add('active');
        if (lbtn) lbtn.classList.remove('active');
    } else {
        grid.classList.add('lv');
        if (lbtn) lbtn.classList.add('active');
        if (gbtn) gbtn.classList.remove('active');
    }
};

window.markAsSold = async (id) => {
    if (!confirm('Mark this item as sold?')) return;
    try {
        const res = await markAsSold(id, userInfo.token);
        if (res.ok) { refreshProducts(); }
    } catch (err) { console.error(err); }
};

window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
        const res = await deleteProduct(id, userInfo.token);
        if (res.ok) { refreshProducts(); }
    } catch (err) { console.error(err); }
};


document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Inject Page Header
    const hdrContainer = document.getElementById('page-header-root');
    if (hdrContainer) {
        hdrContainer.innerHTML = PageHeader({
            title: 'My Dashboard',
            description: 'Track your selling activity and manage your listings.',
            breadcrumbText: 'My Dashboard',
            actionText: '✚ Sell an Item',
            actionUrl: '/sell',
            showAction: true
        });
    }

    refreshProducts();
    updateWishBadge();
});

function updateWishBadge() {
    const badge = document.getElementById('wishBadge');
    if (!badge) return;
    const count = getWishlist().length;
    badge.textContent = count || '';
    badge.classList.toggle('visible', count > 0);
}

window.addEventListener('wishlistChanged', updateWishBadge);


window.addEventListener('click', e => {
    if (!e.target.closest('.profile-dropdown')) {
        const pd = document.getElementById('dropdownMenu');
        if (pd) pd.classList.remove('open');
    }
    if (!e.target.closest('.sort-wrap')) {
        const sm = document.querySelector('.sort-menu');
        if (sm) sm.classList.remove('open');
    }
});
