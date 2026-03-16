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

                <div class="sb-user">
                    <div class="sb-avatar" style="${userInfo?.profileImage ? 'background:transparent;padding:0' : ''}">
                        ${userInfo?.profileImage 
                            ? `<img src="${userInfo.profileImage.startsWith('http') ? userInfo.profileImage : `/profile-images/${userInfo.profileImage}`}" alt="Me" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` 
                            : initial}
                    </div>
                    <div class="sb-user-info">
                        <div class="sb-uname">${name}</div>
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
