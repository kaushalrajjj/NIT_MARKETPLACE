import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import ProfileModal from '../../components/ProfileModal';
import QuickViewModal from '../../components/common/QuickViewModal';
import DashboardHeader from './DashboardHeader';
import DashboardTabs from './DashboardTabs';
import ListingsTab from './ListingsTab';
import WishlistTab from './WishlistTab';
import SoldTab from './SoldTab';
import RejectedTab from './RejectedTab';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('listings');
  const [myProducts, setMyProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishBadge, setWishBadge] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Newest First');
  const [modalProduct, setModalProduct] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, []);

  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'listings';
    if (['listings', 'wishlist', 'sold', 'rejected'].includes(urlTab)) {
      setActiveTab(urlTab);
      if (urlTab === 'wishlist') loadWishlist();
    }
  }, [searchParams]);

  async function loadData() {
    setLoading(true);
    try {
      const products = await api.fetchMyProducts(user.token);
      setMyProducts(products);
      const activity = await api.fetchActivity(user.token);
      setWishBadge((activity.wishlisted || []).length);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadWishlist() {
    try {
      const list = await api.fetchWishlist(user.token);
      setWishlist(list);
      setWishBadge(list.length);
    } catch {
      showToast('Failed to load wishlist', 'error');
    }
  }

  const switchTab = (tab) => {
    setSearchParams({ tab });
  };

  const sortedProducts = () => {
    const sorted = [...myProducts];
    if (sortBy === 'Newest First') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'Price: Low to High') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: High to Low') sorted.sort((a, b) => b.price - a.price);
    return sorted;
  };

  const activeProducts  = sortedProducts().filter(p => p.status === 'available');
  const soldProducts    = myProducts.filter(p => p.status === 'sold');
  const rejectedProducts = myProducts.filter(p => p.status === 'rejected_by_admin' || p.status === 'deleted_by_admin');

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this item as sold?')) return;
    try {
      await api.updateProductStatus(id, 'sold', user.token);
      await loadData();
      showToast('Item marked as sold', 'success');
    } catch (err) { showToast('Failed: ' + err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.deleteProduct(id, user.token);
      await loadData();
      showToast('Listing deleted', 'success');
    } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
  };

  const handleRemoveWish = async (productId) => {
    try {
      await api.syncWishlist(productId, false, user.token);
      setWishlist(prev => prev.filter(p => p._id !== productId));
      setWishBadge(prev => Math.max(0, prev - 1));
      showToast('Removed from wishlist', 'info');
    } catch { showToast('Failed to remove from wishlist', 'error'); }
  };

  const openModal = (id) => {
    const p = wishlist.find(x => x._id === id);
    if (p) setModalProduct(p);
  };

  const tabs = [
    { id: 'listings',  label: 'My Listings', icon: 'browse',       count: activeProducts.length },
    { id: 'wishlist',  label: 'Wishlist',     icon: 'wishlist',     count: wishBadge },
    { id: 'sold',      label: 'Sold Items',   icon: 'sell',         count: soldProducts.length },
    { id: 'rejected',  label: 'Rejected',     icon: 'category_nav', count: rejectedProducts.length },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardTabs tabs={tabs} activeTab={activeTab} onSwitch={switchTab} />

        {loading ? (
          <div className="text-center py-20 text-ink-3">
            <div className="inline-block w-8 h-8 border-3 border-pri-mid border-t-pri rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'listings' && (
              <ListingsTab products={activeProducts} sortBy={sortBy} onSortChange={setSortBy}
                onMarkSold={handleMarkSold} onDelete={handleDelete}
                onEdit={(id) => navigate(`/sell?edit=${id}`)} />
            )}
            {activeTab === 'wishlist' && (
              <WishlistTab wishlist={wishlist} onRemoveWish={handleRemoveWish}
                onQuickView={openModal} onShowProfile={(u) => setProfileUser(u)} />
            )}
            {activeTab === 'sold' && <SoldTab products={soldProducts} />}
            {activeTab === 'rejected' && <RejectedTab products={rejectedProducts} onDelete={handleDelete} />}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {modalProduct && (
        <QuickViewModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onShowProfile={(u) => setProfileUser(u)}
          user={user}
        />
      )}

      {/* Seller Profile Modal */}
      {profileUser && (
        <ProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onFilterBySeller={(id) => { navigate(`/browse?seller=${id}`); }}
        />
      )}
    </div>
  );
}
