import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from './ThemedIcon';

export default function Footer() {
  return (
    <footer className="bg-pri-deep text-white/70" id="footer-root">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/assets/siteFavicon.png" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-white font-extrabold text-base">NIT KKR Marketplace</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The exclusive buy-sell platform for NIT Kurukshetra students. Trade safely within the campus community.
            </p>
            {/* Instagram */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/NIT_KHARIDARI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                title="@NIT_KHARIDARI on Instagram"
              >
                <ThemedIcon name="instagram" size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors">Browse Items</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/browse" className="hover:text-white transition-colors flex items-center gap-2"><ThemedIcon name="cat-books" size={16} /> Books & Notes</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors flex items-center gap-2"><ThemedIcon name="cat-electronics" size={16} /> Electronics</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors flex items-center gap-2"><ThemedIcon name="cat-hostel" size={16} /> Hostel Essentials</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors flex items-center gap-2"><ThemedIcon name="cat-cycle" size={16} /> Cycles & Gear</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contact</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <a href="tel:+916280464346" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ThemedIcon name="call-receive" size={14} color="#e5e7eb" /> +91 6280464346
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a href="tel:+919329833896" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ThemedIcon name="call-receive" size={14} color="#e5e7eb" /> +91 9329833896
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://www.instagram.com/NIT_KHARIDARI" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ThemedIcon name="instagram" size={14} /> @NIT_KHARIDARI
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2026 NIT KKR Marketplace. Built with ❤️ by a fellow NITian for the campus.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
