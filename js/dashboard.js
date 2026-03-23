/* Dark mode */
const html = document.documentElement;
let dark = localStorage.getItem('theme') === 'dark';
const tt = document.getElementById('themeToggle');
const ti = document.getElementById('themeIcon');

function applyTheme() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (ti) ti.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme();
if (tt) tt.addEventListener('click', () => {
    dark = !dark;
    applyTheme();
});

/* Sidebar */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('mo');
}

/* Category filter */
function filterCat(el, cat) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.pc').forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
    });
    updCount();
}

/* Search */
function doSearch() {
    const q = document.getElementById('mainSearch').value.toLowerCase();
    document.querySelectorAll('.pc').forEach(c => {
        const t = c.querySelector('.ctitle').textContent.toLowerCase();
        c.style.display = (!q || t.includes(q)) ? '' : 'none';
    });
    updCount();
}

function updCount() {
    const pcElements = document.querySelectorAll('.pc');
    const v = [...pcElements].filter(c => c.style.display !== 'none').length;
    const resCount = document.getElementById('resCount');
    if (resCount) resCount.innerHTML = `Showing <strong>${v}</strong> of <strong>2,440</strong>`;
}

/* Filter group toggle */
function tg(el) {
    el.classList.toggle('c');
    if (el.nextElementSibling) el.nextElementSibling.classList.toggle('h');
}

/* Clear filters */
function clearFilters() {
    document.querySelectorAll('.fg input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.pc').forEach(c => c.style.display = '');
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    const firstPill = document.querySelector('.cat-pill');
    if (firstPill) firstPill.classList.add('active');
    updCount();
}

/* Price slider */
function updSlider(el) {
    const v = parseInt(el.value);
    const sval = document.getElementById('sval');
    if (sval) sval.textContent = '₹' + v.toLocaleString('en-IN');
    const pct = (v / 50000) * 100;
    el.style.background = `linear-gradient(90deg,var(--pri) ${pct}%,var(--border) ${pct}%)`;
}

/* Sort */
function toggleSort() {
    const sw = document.getElementById('sw');
    if (sw) sw.classList.toggle('open');
}

function setSort(el, lbl) {
    document.querySelectorAll('.sort-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    const sortLbl = document.getElementById('sortLbl');
    if (sortLbl) sortLbl.textContent = lbl;
    const sw = document.getElementById('sw');
    if (sw) sw.classList.remove('open');
}

/* View */
function setView(v) {
    const g = document.getElementById('pgrid');
    const gvBtn = document.getElementById('gvBtn');
    const lvBtn = document.getElementById('lvBtn');
    if (gvBtn) gvBtn.classList.toggle('active', v === 'g');
    if (lvBtn) lvBtn.classList.toggle('active', v === 'l');
    if (g) g.classList.toggle('lv', v === 'l');
}

/* Wishlist */
function tw(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (icon) icon.className = btn.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

/* Pagination */
function goPage(btn) {
    document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('active'));
    if (!btn.querySelector('i')) btn.classList.add('active');
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* Modal */
function openM(title, cat, price, desc, emoji, av, sname, smeta) {
    const mtitle = document.getElementById('mtitle');
    const mcat = document.getElementById('mcat');
    const mprice = document.getElementById('mprice');
    const mdesc = document.getElementById('mdesc');
    const msav = document.getElementById('msav');
    const msn = document.getElementById('msn');
    const msmeta = document.getElementById('msmeta');
    const mimg = document.getElementById('mimg');

    if (mtitle) mtitle.textContent = title;
    if (mcat) mcat.textContent = cat;
    if (mprice) mprice.textContent = price;
    if (mdesc) mdesc.textContent = desc;
    if (mimg && mimg.firstChild) mimg.firstChild.textContent = emoji;
    if (msav) msav.textContent = av;
    if (msn) msn.textContent = sname;
    if (msmeta) msmeta.textContent = smeta;

    const mo = document.getElementById('mo');
    if (mo) {
        mo.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeMO(e) {
    if (e.target === document.getElementById('mo')) closeModal();
}

function closeModal() {
    const mo = document.getElementById('mo');
    if (mo) {
        mo.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function twModal() {
    const i = document.getElementById('mwi');
    if (i) i.className = i.className.includes('regular') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

/* Scroll top */
const stb = document.getElementById('stb');
if (stb) window.addEventListener('scroll', () => stb.classList.toggle('vis', window.scrollY > 400));

// Profile Dropdown
function toggleProf() {
    const dm = document.getElementById('dropdownMenu');
    if (dm) dm.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.profile-dropdown')) {
        const pd = document.getElementById('dropdownMenu');
        if (pd) pd.classList.remove('open');
    }
});
