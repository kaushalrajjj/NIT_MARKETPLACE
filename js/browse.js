// Theme
const html = document.documentElement;
let dark = localStorage.getItem('theme') === 'dark';
const themeBtn = document.getElementById('themeBtn');
const themeIco = document.getElementById('themeIco');

function applyTheme() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeIco.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme();
themeBtn.addEventListener('click', () => {
    dark = !dark;
    applyTheme();
});

// Modal
function openModal(title, emoji, price, location, condition, desc) {
    document.getElementById('qvTitle').textContent = title;
    document.getElementById('qvEmoji').textContent = emoji;
    document.getElementById('qvPrice').textContent = price;
    document.getElementById('qvDesc').textContent = desc;
    document.getElementById('qvInfoRows').innerHTML = `
      <div class="modal-info-row"><span class="key">Condition</span><span class="val">${condition}</span></div>
      <div class="modal-info-row"><span class="key">Location</span><span class="val">${location}</span></div>
      <div class="modal-info-row"><span class="key">Payment</span><span class="val">UPI · Razorpay · Cash</span></div>
      <div class="modal-info-row"><span class="key">Availability</span><span class="val" style="color:var(--acc-green)">✔ Available Now</span></div>
    `;
    document.getElementById('qvModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('qvModal').classList.remove('open');
    document.body.style.overflow = '';
}
document.getElementById('qvModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

// Wishlist toggle
document.querySelectorAll('.p-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const i = btn.querySelector('i');
        i.className = btn.classList.contains('active') ? 'fa-solid fa_heart' : 'fa-regular fa-heart';
    });
});

// View toggle
function setView(v) {
    const grid = document.getElementById('productsGrid');
    const gbtn = document.getElementById('gridViewBtn');
    const lbtn = document.getElementById('listViewBtn');
    if (v === 'grid') {
        grid.classList.remove('list-view');
        gbtn.classList.add('active');
        lbtn.classList.remove('active');
    } else {
        grid.classList.add('list-view');
        lbtn.classList.add('active');
        gbtn.classList.remove('active');
    }
}

// Filter drawer (mobile)
function openFilterDrawer() {
    document.getElementById('filterDrawer').classList.add('open');
    document.getElementById('filterOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Clone sidebar content into drawer
    const sidebarContent = document.getElementById('filterSidebar').innerHTML;
    document.getElementById('drawerFilters').innerHTML = sidebarContent;
}

function closeFilterDrawer() {
    document.getElementById('filterDrawer').classList.remove('open');
    document.getElementById('filterOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

// Category filter
function setCat(el, cat) {
    document.querySelectorAll('.cat-filter-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    updateChips();
}

// Price range
function updatePriceRange(val) {
    const num = parseInt(val).toLocaleString('en-IN');
    document.getElementById('priceRangeLabel').textContent = '₹' + num;
    document.getElementById('priceMax').value = val;
}

// Section toggle
function toggleSection(el) {
    el.classList.toggle('collapsed');
    const content = el.nextElementSibling;
    if (content) {
        content.style.display = el.classList.contains('collapsed') ? 'none' : '';
    }
}

// Page header tabs
function setPhTab(el, cat) {
    document.querySelectorAll('.ph-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filterByCategory(cat);
}

// Filter logic (demo)
function filterByCategory(cat) {
    const cards = document.querySelectorAll('.product-card');
    let count = 0;
    cards.forEach(card => {
        const catEl = card.querySelector('.p-cat');
        if (!catEl) return;
        const cardCat = catEl.textContent.toLowerCase();
        const show = cat === 'all' ||
            (cat === 'books' && cardCat.includes('book')) ||
            (cat === 'electronics' && cardCat.includes('electronic')) ||
            (cat === 'hostel' && cardCat.includes('hostel')) ||
            (cat === 'cycles' && cardCat.includes('rental')) ||
            (cat === 'tools' && cardCat.includes('academic')) ||
            (cat === 'rent' && cardCat.includes('rental'));
        card.style.display = show ? '' : 'none';
        if (show) count++;
    });
    document.getElementById('resultsCount').textContent = count;
}

// Search
function handleSearch(val) {
    const cards = document.querySelectorAll('.product-card');
    let count = 0;
    cards.forEach(card => {
        const title = card.querySelector('.p-title')?.textContent.toLowerCase() || '';
        const show = title.includes(val.toLowerCase());
        card.style.display = show ? '' : 'none';
        if (show) count++;
    });
    document.getElementById('resultsCount').textContent = count;
}

// Sort (demo)
function applySort(val) {
    console.log('Sort by:', val);
}

// Apply filters (demo)
function applyFilters() {
    console.log('Filters applied');
}

// Reset filters
function resetFilters() {
    document.querySelectorAll('.cat-filter-item').forEach((el, i) => el.classList.toggle('active', i === 0));
    document.getElementById('priceMin').value = 0;
    document.getElementById('priceMax').value = 50000;
    document.getElementById('priceRange').value = 30000;
    document.getElementById('priceRangeLabel').textContent = '₹30,000';
    document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => cb.checked = true);
    document.getElementById('resultsCount').textContent = 48;
    document.querySelectorAll('.product-card').forEach(c => c.style.display = '');
    document.getElementById('mainSearch').value = '';
}

// Chips
function updateChips() {
    const active = document.querySelector('.cat-filter-item.active .cat-filter-name');
    const chips = document.getElementById('activeFilters');
    if (active) {
        chips.innerHTML = `
        <span class="filter-chip">${active.textContent} <i class="fa-solid fa_xmark"></i></span>
        <span class="filter-chip">New & Used <i class="fa-solid fa_xmark"></i></span>
      `;
    }
}

// Pagination (demo)
function gotoPage(n) {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Profile Dropdown
function toggleProf() {
    document.getElementById('dropdownMenu').classList.toggle('open');
}

// Close dropdown on outside click
window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
        const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) dropdown.classList.remove('open');
    }
});
