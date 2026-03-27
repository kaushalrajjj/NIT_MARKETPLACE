import React from 'react';
import ProductCard from '../../components/ProductCard';
import ThemedIcon from '../../components/ThemedIcon';

export default function ProductsGrid({ loading, products, wishlistedIds, onQuickView, onShowProfile, onWishToggle }) {
  if (loading) {
    return (
      <div className="text-center py-20 text-ink-3">
        <div className="inline-block w-8 h-8 border-[3px] border-pri-mid border-t-pri rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 text-ink-2 flex justify-center">
          <ThemedIcon name="search" size={48} />
        </div>
        <h3 className="font-bold text-ink-2 text-lg">No products found</h3>
        <p className="text-sm text-ink-3 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(p => (
        <ProductCard
          key={p._id}
          product={p}
          onQuickView={onQuickView}
          onShowProfile={onShowProfile}
          onWishToggle={onWishToggle}
          isWished={wishlistedIds.has(p._id)}
        />
      ))}
    </div>
  );
}
