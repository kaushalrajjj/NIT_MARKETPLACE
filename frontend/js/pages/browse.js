import { fetchProducts as fetchProductsApi } from '../api/productApi.js';
import { getUserInfo } from '../api/authApi.js';
import { getEmoji, applyTheme, toggleTheme } from '../utils/helpers.js';
import { renderProductCard } from '../../components/productCard.js';
import { initNavigation } from '../utils/navigation-utils.js';

let allProducts = [];
let currentPage = 1;
const itemsPerPage = 1000; // Legacy setting
let totalItems = 0;
let searchQuery = '';
const userInfo = getUserInfo();

// Theme Initialization
const isDark = localStorage.getItem('theme') === 'dark';
applyTheme(isDark);

window.toggleTheme = toggleTheme;

// Fetch and Render Products
async function fetchProducts(queryParams = '') {
    try {
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<div class="loading-state">Loading products...</div>';

        const params = new URLSearchParams(queryParams);
        if (!params.has('page')) params.set('page', currentPage);
        if (!params.has('limit')) params.set('limit', itemsPerPage);
        if (searchQuery) params.set('search', searchQuery);

        const data = await fetchProductsApi(params.toString());

        allProducts = data.products;
        totalItems = data.total;

        renderProducts(allProducts);
        renderActiveFilters();
    } catch (error) {
        console.error('Error fetching products:', error);
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<div class="error-state">Error loading products. Please try again.</div>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const resCount = document.getElementById('resultsCount');
    if (resCount) resCount.textContent = totalItems;

    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state">No products found matching your criteria.</div>';
        return;
    }

    grid.innerHTML = products.map(p => renderProductCard(p, true)).join('');
}

// Global Filtering Functions for legacy HTML onclick
let selectedCategory = 'all';
let currentSort = 'newest';

window.setCat = (el, cat) => {
    document.querySelectorAll('.cat-filter-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
    selectedCategory = cat;

    document.querySelectorAll('.ph-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(cat.toLowerCase()) || (cat === 'all' && tab.textContent === 'All Items')) {
            tab.classList.add('active');
        }
    });

    currentPage = 1;
    applyFilters();
};

window.setPhTab = (el, cat) => {
    document.querySelectorAll('.ph-tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');
    selectedCategory = cat;

    document.querySelectorAll('.cat-filter-item').forEach(item => {
        item.classList.remove('active');
        const name = item.querySelector('.cat-filter-name')?.textContent.toLowerCase() || '';
        if (name.includes(cat.toLowerCase()) || (cat === 'all' && name.includes('all'))) {
            item.classList.add('active');
        }
    });

    currentPage = 1;
    applyFilters();
};

window.applySort = (val) => {
    currentSort = val;
    currentPage = 1;
    applyFilters();
};

window.applyFilters = () => {
    const minPrice = document.getElementById('priceMin').value;
    const maxPrice = document.getElementById('priceMax').value;
    const location = document.getElementById('locationFilter').value;
    const minRating = document.querySelector('input[name="minRating"]:checked')?.value || '0';

    const conditions = Array.from(document.querySelectorAll('input[name="condition"]:checked'))
        .map(cb => cb.value)
        .join(',');

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (minPrice && minPrice != 0) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minRating && minRating !== '0') params.set('minRating', minRating);
    if (conditions) params.set('condition', conditions);
    if (location && location !== 'All Locations') params.set('location', location);
    if (currentSort) params.set('sortBy', currentSort);
    params.set('page', currentPage);

    fetchProducts(params.toString());
};

window.resetFilters = () => {
    selectedCategory = 'all';
    currentPage = 1;
    searchQuery = '';
    const mainSearch = document.getElementById('mainSearch');
    if (mainSearch) mainSearch.value = '';

    document.querySelectorAll('.cat-filter-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('.cat-filter-name')?.textContent.toLowerCase().includes('all')) item.classList.add('active');
    });

    document.querySelectorAll('.ph-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === 'All Items') tab.classList.add('active');
    });

    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('locationFilter').value = 'All Locations';
    document.querySelector('input[name="minRating"][value="0"]').checked = true;
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = true);

    fetchProducts();
};

function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    let html = '';
    if (selectedCategory !== 'all') {
        html += `<span class="filter-chip">${selectedCategory} <i class="fa-solid fa-xmark" onclick="setCat(null, 'all')"></i></span>`;
    }

    const min = document.getElementById('priceMin').value;
    const max = document.getElementById('priceMax').value;
    if (min || max) {
        html += `<span class="filter-chip">₹${min || '0'} - ₹${max || 'Any'} <i class="fa-solid fa-xmark" onclick="resetPrice()"></i></span>`;
    }

    const minRating = document.querySelector('input[name="minRating"]:checked')?.value || '0';
    if (minRating !== '0') {
        html += `<span class="filter-chip">${minRating}+ Stars <i class="fa-solid fa-xmark" onclick="resetRating()"></i></span>`;
    }

    if (searchQuery) {
        html += `<span class="filter-chip">Search: ${searchQuery} <i class="fa-solid fa-xmark" onclick="clearSearch()"></i></span>`;
    }

    if (html) {
        html += `<button class="filter-reset" onclick="resetFilters()" style="margin-left:8px">Clear all</button>`;
    }

    container.innerHTML = html;
}

