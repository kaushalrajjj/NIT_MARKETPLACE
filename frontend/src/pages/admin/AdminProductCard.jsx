import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { formatPrice } from '../../services/helpers';
import { useTheme } from '../../services/ThemeContext';

function getStatusBadge(status, isApproved) {
  if (status === 'rejected_by_admin') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Rejected</span>;
  if (isApproved === false) return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">Pending</span>;
  switch (status) {
    case 'available':      return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Available</span>;
    case 'sold':           return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Sold</span>;
    case 'deleted_by_admin': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Deleted</span>;
    default:               return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">{status}</span>;
  }
}

export default function AdminProductCard({ product: p, onApprove, onDelete }) {
  const { theme } = useTheme();
  const isDeleted  = p.status === 'deleted_by_admin';
  const isRejected = p.status === 'rejected_by_admin';
  const isPending  = p.isApproved === false && !isRejected;

  const infoFields = [
    { label: 'Category',  value: p.category,      icon: 'category_nav' },
    { label: 'Condition', value: p.condition,     icon: 'tick-trick' },
    { label: 'Location',  value: p.location,      icon: 'map-pin' },
    { label: 'Seller',    value: p.seller?.name,  icon: 'profile' },
    { label: 'Roll No',   value: p.seller?.rollNo,icon: 'admin' },
    { label: 'Email',     value: p.seller?.email, icon: 'email' },
    { label: 'Phone',     value: p.seller?.mobileNo,   icon: 'phone' },
    { label: 'WhatsApp',  value: p.seller?.whatsappNo, icon: 'message' },
  ];

  return (
    <div className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md ${isDeleted ? 'opacity-60' : ''}`}>
      {/* Image Section */}
      <div className="relative aspect-[16/10] bg-bg overflow-hidden group">
        {p.img ? (
          <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pri-light/30">
            <ThemedIcon name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} size={48} color={theme.pri} className="opacity-20" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          {getStatusBadge(p.status, p.isApproved)}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-black shadow-lg">
          {formatPrice(p.price)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow">
        <h3 className="font-extrabold text-ink text-base mb-2 line-clamp-1" title={p.title}>{p.title}</h3>
        
        {p.description && (
          <p className="text-xs text-ink-3 mb-4 line-clamp-2 italic leading-relaxed">
            "{p.description}"
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {infoFields.map((f, i) => f.value && (
            <div key={i} className="flex flex-col min-w-0">
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-tighter font-black text-pri opacity-60 mb-0.5">
                <ThemedIcon name={f.icon} size={8} color="currentColor" />
                {f.label}
              </span>
              <span className="text-[11px] font-bold text-ink truncate hover:text-clip" title={f.value}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-[10px] font-medium text-ink-3">
            Posted {new Date(p.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions Section */}
      <div className="px-5 pb-5 mt-auto">
        {isPending ? (
          <div className="flex gap-3">
            <button type="button" onClick={() => onApprove(p._id, true)}
              className="flex-1 py-3 text-white text-[11px] font-black rounded-xl tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Approve
            </button>
            <button type="button" onClick={() => onApprove(p._id, false)}
              className="flex-1 py-3 text-white text-[11px] font-black rounded-xl tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-red-500/20"
              style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
              Reject
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onDelete(p._id)} disabled={isDeleted}
            className="w-full py-2.5 border-2 border-red-50/50 bg-red-50/30 text-red-500 text-[11px] font-black rounded-xl hover:bg-red-50 hover:border-red-100 disabled:opacity-40 disabled:grayscale transition-all tracking-widest uppercase">
            {isDeleted ? 'Deleted Forever' : 'Delete Listing'}
          </button>
        )}
      </div>
    </div>
  );
}
