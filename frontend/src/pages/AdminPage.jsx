import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import { formatPrice } from '../services/helpers';
import ThemedIcon from '../components/ThemedIcon';
import Navbar from '../components/Navbar';
import { useTheme } from '../services/ThemeContext';

export default function AdminPage() {
  const { user, logoutUser } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/auth'); return; }
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoading(true);
    try {
      const [prods, st] = await Promise.all([
        api.adminGetProducts(user.token),
        api.adminGetStats(user.token),
      ]);
      setProducts(prods);
      setStats(st);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id, approve) => {
    const action = approve ? 'approve' : 'reject';
    if (!window.confirm(`${action} this product?`)) return;
    try {
      await api.adminApproveProduct(id, approve, user.token);
      showToast(`Product ${approve ? 'approved' : 'rejected'}`, 'success');
      refreshAll();
    } catch (err) {
      showToast(`Failed to ${action} product`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? Seller will see "Deleted by Admin".')) return;
    try {
      await api.adminDeleteProduct(id, user.token);
      showToast('Product deleted', 'success');
      refreshAll();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const getStatusBadge = (status, isApproved) => {
    if (status === 'rejected_by_admin') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Rejected</span>;
    if (isApproved === false) return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">Pending</span>;
    switch (status) {
      case 'available': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Available</span>;
      case 'sold': return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Sold</span>;
      case 'deleted_by_admin': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Deleted</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">{status}</span>;
    }
  };

  const statTotal = [
    { val: stats.totalUsers || 0, label: 'Total Users', icon: 'profile', color: theme.pri },
    { val: stats.liveListings || 0, label: 'Live Listings', icon: 'check', color: '#10b981' },
    { val: stats.pendingListings || 0, label: 'Pending Approval', icon: 'dashboard', color: stats.pendingListings > 0 ? '#ef4444' : '#9ca3af' },
    { val: `₹${(stats.totalVolume || 0).toLocaleString('en-IN')}`, label: 'Total Volume', icon: 'sell', color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Admin Control Panel</h1>
              <p className="text-sm text-pri/70 mt-1">Manage all listings across the marketplace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statTotal.map((s, i) => (
            <div key={i} className="border rounded-2xl p-5 text-center flex flex-col items-center transition-all hover:shadow-lg"
                 style={{ 
                   backgroundColor: theme.isDark ? `${s.color}20` : `${s.color}08`,
                   borderColor: `${s.color}30` 
                 }}>
              <ThemedIcon name={s.icon} size={28} color={s.color} className="mb-2 opacity-90" fill />
              <div className="text-2xl font-extrabold text-ink">{s.val}</div>
              <div className="text-xs text-ink-3 mt-1 font-medium italic opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <h2 className="text-lg font-bold text-ink mb-4">All Products</h2>
        {loading ? (
          <div className="text-center py-16 text-ink-3">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border">
            <ThemedIcon name="browse" size={64} className="text-pri opacity-30 mb-4" fill />
            <h3 className="font-bold text-ink-2">No products found.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => {
              const isDeleted = p.status === 'deleted_by_admin';
              const isRejected = p.status === 'rejected_by_admin';
              const isPending = p.isApproved === false && !isRejected;
              return (
                <div key={p._id} className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden ${isDeleted ? 'opacity-60' : ''}`}>
                  <div className="aspect-[4/3] bg-bg overflow-hidden">
                    {p.img ? (
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-pri-light">
                        <ThemedIcon 
                          name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} 
                          size={48} 
                          color={theme.pri}
                          className="opacity-50"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {getStatusBadge(p.status, p.isApproved)}
                    <h3 className="font-semibold text-ink text-sm mt-2 line-clamp-1">{p.title}</h3>
                    <div className="text-lg font-bold text-ink mt-1">{formatPrice(p.price)}</div>
                    <div className="text-xs text-ink-3 mt-2 space-y-0.5">
                      <div><strong>Seller:</strong> {p.seller?.name || 'Unknown'} ({p.seller?.rollNo || 'N/A'})</div>
                      <div>{p.seller?.email}</div>
                      <div><strong>Posted:</strong> {new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(p._id, true)}
                          className="flex-1 py-2.5 text-white text-xs font-extrabold rounded-lg tracking-wide uppercase"
                          style={{ background: 'linear-gradient(135deg, #10B981, #047857)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                          Approve
                        </button>
                        <button onClick={() => handleApprove(p._id, false)}
                          className="flex-1 py-2.5 text-white text-xs font-extrabold rounded-lg tracking-wide uppercase"
                          style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(p._id)} disabled={isDeleted}
                        className="w-full py-2 border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {isDeleted ? 'Already Deleted' : 'Delete Product'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
