import {
    fetchPendingListings,
    approveListing,
    fetchUsers,
    fetchStats
} from '../api/adminApi.js';
import { logout, getUserInfo } from '../api/authApi.js';
import { initNavigation } from '../utils/navigation-utils.js';

const userInfo = getUserInfo();

// Redirect if not admin
if (!userInfo || userInfo.role !== 'admin') {
    window.location.href = userInfo ? '/dashboard' : '/auth';
}

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
    listings: 'Listings pending approval',
    reports: '8 open user reports',
    spam: 'AI-powered fraud detection',
    users: 'Manage all student accounts',
    categories: 'Manage listing categories',
    transactions: 'All platform transactions',
    settings: 'Platform configuration',
    logs: 'System and admin activity'
};

// UI Handling
window.show = (id, linkEl) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('panel-' + id);
    if (el) el.classList.add('active');

    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');

    const tbTitle = document.getElementById('tbTitle');
    const tbSub = document.getElementById('tbSub');
    if (tbTitle) tbTitle.textContent = titles[id] || id;
    if (tbSub) tbSub.textContent = subs[id] || '';

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'analytics' || id === 'dashboard') buildCharts();
};

window.showToast = (msg, type = 'success') => {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (m) m.textContent = msg;
    if (t) {
        t.className = `toast ${type} show`;
        const icon = t.querySelector('i');
        if (icon) icon.textContent = type === 'success' ? '✔' : type === 'warn' ? '⚠' : '✖';
        clearTimeout(t._t);
        t._t = setTimeout(() => t.classList.remove('show'), 3200);
    }
};

window.handleApprove = async (id, approve) => {
    try {
        const response = await approveListing(id, approve, userInfo.token);
        if (response.ok) {
            window.showToast(approve ? 'Listing approved!' : 'Listing rejected');
            await loadPending();
        }
    } catch (error) {
        console.error('Error approving listing:', error);
    }
};


window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
};


// Data Loading
async function loadPending() {
    try {
        const listings = await fetchPendingListings(userInfo.token);
        renderListingsQueue(listings);
    } catch (err) { console.error(err); }
}

function renderListingsQueue(listings) {
    const queue = document.getElementById('modQueue');
    if (!queue) return;

    const tbSub = document.getElementById('tbSub');
    if (tbSub) tbSub.textContent = `${listings.length} listings pending approval`;

    queue.innerHTML = listings.length === 0 ? '<div class="empty-state">No pending listings</div>' : listings.map(l => `
        <div class="mod-card" id="${l._id}">
            <div class="mc-head">
                <div class="mc-icon">🏢</div>
                <div class="mc-info">
                    <div class="mc-title">${l.title}</div>
                    <div class="mc-meta">₹${l.price} · ${l.category} · By ${l.seller?.name || 'Unknown'}</div>
                </div>
                <div class="mc-status">Pending</div>
            </div>
            <div class="mc-body">${l.description}</div>
            <div class="mc-foot">
                <button class="btn-approve" onclick="window.handleApprove('${l._id}', true)">✔ Approve</button>
                <button class="btn-reject" onclick="window.handleApprove('${l._id}', false)">✕ Reject</button>
            </div>
        </div>
    `).join('');
}

async function loadUsers() {
    try {
        const users = await fetchUsers(userInfo.token);
        renderUsersTable(users);
    } catch (err) { console.error(err); }
}

function renderUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td><input type="checkbox"></td>
            <td class="cell-name">${u.name}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="row-actions">
                    <button class="ra-btn" title="Edit">✏️</button>
                    <button class="ra-btn ra-warn" title="Ban">🚫</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadStats() {
    try {
        const stats = await fetchStats(userInfo.token);
        const u = document.getElementById('stat-users');
        const l = document.getElementById('stat-listings');
        const v = document.getElementById('stat-volume');
        const p = document.getElementById('stat-pending');

        if (u) animateCounter(u, stats.totalUsers);
        if (l) animateCounter(l, stats.liveListings);
        if (v) v.textContent = `₹${stats.totalVolume.toLocaleString('en-IN')}`;
        if (p) animateCounter(p, stats.pendingListings);
    } catch (err) { console.error(err); }
}

// Charts
function buildBarChart(chartId, labelsId, data, labels, color) {
    const chart = document.getElementById(chartId);
    const lbls = document.getElementById(labelsId);
    if (!chart) return;
    const max = Math.max(...data);
    chart.innerHTML = data.map((v, i) => `<div class="mc-bar" style="height:${(v / max) * 100}%;background:${color};min-height:6px"><div class="mc-tip">${v}</div></div>`).join('');
    if (lbls) lbls.innerHTML = labels.map(l => `<div class="mc-lbl">${l}</div>`).join('');
}

function buildCharts() {
    buildBarChart('regChart', 'regLabels', [12, 18, 8, 24, 14, 19, 32], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'var(--pri)');
    buildBarChart('dauChart', 'dauLabels', [180, 240, 190, 310, 280, 350, 420], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'var(--acc-green)');
}

function animateCounter(el, target) {
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString('en-IN');
        if (cur >= target) clearInterval(t);
    }, 30);
}


window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    if (userInfo) {
        loadPending();
        loadUsers();
        loadStats();
        buildCharts();
        window.show('dashboard', document.querySelector('.sb-link.active'));
    }
});
