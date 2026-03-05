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
                        <div class="fb-mark">N</div>
                        <div class="fb-name">NIT KKR Marketplace</div>
                    </div>
                    <p>The exclusive buy-sell platform for NIT Kurukshetra students. Trade safely within the campus community.</p>
                    <div class="foot-socials">
                        <a href="#" class="fs-link"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" class="fs-link"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="#" class="fs-link"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="#" class="fs-link"><i class="fa-brands fa-discord"></i></a>
                        <a href="#" class="fs-link"><i class="fa-brands fa-github"></i></a>
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
                        <div class="ci"><i class="fa-solid fa-envelope"></i> marketplacenit@gmail.com</div>
                        <div class="ci"><i class="fa-solid fa-location-dot"></i> NIT Kurukshetra, HR – 136119</div>
                        <div class="ci"><i class="fa-solid fa-clock"></i> Mon – Fri, 9AM – 6PM</div>
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
