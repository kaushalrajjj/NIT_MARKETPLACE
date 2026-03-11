import { getNavbarHTML } from '../../components/Navbar.js';
import { getSidebarHTML } from '../../components/Sidebar.js';
import { getFooterHTML } from '../../components/Footer.js';
import { apiService } from '../services/apiService.js';

// ─── Sidebar open / close ─────────────────────────────────────────────────────

export function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

export function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ─── Main entry point called by every page controller ─────────────────────────

export function initNavigation() {
    const userInfo = apiService.getUserInfo();
    if (userInfo && userInfo.role === 'admin') {
        window.location.href = '/admin';
        return;
    }

    const navRoot = document.getElementById('navbar-root');
    if (navRoot) navRoot.innerHTML = getNavbarHTML();

    const sideRoot = document.getElementById('sidebar-root');
    if (sideRoot) sideRoot.innerHTML = getSidebarHTML();

    const footRoot = document.getElementById('footer-root');
    if (footRoot) footRoot.innerHTML = getFooterHTML();

    setActiveLinks();

    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    // ── Silently refresh profile image in sidebar ────────────────────────────
    // Old localStorage sessions may not have `profileImage` stored.
    // We fetch from /api/users/activity (cheap call) and hot-patch the avatar.
    if (userInfo?.token) {
        fetch('/api/users/activity', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
        })
        .then(r => r.ok ? r.json() : null)
        .then(activity => {
            if (!activity) return;
            const img = activity.img || null;

            // Sync to localStorage so next getSidebarHTML() also picks it up
            if (userInfo.profileImage !== img) {
                userInfo.profileImage = img;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            // Hot-patch the already-rendered .sb-avatar
            const avatar = document.querySelector('.sb-avatar');
            if (!avatar) return;
            if (img) {
                avatar.style.background = 'transparent';
                avatar.innerHTML = `<img src="/profile-images/${img}" alt="Me"
                    style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
            } else {
                // No image — make sure initial letter is showing correctly
                const initial = (userInfo.name || '?').charAt(0).toUpperCase();
                avatar.style.background = '';
                avatar.textContent = initial;
            }
        })
        .catch(() => { /* non-fatal — sidebar still shows the initial */ });
    }
}

function setActiveLinks() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links-mini a, .sb-nav .sb-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const isActive = (href === '/' && path === '/') || (href !== '/' && path.startsWith(href));
        link.classList.toggle('active', isActive);
    });
}

// ─── Global window exports ────────────────────────────────────────────────────
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.logout = () => apiService.logout();

window.handleSiteSearch = (query) => {
    if (!query.trim()) return;
    const url = new URL('/browse', window.location.origin);
    url.searchParams.set('search', query);
    window.location.href = url.pathname + url.search;
};
