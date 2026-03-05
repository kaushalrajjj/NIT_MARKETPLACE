import { fetchMyProducts, markAsSold, deleteProduct } from '../api/productApi.js';
import { getUserInfo, logout } from '../api/authApi.js';
import { getEmoji } from '../utils/helpers.js';
import { initNavigation } from '../utils/navigation-utils.js';

const userInfo = getUserInfo();
if (!userInfo) window.location.href = '/auth';

let myProducts = [];
let currentSort = 'Newest First';

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
    document.getElementById('resCount').innerHTML = `You have <strong>${products.length}</strong> listings`;

    grid.innerHTML = products.length === 0 ? '<div class="empty-state">No items yet. <a href="/sell">Start selling</a></div>' : products.map(p => `
        <div class="pc">
            <div class="pimg">${getEmoji(p.category)}
                <span class="pcond ${p.status === 'sold' ? 'r' : 'n'}">${p.status === 'sold' ? 'Sold' : 'Active'}</span>
            </div>
            <div class="pbody">
                <div class="pcat">${p.category}</div>
                <div class="ctitle">${p.title}</div>
                <div class="pmeta">
                    <span><i class="fa-solid fa-clock"></i> ${new Date(p.createdAt).toLocaleDateString()}</span>
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

// Global Exports
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

window.logout = logout;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    refreshProducts();
});

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
