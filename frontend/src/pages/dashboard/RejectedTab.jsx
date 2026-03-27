import React, { useState } from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { formatPrice } from '../../services/helpers';
import { useTheme } from '../../services/ThemeContext';
import ImageLightbox from '../../components/common/ImageLightbox';

export default function RejectedTab({ products, onDelete }) {
  const { theme } = useTheme();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  return (
    <div>
      <p className="text-sm text-ink-3 mb-4">
        <strong className="text-ink">{products.length}</strong> item{products.length !== 1 ? 's' : ''} rejected by admin
      </p>
      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <ThemedIcon name="category_nav" size={64} className="text-ink-3 opacity-40 mb-4" fill />
          <h3 className="font-bold text-ink-2 text-lg">No rejected items</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => {
            const isDeletedByAdmin = p.status === 'deleted_by_admin';
            return (
              <div key={p._id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden opacity-75 border-red-100">
                <div className="aspect-[4/3] bg-bg overflow-hidden relative">
                  {p.img ? (
                    <img
                      src={p.img} alt={p.title}
                      className="w-full h-full object-cover grayscale-[30%] cursor-zoom-in"
                      onClick={() => setLightboxSrc(p.img)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-2">
                      <ThemedIcon name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} size={48} color={theme.pri} className="opacity-50" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600/90 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <ThemedIcon name="dashboard" size={12} color="#ffffff" />
                    {isDeletedByAdmin ? 'Deleted by Admin' : 'Rejected by Admin'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-xs font-medium text-ink-3 mb-1">{p.category}</div>
                  <h3 className="font-semibold text-ink-2 text-sm line-clamp-2 mb-2">{p.title}</h3>
                  <div className="p-2.5 bg-red-50 rounded-xl text-[11px] text-red-600 font-medium leading-tight mb-3">
                    {p.adminDetails ? (
                      <>
                        Moderated by <strong className="text-red-700">{p.adminDetails.name}</strong>.
                        For clarification, contact: <a href={`mailto:${p.adminDetails.email}`} className="underline font-bold text-red-700">{p.adminDetails.email}</a>
                      </>
                    ) : (
                      "This listing was flagged and removed by an administrator. Please contact support or re-list following guidelines."
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-ink-2">{formatPrice(p.price)}</div>
                    <button onClick={() => onDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove from Dashboard">
                      <ThemedIcon name="plus" size={16} className="rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt="Product" onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
