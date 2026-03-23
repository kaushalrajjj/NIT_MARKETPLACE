/**
 * Sidebar component — returns a plain HTML string.
 * Structure matches navigation.css classes exactly.
 */
export function getSidebarHTML() {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const initial = userInfo ? userInfo.name.charAt(0).toUpperCase() : '?';
    const name = userInfo ? userInfo.name : 'Guest User';
    const dashHref = '/dashboard';

    const urole = userInfo ? 'NIT KKR Student' : 'Login to sell items';

    const dashLink = userInfo ? `
        <a href="${dashHref}" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
            📊 Dashboard
        </a>
        ${userInfo.role === 'admin' ? `
            <a href="/admin" class="sb-link" style="color:var(--pri);font-weight:700" onclick="window.closeSidebar && window.closeSidebar()">
                🛡️ Admin Panel
            </a>
        ` : ''}
    ` : '';

    const bottomSection = userInfo ? `
        <div class="sb-bottom">
            <button class="sb-link danger" style="width:100%;background:none;border:none;font-family:inherit;cursor:pointer"
                    onclick="window.logout && window.logout()">
                ⮕ Log Out
            </button>
        </div>
    ` : `
        <div class="sb-bottom">
            <a href="/auth" class="sb-link" style="justify-content:center;background:var(--pri);color:#fff;border-radius:12px;text-decoration:none">
                ⬅ Login
            </a>
        </div>
    `;

    return `
        <div class="sidebar-overlay" id="sidebarOverlay" onclick="window.closeSidebar && window.closeSidebar()"></div>

        <aside class="sidebar" id="sidebar">

            <div class="sb-top">
                <div class="sb-head">
                    <div class="sb-logo">
                        <img src="../assets/siteFavicon.png" class="sb-logo-icon" alt="Logo">
                    </div>
                    <button class="sb-close" onclick="window.closeSidebar && window.closeSidebar()" title="Close sidebar">
                        <i>✕</i>
                    </button>
                </div>

                <div class="sb-user" style="position:relative;">
                    <div class="sb-avatar" style="${userInfo?.profileImage ? 'background:transparent;padding:0' : ''}">
                        ${userInfo?.profileImage 
                            ? `<img src="${userInfo.profileImage.startsWith('http') ? userInfo.profileImage : `/profile-images/${userInfo.profileImage}`}" alt="Me" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` 
                            : initial}
                    </div>
                    <div class="sb-user-info" style="flex:1;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="sb-uname">${name}</div>
                            <div class="theme-trigger-container" style="position:static;">
                                <button class="theme-circle-btn" id="mainThemeBtn" onclick="window.toggleThemeSidebar && window.toggleThemeSidebar(event)" title="Current Theme">
                                    <span class="color-dot" id="mainThemeDot"></span>
                                </button>
                                <div class="theme-sub-sidebar" id="themeSubSidebar" style="top: -10px; bottom: auto; left: calc(var(--sidebar-w) + 10px);">
                                    <div class="theme-header">Select Theme</div>
                                    <div class="theme-list">
                                        <button class="theme-dot" style="background:#2563EB" onclick="window.setTheme('blue')" title="Azure Blue"></button>
                                        <button class="theme-dot" style="background:#00BCD4" onclick="window.setTheme('cyan')" title="Cyan Ocean"></button>
                                        <button class="theme-dot" style="background:#6C5CE7" onclick="window.setTheme('periwinkle')" title="Periwinkle"></button>
                                        <button class="theme-dot" style="background:#10B981" onclick="window.setTheme('green')" title="Emerald Green"></button>
                                        <button class="theme-dot" style="background:#F97316" onclick="window.setTheme('orange')" title="Sunset Orange"></button>
                                        <button class="theme-dot" style="background:#E11D48" onclick="window.setTheme('red')" title="Ruby Red"></button>
                                        <button class="theme-dot" style="background:#8B5CF6" onclick="window.setTheme('purple')" title="Amethyst Purple"></button>
                                        <button class="theme-dot" style="background:linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" onclick="window.setTheme('cosmic-grad')" title="Cosmic Gradient"></button>
                                        <button class="theme-dot" style="background:linear-gradient(135deg, #0F172A 50%, #3B82F6 100%)" onclick="window.setTheme('dark-navy')" title="Midnight Navy (Dark Mode)"></button>
                                        <button class="theme-dot" style="background:linear-gradient(135deg, #000000 50%, #06B6D4 100%)" onclick="window.setTheme('dark-cyber')" title="Cyberpunk (Dark Mode)"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="sb-urole">${urole}</div>
                    </div>
                </div>
            </div>

            <hr class="sb-divider">

            <nav class="sb-nav">
                <a href="/" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    🏠 Home
                </a>
                <a href="/browse" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    🏪 Browse Items
                </a>
                <a href="/sell" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    ✚ Sell an Item
                </a>
                ${dashLink}
                <a href="/dashboard?tab=wishlist" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    ❤️ Wishlist
                </a>
                <a href="/profile" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    👤 My Profile
                </a>
                <a href="#" class="sb-link" onclick="window.closeSidebar && window.closeSidebar()">
                    ❓ Help Center
                </a>
                <div class="sb-spacer"></div>
            </nav>

            ${bottomSection}

        </aside>
    `;
}
