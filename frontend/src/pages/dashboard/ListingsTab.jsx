import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function ListingsTab({ products, sortBy, onSortChange, onMarkSold, onDelete, onEdit }) {
  const { theme } = useTheme();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-3">
          <strong className="text-ink">{products.length}</strong> active listing{products.length !== 1 ? 's' : ''}
        </p>
        <select value={sortBy} onChange={e => onSortChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink">
          <option>Newest First</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <ThemedIcon name="browse" size={64} color={theme.pri} className="opacity-40 mb-4" fill />
          <h3 className="font-bold text-ink-2 text-lg">No active items yet</h3>
          <Link to="/sell" className="inline-block mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark">
            Start selling
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} isDashboard showActions
              onMarkSold={onMarkSold} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
