/**
 * Navbar component — returns a plain HTML string.
 * Structure matches navigation.css classes exactly.
 */
export function getNavbarHTML() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const adminLink = userInfo.role === 'admin' 
        ? '<li><a href="/admin" style="color:var(--pri);font-weight:700">Admin</a></li>' 
        : '';

    return `
        <header class="navbar" id="nav">
            <div class="nav-inner">

                <button class="hamburger" onclick="window.openSidebar && window.openSidebar()" title="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <a href="/" class="nav-logo">
                    <img src="../assets/siteFavicon.png" class="nav-logo-icon" alt="Logo">
                    <div class="nav-logo-text">
                        <div class="l1">KKR MarketPlace</div>
                        <div class="l2">NIT Kurukshetra</div>
                    </div>
                </a>

                <div class="nav-search-bar">
                    <span>🔍</span>
                    <input type="text" id="navbarSearch"
                           placeholder="Search books, electronics, cycles..."
                           onkeyup="if(event.key==='Enter') window.handleSiteSearch(this.value)">
                </div>

                <ul class="nav-links-mini">
                    <li><a href="/">Home</a></li>
                    <li><a href="/browse">Browse</a></li>
                    ${adminLink}
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="#footer-root" onclick="event.preventDefault(); document.getElementById('footer-root')?.scrollIntoView({ behavior: 'smooth' })">Contact</a></li>
                </ul>

            </div>
        </header>
    `;
}
