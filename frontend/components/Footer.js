/**
 * Footer component — returns a plain HTML string.
 * Single source of truth for the footer across all pages.
 */
export function getFooterHTML() {
    return `
        <footer class="site-footer">
            <div class="footer-inner">

                <div class="foot-brand">
                    <div class="fb-logo">
                        <img src="../assets/siteFavicon.png" class="fb-mark" alt="Logo">
                        <div class="fb-name">NIT KKR Marketplace</div>
                    </div>
                    <p>The exclusive buy-sell platform for NIT Kurukshetra students. Trade safely within the campus community.</p>
                    <div class="foot-socials">
                        <a href="https://www.instagram.com/NIT_KHARIDARI" target="_blank" rel="noopener" class="fs-link" title="@NIT_KHARIDARI on Instagram"><img src="../assets/icons/instalogo.png" alt="Instagram"></a>
                    </div>
                </div>

                <div class="foot-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/browse">Browse Items</a></li>
                        <li><a href="/sell">Sell an Item</a></li>
                        <li><a href="/dashboard">Dashboard</a></li>
                    </ul>
                </div>

                <div class="foot-col">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="/browse">📚 Books &amp; Notes</a></li>
                        <li><a href="/browse">💻 Electronics</a></li>
                        <li><a href="/browse">🛏 Hostel Essentials</a></li>
                        <li><a href="/browse">🚲 Cycles &amp; Gear</a></li>
                    </ul>
                </div>

                <div class="foot-col">
                    <h4>Contact</h4>
                    <div class="foot-contact">
                        <div class="ci"><a href="tel:+916280464346" style="color:inherit;text-decoration:none">📞 +91 6280464346</a></div>
                        <div class="ci"><a href="tel:+919329833896" style="color:inherit;text-decoration:none">📞 +91 9329833896</a></div>
                        <div class="ci"><a href="https://www.instagram.com/NIT_KHARIDARI" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">📸 @NIT_KHARIDARI</a></div>
                    </div>
                </div>

            </div>

            <div class="foot-bottom">
                <p>© 2026 NIT KKR Marketplace. Built with ❤️ by a fellow NITian for the campus.</p>
                <div class="foot-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms</a>
                    <a href="#">Sitemap</a>
                </div>
            </div>
        </footer>
    `;
}
