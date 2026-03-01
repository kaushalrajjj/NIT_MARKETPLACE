/* Dark mode — starts dark by default for admin */
const html = document.documentElement;
let dark = localStorage.getItem('theme') === 'light' ? false : true;
const tb = document.getElementById('themeBtn');
const ti = document.getElementById('themeIcon');

function applyTheme() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (ti) ti.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme();
if (tb) tb.addEventListener('click', () => {
    dark = !dark;
    applyTheme();
});

/* Panel navigation */
const titles = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    listings: 'Listings Queue',
    reports: 'Reports',
    spam: 'Spam & Fraud',
    users: 'User Management',
    categories: 'Categories',
    transactions: 'Transactions',
    settings: 'Settings',
    logs: 'Activity Logs'
};
const subs = {
    dashboard: 'Platform overview & live stats',
    analytics: 'Detailed metrics & trends',
    listings: '12 listings pending approval',
    reports: '8 open user reports',
    spam: 'AI-powered fraud detection',
    users: 'Manage all student accounts',
    categories: 'Manage listing categories',
    transactions: 'All platform transactions',
    settings: 'Platform configuration',
    logs: 'System and admin activity'
};

function show(id, linkEl) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('panel-' + id);
    if (el) {
        el.classList.add('active');
    }
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');

    const tbTitle = document.getElementById('tbTitle');
    const tbSub = document.getElementById('tbSub');
    if (tbTitle) tbTitle.textContent = titles[id] || id;
    if (tbSub) tbSub.textContent = subs[id] || '';

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    if (id === 'analytics' || id === 'dashboard') buildCharts();
}

/* Toast */
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (m) m.textContent = msg;
    if (t) {
        t.className = `toast ${type} show`;
        const icon = t.querySelector('i');
        if (icon) icon.className = type === 'success' ? 'fa-solid fa-circle-check' : type === 'warn' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-xmark';
        clearTimeout(t._t);
        t._t = setTimeout(() => t.classList.remove('show'), 3200);
    }
}

/* Confirm modal */
let confirmCallback = null;

function confirmAction(title, body, action, id) {
    const cmTitle = document.getElementById('cmTitle');
    const cmBody = document.getElementById('cmBody');
    if (cmTitle) cmTitle.textContent = title;
    if (cmBody) cmBody.textContent = body;
    confirmCallback = {
        action,
        id
    };
    const cm = document.getElementById('confirmModal');
    if (cm) cm.classList.add('open');
}

function executeConfirm() {
    const cm = document.getElementById('confirmModal');
    if (cm) cm.classList.remove('open');
    if (!confirmCallback) return;
    const {
        action,
        id
    } = confirmCallback;
    if (action === 'ban') showToast(`User ${id} has been suspended`, 'warn');
    else if (action === 'delete') showToast(`Account ${id} permanently deleted`, 'warn');
    else if (action === 'warn') showToast(`Warning sent to user ${id}`, 'success');
    confirmCallback = null;
}

const confirmModal = document.getElementById('confirmModal');
if (confirmModal) {
    confirmModal.addEventListener('click', e => {
        if (e.target === confirmModal) confirmModal.classList.remove('open');
    });
}

/* Listing actions */
function approveListing(id) {
    const card = document.getElementById(id);
    if (!card) return;
    card.style.transition = 'all .3s';
    card.style.opacity = '0';
    card.style.transform = 'translateX(10px)';
    setTimeout(() => {
        card.remove();
        showToast('Listing approved & published!');
    }, 300);
}

function rejectListing(id) {
    const card = document.getElementById(id);
    if (!card) return;
    card.style.transition = 'all .3s';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-10px)';
    setTimeout(() => {
        card.remove();
        showToast('Listing rejected', 'warn');
    }, 300);
}

function approveAll() {
    const queue = document.getElementById('modQueue');
    if (!queue) return;
    [...queue.children].forEach((c, i) => {
        setTimeout(() => {
            c.style.transition = 'all .3s';
            c.style.opacity = '0';
            setTimeout(() => c.remove(), 300);
        }, i * 120);
    });
    setTimeout(() => showToast('All listings approved & published!'), 500);
}

/* Report resolve */
function resolveReport(id, msg) {
    const card = document.getElementById(id);
    if (!card) return;
    card.style.transition = 'all .3s';
    card.style.opacity = '0';
    setTimeout(() => {
        card.remove();
        showToast(msg);
    }, 300);
}

/* Users filter */
function filterUsers(q) {
    const query = q.toLowerCase();
    document.querySelectorAll('#usersTable tbody tr').forEach(row => {
        const nameEl = row.querySelector('.cell-name');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        row.style.display = (!query || name.includes(query)) ? '' : 'none';
    });
}

function selectAllUsers(cb) {
    document.querySelectorAll('#usersTable tbody input[type="checkbox"]').forEach(c => c.checked = cb.checked);
}

/* Bar charts */
function buildCharts() {
    buildBarChart('regChart', 'regLabels', [12, 18, 8, 24, 14, 19, 32], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'var(--pri)');
    buildBarChart('dauChart', 'dauLabels', [180, 240, 190, 310, 280, 350, 420], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'var(--acc-green)');
}

function buildBarChart(chartId, labelsId, data, labels, color) {
    const chart = document.getElementById(chartId);
    const lbls = document.getElementById(labelsId);
    if (!chart) return;
    const max = Math.max(...data);
    chart.innerHTML = data.map((v, i) => `<div class="mc-bar" style="height:${(v / max) * 100}%;background:${color};min-height:6px"><div class="mc-tip">${v}</div></div>`).join('');
    if (lbls) lbls.innerHTML = labels.map(l => `<div class="mc-lbl">${l}</div>`).join('');
}

/* Live counter animation */
function animateCounter(el, target) {
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString('en-IN');
        if (cur >= target) clearInterval(t);
    }, 30);
}

function toggleProf() {
    const dm = document.getElementById('dropdownMenu');
    if (dm) dm.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.profile-dropdown')) {
        const dd = document.getElementById('dropdownMenu');
        if (dd) dd.classList.remove('open');
    }
});

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('open');
}

/* Init */
window.onload = () => {
    buildCharts();
    setTimeout(() => {
        const nums = document.querySelectorAll('.sc-num');
        nums.forEach(n => {
            const raw = n.textContent.replace(/[₹,K+%↑↓ ]/g, '');
            if (!isNaN(raw) && raw.length > 0 && parseInt(raw) < 5000) animateCounter(n, parseInt(raw));
        });
    }, 400);
    // Show dashboard by default
    show('dashboard', document.querySelector('.sb-link.active'));
};
