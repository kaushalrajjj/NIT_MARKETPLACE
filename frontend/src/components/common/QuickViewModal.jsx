import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../ThemedIcon';
import { useTheme } from '../../services/ThemeContext';
import { getOptimizedImageUrl, formatPrice } from '../../services/helpers';

/**
 * QuickViewModal — shared between BrowsePage and DashboardPage.
 *
 * Props:
 *   product       — the product object to display
 *   onClose       — called when modal is dismissed
 *   onShowProfile — called with seller object when seller name is clicked
 *   requireAuth   — if true and no `user`, show "Login to View Details" instead
 *   user          — current auth user (pass null to trigger requireAuth gate)
 */
export default function QuickViewModal({ product, onClose, onShowProfile, user, requireAuth = false }) {
  const { theme } = useTheme();
  
  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-border">
          <h3 className="font-bold text-lg text-ink">{product.title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-ink-3 hover:bg-surface-2 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {requireAuth && !user ? (
          <div className="text-center py-16 px-6">
            <div className="flex justify-center mb-5">
              <ThemedIcon name="lock" size={48} className="text-ink-2" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-4">Login to View Details</h3>
            <Link
              to="/auth"
              className="inline-block px-6 py-3 bg-pri text-white font-bold rounded-xl hover:bg-pri-dark transition-colors"
            >
              Login with NIT Email
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="md:w-1/2">
                {product.img ? (
                  <img
                    src={product.img.startsWith('http') ? getOptimizedImageUrl(product.img, 800) : product.img}
                    alt={product.title}
                    className="w-full rounded-2xl object-contain bg-bg max-h-80"
                  />
                ) : (
                  <div className="w-full h-64 bg-pri-light rounded-2xl flex items-center justify-center text-6xl">
                    <ThemedIcon
                      name={`cat-${product.category?.toLowerCase().replace(' ', '') || 'other'}`}
                      size={64}
                      color={theme.pri}
                      className="opacity-50"
                    />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:w-1/2 space-y-4">
                <div className="text-2xl font-extrabold text-ink">{formatPrice(product.price)}</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-ink-3 flex items-center gap-1.5">
                      <ThemedIcon name="sell" size={14} className="opacity-70" /> Condition
                    </span>
                    <span className="font-medium text-ink">{product.condition || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-ink-3 flex items-center gap-1.5">
                      <ThemedIcon name="category_nav" size={14} className="opacity-70" /> Category
                    </span>
                    <span className="font-medium text-ink">{product.category || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-ink-3 flex items-center gap-1.5">
                      <ThemedIcon name="profile" size={14} className="opacity-70" fill /> Seller
                    </span>
                    <span
                      className="font-medium text-pri cursor-pointer hover:underline"
                      onClick={() => {
                        onShowProfile?.(product.seller);
                        onClose?.();
                      }}
                    >
                      {product.seller?.name || 'Anonymous'}
                      {product.seller?.rollNo && ` (${product.seller.rollNo})`}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-ink-2 leading-relaxed">{product.description}</p>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.seller?.mobileNo && (
                    <a
                      href={`tel:${product.seller.mobileNo}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pri text-white text-sm font-semibold rounded-lg text-center hover:bg-pri-dark transition-colors"
                    >
                      <ThemedIcon name="phone" size={16} color="#ffffff" fill /> Call {product.seller.mobileNo}
                    </a>
                  )}
                  {product.seller?.whatsappNo && (
                    <a
                      href={`https://wa.me/${product.seller.whatsappNo.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg text-center hover:bg-emerald-600 transition-colors"
                    >
                      <ThemedIcon name="message" size={16} color="#ffffff" fill /> WhatsApp
                    </a>
                  )}
                  {!product.seller?.mobileNo && !product.seller?.whatsappNo && (
                    <p className="text-sm text-ink-3 italic">No contact info provided.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
