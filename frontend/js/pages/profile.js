import { initNavigation } from '../utils/navigation-utils.js';
import { getUserInfo } from '../api/authApi.js';
import { fetchMyProducts } from '../api/productApi.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    const userInfo = getUserInfo();

    // Populate avatar + name
    if (userInfo) {
        const initial = userInfo.name.charAt(0).toUpperCase();
        document.getElementById('avCircle').textContent = initial;
        document.getElementById('avName').textContent = userInfo.name;
        document.getElementById('avRole').textContent =
            userInfo.role === 'admin' ? 'Administrator' : 'NIT KKR Student';
        document.getElementById('fldName').value = userInfo.name || '';
        document.getElementById('fldEmail').value = userInfo.email || '';
    }

    // Load saved extra fields from localStorage
    const saved = JSON.parse(localStorage.getItem('profileExtra') || '{}');
    if (saved.branch) document.getElementById('fldBranch').value = saved.branch;
    if (saved.year) document.getElementById('fldYear').value = saved.year;
    if (saved.phone) document.getElementById('fldPhone').value = saved.phone;

    // Load dynamic user stats (Listings)
    if (userInfo && userInfo.token) {
        loadUserStats(userInfo.token);
    }
});

async function loadUserStats(token) {
    try {
        const products = await fetchMyProducts(token);
        const activeCount = products.filter(p => p.status !== 'sold').length;
        const soldCount = products.filter(p => p.status === 'sold').length;
        
        // The profile.html contains specific IDs for these stats
        const listingsEl = document.getElementById('statListings');
        const soldEl = document.getElementById('statSold');
        
        if (listingsEl) listingsEl.textContent = products.length; // display total active + sold
        if (soldEl) soldEl.textContent = soldCount;

        renderActivityList(products);
    } catch (err) {
        console.error('Error fetching user stats:', err);
    }
}

function renderActivityList(products) {
    const listEl = document.getElementById('activityList');
    if (!listEl) return;

    if (products.length === 0) {
        listEl.innerHTML = `
            <div class="activity-item">
                <div class="act-icon">🏷️</div>
                <div>
                    <div class="act-text">No recent activity yet.</div>
                    <div class="act-time">Start by posting a listing!</div>
                </div>
            </div>
        `;
        return;
    }

    // Sort by latest first, take top 4
    const recent = [...products].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    listEl.innerHTML = recent.map(p => {
        const isSold = p.status === 'sold';
        return `
            <div class="activity-item">
                <div class="act-icon" style="background:${isSold ? 'var(--acc-green)' : 'var(--pri)'};color:#fff;border:none">
                    ${isSold ? '🤝' : '🏷️'}
                </div>
                <div>
                    <div class="act-text">
                        ${isSold ? 'Sold' : 'Listed'} <strong>${p.title}</strong>
                    </div>
                    <div class="act-time">${new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }).join('');
}

window.saveProfile = function () {
    const extra = {
        branch: document.getElementById('fldBranch').value,
        year: document.getElementById('fldYear').value,
        phone: document.getElementById('fldPhone').value,
    };
    localStorage.setItem('profileExtra', JSON.stringify(extra));
    alert('Profile saved!');
};
