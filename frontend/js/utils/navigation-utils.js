import { getNavbarHTML } from '../../components/Navbar.js';
import { getSidebarHTML } from '../../components/Sidebar.js';
import { getFooterHTML } from '../../components/Footer.js';
import { apiService } from '../services/apiService.js';

/**
 * Shared Navigation Logic:
 * Manages sidebars, global navigation rendering, and authentication-aware UI updates.
 */

// ─── SIDEBAR MANAGEMENT ───────────────────────────────────────────────────────

/** Open the off-canvas navigation sidebar and dim the background */
export function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

/** Close the off-canvas sidebar and restore normal scrolling */
export function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ─── MAIN BOOTSTRAP ───────────────────────────────────────────────────────────

/** 
 * Bootstraps common layout elements (Navbar, Sidebar, Footer) for every page.
 * Also performs 'Hot-patching' on the user's profile image to ensure the 
 * sidebar always reflects the latest state from the server.
 */
export function initNavigation() {
    const userInfo = apiService.getUserInfo();
    
    // Inject dynamic HTML from components
    const navRoot = document.getElementById('navbar-root');
    if (navRoot) navRoot.innerHTML = getNavbarHTML();

    const sideRoot = document.getElementById('sidebar-root');
    if (sideRoot) sideRoot.innerHTML = getSidebarHTML();

    const footRoot = document.getElementById('footer-root');
    if (footRoot) footRoot.innerHTML = getFooterHTML();

    // Visual feedback for active links (Home, Browse, etc.)
    setActiveLinks();

    // Global events
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    /** 
     * Sidebar Avatar Hot-patch:
     * Since every page includes this script, it's the perfect place to 
     * silently fetch the user's latest photo URL from the backend
     * and update the sidebar image without needing a page refresh.
     */
    if (userInfo?.token) {
        fetch('/api/users/activity', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
        })
        .then(r => r.ok ? r.json() : null)
        .then(activity => {
            if (!activity) return;
            const img = activity.img || null;

            // Sync to local session store
            if (userInfo.profileImage !== img) {
                userInfo.profileImage = img;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            // Patch the UI if the avatar currently exists in DOM
            const sbAvatar = document.querySelector('.sb-avatar');
            const navAvatar = document.querySelector('.profile-av');

            if (img) {
                const src = img.startsWith('http') ? img : `/profile-images/${img}`;
                const imgHTML = `<img src="${src}" alt="Me" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
                
                if (sbAvatar) {
                    sbAvatar.style.background = 'transparent';
                    sbAvatar.innerHTML = imgHTML;
                }
                if (navAvatar) {
                    navAvatar.innerHTML = imgHTML;
                }
            } else {
                const initial = (userInfo.name || '?').charAt(0).toUpperCase();
                if (sbAvatar) {
                    sbAvatar.style.background = '';
                    sbAvatar.textContent = initial;
                }
                if (navAvatar) {
                    navAvatar.textContent = initial;
                }
            }
        })
        .catch(() => { /* non-fatal — defaults back to initial card style */ });
    }
}

/** Utility to add 'active' CSS class to links matching current URL path */
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

// ─── GLOBAL WINDOW EXPORTS ────────────────────────────────────────────────────
// These make legacy inline onclick handlers work (e.g., onclick="openSidebar()")
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.logout = () => apiService.logout();

/** 
 * Handles search input from the top navbar across all pages.
 * Redirects user to /browse with search query attached as a URL param.
 */
window.handleSiteSearch = (query) => {
    if (!query.trim()) return;
    const url = new URL('/browse', window.location.origin);
    url.searchParams.set('search', query);
    window.location.href = url.pathname + url.search;
};
