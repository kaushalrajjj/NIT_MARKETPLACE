import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import Navbar from '../../components/Navbar';
import AdminStatsGrid from './AdminStatsGrid';
import AdminProductCard from './AdminProductCard';
import ThemedIcon from '../../components/ThemedIcon';

export default function AdminPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/auth'); return; }
    refreshAll();
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter') || 'all';
    if (['all', 'pending', 'approved', 'rejected', 'deleted'].includes(filter)) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  async function refreshAll(isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const [prods, st] = await Promise.all([api.adminGetProducts(user.token), api.adminGetStats(user.token)]);
      setProducts(prods);
      setStats(st);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  const handleApprove = async (id, approve) => {
    const action = approve ? 'approve' : 'reject';
    console.log(`Admin action: ${action} product ${id}`);
    try {
      if (!user?.token) { showToast('Not authenticated', 'error'); return; }
      
      const updatedProduct = await api.adminApproveProduct(id, approve, user.token);
      showToast(`Product ${approve ? 'approved' : 'rejected'}`, 'success');
      
      // Update local state instead of full reload
      if (approve) {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, isApproved: true, status: 'available' } : p));
      } else {
        // Mark as rejected locally
        setProducts(prev => prev.map(p => p._id === id ? { ...p, isApproved: false, status: 'rejected_by_admin' } : p));
      }
      
      // Refresh stats in background quietly
      refreshAll(true);
    } catch (err) { 
      console.error(`Failed to ${action} product:`, err);
      showToast(`Failed to ${action} product`, 'error'); 
    }
  };

  const handleDelete = async (id) => {
    console.log(`Admin action: delete product ${id}`);
    try {
      if (!user?.token) { showToast('Not authenticated', 'error'); return; }
      
      await api.adminDeleteProduct(id, user.token);
      showToast('Product deleted', 'success');
      
      // Update local state instead of full reload
      setProducts(prev => prev.map(p => p._id === id ? { ...p, status: 'deleted_by_admin' } : p));
      
      // Refresh stats in background quietly
      refreshAll(true);
    } catch (err) { 
      console.error('Failed to delete product:', err);
      showToast('Failed to delete product', 'error'); 
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return p.isApproved === false && p.status !== 'rejected_by_admin' && p.status !== 'deleted_by_admin';
    if (activeFilter === 'approved') return p.isApproved === true && p.status !== 'deleted_by_admin' && p.status !== 'rejected_by_admin';
    if (activeFilter === 'rejected') return p.status === 'rejected_by_admin';
    if (activeFilter === 'deleted') return p.status === 'deleted_by_admin';
    return true;
  });

  const counts = {
    all: products.length,
    pending: products.filter(p => p.isApproved === false && p.status !== 'rejected_by_admin' && p.status !== 'deleted_by_admin').length,
    approved: products.filter(p => p.isApproved === true && p.status !== 'deleted_by_admin' && p.status !== 'rejected_by_admin').length,
    rejected: products.filter(p => p.status === 'rejected_by_admin').length,
    deleted:  products.filter(p => p.status === 'deleted_by_admin').length
  };

  const filterTabs = [
    { id: 'all',      label: 'All Products',    icon: 'browse',       count: counts.all },
    { id: 'pending',  label: 'Pending',         icon: 'refresh',      count: counts.pending },
    { id: 'approved', label: 'Approved',        icon: 'tick-trick',   count: counts.approved },
    { id: 'rejected', label: 'Rejected',        icon: 'close',        count: counts.rejected },
    { id: 'deleted',  label: 'Deleted',         icon: 'admin',      count: counts.deleted },
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
        <AdminStatsGrid stats={stats} />

        {/* Sticky Header with Shutter mask to hide cards scrolling behind the gap */}
        <div className="sticky top-[60px] z-30 pt-[15px] bg-bg">
          <div className="bg-surface rounded-2xl px-6 py-4 mb-8 shadow-xl border border-border transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="text-xl font-black text-ink shrink-0">Product Listings</h2>

              {/* Scrollable tabs row on mobile, wrapping on desktop */}
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-2 p-1 bg-surface border border-border rounded-2xl shadow-sm min-w-max md:flex-wrap md:min-w-0">
                  {filterTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchParams({ filter: tab.id })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        activeFilter === tab.id
                          ? 'bg-pri text-white shadow-lg shadow-pri/20'
                          : 'text-ink-3 hover:bg-bg'
                      }`}
                    >
                      <ThemedIcon name={tab.icon} size={14} color={activeFilter === tab.id ? 'white' : 'currentColor'} />
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeFilter === tab.id ? 'bg-white/20' : 'bg-bg text-ink-3 opacity-60'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink-3">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-border border-dashed">
            <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <ThemedIcon name="browse" size={32} className="text-pri opacity-30" fill />
            </div>
            <h3 className="font-bold text-ink text-lg">No {activeFilter === 'all' ? '' : activeFilter} products</h3>
            <p className="text-ink-3 text-sm mt-1">Try switching to a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <AdminProductCard key={p._id} product={p} onApprove={handleApprove} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