window.resetPrice = () => {
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    window.applyFilters();
};

window.resetRating = () => {
    document.querySelector('input[name="minRating"][value="0"]').checked = true;
    window.applyFilters();
};

window.clearSearch = () => {
    searchQuery = '';
    const mainSearch = document.getElementById('mainSearch');
    if (mainSearch) mainSearch.value = '';
    window.applyFilters();
};

let searchTimeout;
window.handleSearch = (val) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchQuery = val;
        currentPage = 1;
        window.applyFilters();
    }, 500);
};

// Modal Logic
window.openModal = (id) => {
    const p = allProducts.find(x => x._id === id);
    if (!p) return;

    document.getElementById('qvTitle').textContent = p.title;
    document.getElementById('qvEmoji').textContent = getEmoji(p.category);
    document.getElementById('qvPrice').textContent = `₹${p.price.toLocaleString('en-IN')}`;
    document.getElementById('qvDesc').textContent = p.description;

    document.getElementById('qvInfoRows').innerHTML = `
      <div class="modal-info-row"><span class="key">Category</span><span class="val">${p.category}</span></div>
      <div class="modal-info-row"><span class="key">Condition</span><span class="val">${p.condition}</span></div>
      <div class="modal-info-row"><span class="key">Seller</span><span class="val">${p.seller?.name || 'Anonymous'}</span></div>
      <div class="modal-info-row"><span class="key">Location</span><span class="val">${p.location || 'Campus'}</span></div>
      <div class="modal-info-row"><span class="key">Posted</span><span class="val">${new Date(p.createdAt).toLocaleDateString()}</span></div>
      <div class="modal-info-row"><span class="key">Rating</span><span class="val">⭐ ${p.seller?.rating || 'New'} (${p.seller?.reviewCount || 0} reviews)</span></div>
    `;

    const contactActions = document.getElementById('modalContactActions');
    if (contactActions) {
        const existingBox = document.getElementById('qvContactInfoBox');
        if (existingBox) existingBox.remove();

        if (p.seller) {
            const waLink = `https://wa.me/${p.seller.whatsapp}?text=Hi, I am interested in your listing: ${encodeURIComponent(p.title)}`;

            const contactInfoBox = `
                <div class="contact-details-box" id="qvContactInfoBox">
                    <h4><i class="fa-solid fa-address-card"></i> Seller Contact Details</h4>
                    <div class="contact-item"><i class="fa-solid fa-phone"></i><span>${p.seller.phone || 'N/A'}</span></div>
                    <div class="contact-item"><i class="fa-solid fa-envelope"></i><span>${p.seller.email || 'N/A'}</span></div>
                </div>
            `;

            contactActions.insertAdjacentHTML('beforebegin', contactInfoBox);

            contactActions.innerHTML = `
                <a href="tel:${p.seller.phone}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Call</a>
                <a href="${waLink}" target="_blank" class="btn btn-whatsapp"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                <a href="mailto:${p.seller.email}" class="btn btn-outline"><i class="fa-solid fa-envelope"></i> Email</a>
            `;
        } else {
            contactActions.innerHTML = `<div class="empty-state">Seller info unavailable</div>`;
        }
    }

    document.getElementById('qvModal').classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
    const modal = document.getElementById('qvModal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
};

// View Switch
window.setView = (v) => {
    const grid = document.getElementById('productsGrid');
    const gbtn = document.getElementById('gridViewBtn');
    const lbtn = document.getElementById('listViewBtn');
    if (v === 'grid') {
        grid.classList.remove('list-view');
        gbtn?.classList.add('active');
        lbtn?.classList.remove('active');
    } else {
        grid.classList.add('list-view');
        lbtn?.classList.add('active');
        gbtn?.classList.remove('active');
    }
};

// Mobile Drawer
window.openFilterDrawer = () => {
    const overlay = document.getElementById('filterOverlay');
    const drawer = document.getElementById('filterDrawer');
    const sidebarBody = document.querySelector('.filter-sidebar .filter-body');
    const drawerFilters = document.getElementById('drawerFilters');

    if (overlay && drawer) {
        overlay.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (drawerFilters && sidebarBody) {
            drawerFilters.appendChild(sidebarBody);
        }
    }
};

window.closeFilterDrawer = () => {
    const overlay = document.getElementById('filterOverlay');
    const drawer = document.getElementById('filterDrawer');
    const sidebar = document.getElementById('filterSidebar');
    const drawerFilters = document.getElementById('drawerFilters');

    if (overlay && drawer) {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
        if (sidebar && drawerFilters && drawerFilters.firstElementChild) {
            sidebar.appendChild(drawerFilters.firstElementChild);
        }
    }
};

window.toggleSection = (el) => {
    el.classList.toggle('collapsed');
    const body = el.nextElementSibling;
    if (body) {
        body.style.display = el.classList.contains('collapsed') ? 'none' : 'block';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    const params = new URLSearchParams(window.location.search);
    searchQuery = params.get('search') || '';
    if (searchQuery) {
        const sInput = document.getElementById('mainSearch');
        if (sInput) sInput.value = searchQuery;
    }

    fetchProducts(window.location.search.substring(1));
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
        const d = document.getElementById('dropdownMenu');
        if (d) d.classList.remove('open');
    }
    if (e.target === document.getElementById('qvModal')) window.closeModal();
});
