import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function ActiveFilterBadges({ 
  sellerName, sellerYear, category, minPrice, maxPrice, conditions,
  onClearSeller, onClearYear, onClearCategory, onClearPrice, onClearCondition 
}) {
  const hasFilters = sellerName || sellerYear || (category && category !== 'all') || minPrice || maxPrice || (conditions && conditions.length > 0);
  
  if (!hasFilters) return null;

  return (
    <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap px-2 -my-2 py-2 mask-linear-right">
      {/* Category */}
      {category && category !== 'all' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pri/10 text-pri text-[11px] font-bold rounded-lg border border-pri/20 animate-slide-in">
          <ThemedIcon name="category_nav" size={12} className="opacity-70" /> {category.charAt(0).toUpperCase() + category.slice(1)}
          <button onClick={onClearCategory} className="hover:text-pri-dark font-black ml-1">✕</button>
        </span>
      )}

      {/* Price */}
      {(minPrice || maxPrice) && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[11px] font-bold rounded-lg border border-emerald-500/20 animate-slide-in">
          <ThemedIcon name="sell" size={12} className="opacity-70" /> 
          {minPrice && maxPrice ? `₹${minPrice}-₹${maxPrice}` : minPrice ? `> ₹${minPrice}` : `< ₹${maxPrice}`}
          <button onClick={onClearPrice} className="hover:text-emerald-700 font-black ml-1">✕</button>
        </span>
      )}

      {/* Conditions */}
      {conditions?.map(cond => (
        <span key={cond} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 text-[11px] font-bold rounded-lg border border-indigo-500/20 animate-slide-in">
          {cond}
          <button onClick={() => onClearCondition(cond)} className="hover:text-indigo-800 font-black ml-1">✕</button>
        </span>
      ))}

      {/* Seller */}
      {sellerName && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pri/10 text-pri text-[11px] font-bold rounded-lg border border-pri/20 animate-slide-in">
          <ThemedIcon name="profile" size={12} fill /> {sellerName}
          <button onClick={onClearSeller} className="hover:text-pri-dark font-black ml-1">✕</button>
        </span>
      )}

      {/* Year */}
      {sellerYear && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 text-[11px] font-bold rounded-lg border border-amber-500/20 animate-slide-in">
          {sellerYear} Year
          <button onClick={onClearYear} className="hover:text-amber-700 font-black ml-1">✕</button>
        </span>
      )}
    </div>
  );
}
