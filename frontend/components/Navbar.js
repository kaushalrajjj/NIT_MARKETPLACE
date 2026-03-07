/**
 * Navbar component — returns a plain HTML string.
 * Structure matches navigation.css classes exactly.
 */
export function getNavbarHTML() {
    return `
        <header class="navbar" id="nav">
            <div class="nav-inner">

                <button class="hamburger" onclick="window.openSidebar && window.openSidebar()" title="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <a href="/" class="nav-logo">
                    <div class="nav-logo-icon">N</div>
                    <div class="nav-logo-text">
                        <div class="l1">KKR MarketPlace</div>
                        <div class="l2">NIT Kurukshetra</div>
                    </div>
                </a>

                <div class="nav-search-bar">
                    <span>🔍</span>
                    <input type="text" id="mainSearch"
                           placeholder="Search books, electronics, cycles..."
                           oninput="window.handleSearch && window.handleSearch(this.value)">
                </div>

                <ul class="nav-links-mini">
                    <li><a href="/">Home</a></li>
                    <li><a href="/browse">Browse</a></li>
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/wishlist">Wishlist</a></li>
                </ul>

            </div>
        </header>
    `;
}
