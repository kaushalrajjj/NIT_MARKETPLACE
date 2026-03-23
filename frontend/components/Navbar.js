/**
 * Navbar component — returns a plain HTML string.
 * Structure matches navigation.css classes exactly.
 */
export function getNavbarHTML() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isLoggedIn = !!userInfo.name;
    const initial = isLoggedIn ? userInfo.name.charAt(0).toUpperCase() : '?';
    const avatarImg = userInfo.profileImage 
        ? (userInfo.profileImage.startsWith('http') ? userInfo.profileImage : `/profile-images/${userInfo.profileImage}`)
        : null;

    const adminLink = userInfo.role === 'admin' 
        ? '<li><a href="/admin" style="color:var(--pri);font-weight:700">Admin</a></li>' 
        : '';

    const authContent = isLoggedIn ? `
        <div class="nav-profile-wrapper">
            <div class="profile-av" title="${userInfo.name}">
                ${avatarImg 
                    ? `<img src="${avatarImg}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` 
                    : initial}
            </div>
            <div class="profile-hover-card">
                <div class="phc-name">${userInfo.name}</div>
                <div class="phc-roll">${userInfo.rollNo || 'NIT KKR Student'}</div>
            </div>
        </div>
    ` : `
        <a href="/auth" class="btn btn-blue btn-sm" style="border-radius:10px; padding: 7px 16px;">Login</a>
    `;

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

                <div class="nav-right">
                    ${authContent}
                </div>

            </div>
        </header>
    `;
}
