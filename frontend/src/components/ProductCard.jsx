import { getOptimizedImageUrl, formatPrice } from '../services/helpers';
import ThemedIcon from './ThemedIcon';
import { useTheme } from '../services/ThemeContext';
import React from 'react';

export default function ProductCard({ product, onQuickView, onShowProfile, onWishToggle, isWished, showActions, onMarkSold, onDelete, onEdit, isDashboard }) {
  const p = product;
  const { theme } = useTheme();
  const imgSrc = p.img
    ? (p.img.startsWith('http') ? getOptimizedImageUrl(p.img, 400) : p.img)
    : null;

  const isDeleted = p.status === 'deleted_by_admin';

  return (
    <div
      className={`group bg-surface rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${isDeleted ? 'opacity-60' : 'cursor-pointer'}`}
      onClick={() => !isDashboard && onQuickView?.(p._id)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-bg overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`${imgSrc ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-pri-light/30 to-pri-light/10`}
        >
          <ThemedIcon 
            name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} 
            size={48} 
            color={theme.pri}
            className="opacity-50"
          />
        </div>

        {/* Condition/Status Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm shadow-sm
          ${isDeleted || p.status === 'rejected_by_admin' ? 'bg-red-600/90 text-white' : 
            p.status === 'sold' ? 'bg-gray-800/80 text-white' : 
            p.isApproved === false ? 'bg-amber-500/90 text-white' : 
            'theme-badge'}
        `}>
          {isDeleted ? 'Deleted by Admin' : 
           p.status === 'rejected_by_admin' ? 'Rejected' : 
           p.status === 'sold' ? 'Sold' : 
           p.isApproved === false ? 'Pending Approval' : 
           (p.condition || 'Used')}
        </span>

        {/* Wish Button */}
        {onWishToggle && !isDashboard && (
          <button
            onClick={(e) => { e.stopPropagation(); onWishToggle(p._id); }}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center transition-all ${isWished ? 'scale-125' : 'hover:scale-110'}`}
            title={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <div className={`absolute inset-0 rounded-full transition-colors ${isWished ? 'bg-transparent' : 'bg-black/30 backdrop-blur-[2px]'}`} />
            <div className="relative z-10">
              <ThemedIcon 
                name="wishlist" 
                size={20} 
                color={isWished ? '#ef4444' : '#ffffff'} 
                fill={isWished} 
              />
            </div>
          </button>
        )}

        {/* Dashboard Delete */}
        {isDashboard && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(p._id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md group/del"
            style={{ backgroundColor: '#450a0a' }}
            title="Delete listing"
          >
            <ThemedIcon name="trash" size={17} color="#ffffff" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-medium text-pri mb-1">{p.category}</div>
        <h3 className="font-semibold text-ink text-sm line-clamp-2 mb-2 leading-snug">{p.title}</h3>
        {p.createdAt && (
          <div className="text-xs text-ink-3 mb-2 flex items-center gap-1.5 font-medium">
            <ThemedIcon name="help" size={12} className="opacity-70" /> {new Date(p.createdAt).toLocaleDateString()}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div className="text-lg font-bold text-ink">{formatPrice(p.price)}</div>
          {p.seller && !isDashboard && (
            <div 
              className="flex items-center gap-2 group/seller cursor-pointer p-1 rounded-lg hover:bg-bg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onShowProfile?.(p.seller);
              }}
            >
              <div className="text-right">
                <div className="text-[10px] text-ink-3 font-medium leading-none mb-0.5">Seller</div>
                <div className="text-[11px] font-bold text-ink group-hover/seller:text-pri transition-colors truncate max-w-[80px]">
                  {p.seller.name || 'Anonymous'}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-pri/10 border border-pri/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {p.seller.profileImage ? (
                  <img 
                    src={getOptimizedImageUrl(p.seller.profileImage, 100)} 
                    alt={p.seller.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-pri uppercase">
                    {(p.seller.name || 'S').charAt(0)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Actions */}
      {isDashboard && showActions && !isDeleted && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMarkSold?.(p._id); }}
            className="flex-1 py-2 bg-pri text-white text-xs font-semibold rounded-lg hover:bg-pri-dark transition-colors"
          >
            Mark Sold
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(p._id); }}
            className="px-3 py-2 border border-border text-ink-2 text-xs rounded-lg hover:bg-bg transition-colors flex items-center justify-center"
          >
            <ThemedIcon name="edit" size={14} color={theme.pri} />
          </button>
        </div>
      )}
    </div>
  );
}
