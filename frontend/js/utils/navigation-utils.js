import { getNavbarHTML } from '../../components/Navbar.js';
import { getSidebarHTML } from '../../components/Sidebar.js';
import { getFooterHTML } from '../../components/Footer.js';

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
    // Inject Navbar HTML into #navbar-root
    const navRoot = document.getElementById('navbar-root');
    if (navRoot) navRoot.innerHTML = getNavbarHTML();

    // Inject Sidebar HTML into #sidebar-root
    const sideRoot = document.getElementById('sidebar-root');
    if (sideRoot) sideRoot.innerHTML = getSidebarHTML();

    // Inject Footer HTML into #footer-root
    const footRoot = document.getElementById('footer-root');
    if (footRoot) footRoot.innerHTML = getFooterHTML();

    // Mark the current page's links as active in both navbar and sidebar
    setActiveLinks();

    // Wire overlay click to close sidebar
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Wire Escape key to close sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });
}

// ─── Highlight the nav/sidebar link that matches the current page ─────────────
function setActiveLinks() {
    const path = window.location.pathname;

    // Select all links in the navbar mini-list and the sidebar nav
    const links = document.querySelectorAll('.nav-links-mini a, .sb-nav .sb-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const isActive =
            (href === '/' && path === '/') ||          // exact match for home
            (href !== '/' && path.startsWith(href));   // prefix match for all others

        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ─── Global window exports (for onclick handlers in HTML) ─────────────────────
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
