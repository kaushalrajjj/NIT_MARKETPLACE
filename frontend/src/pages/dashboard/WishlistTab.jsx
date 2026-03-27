import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function WishlistTab({ wishlist, onRemoveWish, onQuickView, onShowProfile }) {
  const { theme } = useTheme();
  return (
    <div>
      <p className="text-sm text-ink-3 mb-4">
        <strong className="text-ink">{wishlist.length}</strong> saved item{wishlist.length !== 1 ? 's' : ''}
      </p>
      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <ThemedIcon name="wishlist" size={64} color={theme.pri} className="opacity-40 mb-4" fill />
          <h3 className="font-bold text-ink-2 text-lg">No saved items yet</h3>
          <Link to="/browse" className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark mx-auto w-fit">
            <ThemedIcon name="browse" size={18} color="#ffffff" fill /> Browse Items
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map(p => (
            <ProductCard
              key={p._id} product={p} isWished
              onWishToggle={onRemoveWish}
              onQuickView={onQuickView}
              onShowProfile={onShowProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
