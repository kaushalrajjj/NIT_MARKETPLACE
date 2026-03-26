import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { formatPrice } from '../../services/helpers';
import { useTheme } from '../../services/ThemeContext';

export default function SoldTab({ products }) {
  const { theme } = useTheme();
  return (
    <div>
      <p className="text-sm text-ink-3 mb-4">
        <strong className="text-ink">{products.length}</strong> item{products.length !== 1 ? 's' : ''} sold
      </p>
      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <ThemedIcon name="sell" size={64} className="text-ink-3 opacity-40 mb-4" fill />
          <h3 className="font-bold text-ink-2 text-lg">No items sold yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p._id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden opacity-75">
              <div className="aspect-[4/3] bg-bg overflow-hidden relative grayscale-[50%]">
                {p.img ? (
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-2">
                    <ThemedIcon name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} size={48} color={theme.pri} className="opacity-50" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-gray-800/80 text-white rounded-lg text-xs font-bold">Sold</span>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-ink-3 mb-1">{p.category}</div>
                <h3 className="font-semibold text-ink-2 text-sm line-clamp-2 mb-2">{p.title}</h3>
                <div className="text-xs text-ink-3 mb-1 font-medium">Sold on {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</div>
                <div className="text-lg font-bold text-ink-2">{formatPrice(p.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
