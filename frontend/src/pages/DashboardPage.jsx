import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';
import ProfileModal from '../components/ProfileModal';
import { formatPrice, getOptimizedImageUrl } from '../services/helpers';
import ThemedIcon from '../components/ThemedIcon';
import { useTheme } from '../services/ThemeContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    setActiveTab(tab);
    if (tab === 'wishlist') loadWishlist();
  };

  const sortedProducts = () => {
    const sorted = [...myProducts];
    if (sortBy === 'Newest First') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'Price: Low to High') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: High to Low') sorted.sort((a, b) => b.price - a.price);
    return sorted;
  };

  const activeProducts = sortedProducts().filter(p => p.status === 'available');
  const soldProducts = myProducts.filter(p => p.status === 'sold');
  const rejectedProducts = myProducts.filter(p => p.status === 'rejected_by_admin' || p.status === 'deleted_by_admin');

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this item as sold?')) return;
    try {
      await api.updateProductStatus(id, 'sold', user.token);
      await loadData();
      showToast('Item marked as sold', 'success');
    } catch (err) {
      showToast('Failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.deleteProduct(id, user.token);
      await loadData();
      showToast('Listing deleted', 'success');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleRemoveWish = async (productId) => {
    try {
      await api.syncWishlist(productId, false, user.token);
      setWishlist(prev => prev.filter(p => p._id !== productId));
      setWishBadge(prev => Math.max(0, prev - 1));
      showToast('Removed from wishlist', 'info');
    } catch {
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const openModal = (id) => {
    const p = wishlist.find(x => x._id === id);
    if (p) setModalProduct(p);
  };

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: 'browse', count: activeProducts.length },
    { id: 'wishlist', label: 'Wishlist', icon: 'wishlist', count: wishBadge },
    { id: 'sold', label: 'Sold Items', icon: 'sell', count: soldProducts.length },
    { id: 'rejected', label: 'Rejected', icon: 'category_nav', count: rejectedProducts.length },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-pri/70 mb-1">
                <Link to="/" className="hover:text-pri">Home</Link> / <span className="text-pri font-medium">Dashboard</span>
              </div>
              <h1 className="text-2xl font-extrabold text-ink">My Dashboard</h1>
              <p className="text-sm text-pri/70 mt-1">Track your selling activity</p>
            </div>
            <Link to="/sell" className="flex items-center gap-2 px-4 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark transition-all shadow-md">
              <ThemedIcon name="plus" size={16} color="#ffffff" /> Sell an Item
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface rounded-2xl p-1.5 border border-border mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                ${activeTab === tab.id ? 'bg-pri text-white shadow-md' : 'text-ink-3 hover:text-ink-2 hover:bg-bg'}`}
            >
              <ThemedIcon 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? '#ffffff' : '#9ca3af'}
                fill={activeTab === tab.id} 
              />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'theme-badge'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-ink-3">
            <div className="inline-block w-8 h-8 border-3 border-pri-mid border-t-pri rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {/* LISTINGS TAB */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-ink-3">
                    You have <strong className="text-ink">{activeProducts.length}</strong> active listing{activeProducts.length !== 1 ? 's' : ''}
                  </p>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
                {activeProducts.length === 0 ? (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                    <ThemedIcon name="browse" size={64} color={theme.pri} className="opacity-40 mb-4" fill />
                    <h3 className="font-bold text-ink-2 text-lg">No active items yet</h3>
                    <Link to="/sell" className="inline-block mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark">
                      Start selling
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeProducts.map(p => (
                      <ProductCard key={p._id} product={p} isDashboard showActions
                        onMarkSold={handleMarkSold}
                        onDelete={handleDelete}
                        onEdit={(id) => navigate(`/sell?edit=${id}`)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                <p className="text-sm text-ink-3 mb-4">
                  <strong className="text-ink">{wishlist.length}</strong> saved item{wishlist.length !== 1 ? 's' : ''}
                </p>
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                    <ThemedIcon name="wishlist" size={64} color={theme.pri} className="opacity-40 mb-4" fill />
                    <h3 className="font-bold text-ink-2 text-lg">No saved items yet</h3>
                    <Link to="/browse" className="inline-block mt-4 px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark flex items-center justify-center gap-2 mx-auto w-fit">
                      <ThemedIcon name="browse" size={18} color="#ffffff" fill /> Browse Items
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {wishlist.map(p => (
                      <ProductCard 
                        key={p._id} 
                        product={p} 
                        isWished 
                        onWishToggle={handleRemoveWish} 
                        onQuickView={openModal}
                        onShowProfile={(u) => setProfileUser(u)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SOLD TAB */}
            {activeTab === 'sold' && (
              <div>
                <p className="text-sm text-ink-3 mb-4">
                  <strong className="text-ink">{soldProducts.length}</strong> item{soldProducts.length !== 1 ? 's' : ''} sold
                </p>
                {soldProducts.length === 0 ? (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                    <ThemedIcon name="sell" size={64} className="text-ink-3 opacity-40 mb-4" fill />
                    <h3 className="font-bold text-ink-2 text-lg">No items sold yet</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {soldProducts.map(p => (
                      <div key={p._id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden opacity-75">
                        <div className="aspect-[4/3] bg-bg overflow-hidden relative grayscale-[50%]">
                          {p.img ? (
                            <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-2">
                              <ThemedIcon 
                                name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} 
                                size={48} 
                                color={theme.pri}
                                className="opacity-50"
                              />
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
            )}

            {/* REJECTED TAB */}
            {activeTab === 'rejected' && (
              <div>
                <p className="text-sm text-ink-3 mb-4">
                  <strong className="text-ink">{rejectedProducts.length}</strong> item{rejectedProducts.length !== 1 ? 's' : ''} rejected by admin
                </p>
                {rejectedProducts.length === 0 ? (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                    <ThemedIcon name="category_nav" size={64} className="text-ink-3 opacity-40 mb-4" fill />
                    <h3 className="font-bold text-ink-2 text-lg">No rejected items</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rejectedProducts.map(p => {
                      const isDeletedByAdmin = p.status === 'deleted_by_admin';
                      return (
                        <div key={p._id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden opacity-75 border-red-100">
                          <div className="aspect-[4/3] bg-bg overflow-hidden relative">
                            {p.img ? (
                              <img src={p.img} alt={p.title} className="w-full h-full object-cover grayscale-[30%]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-2">
                                <ThemedIcon 
                                  name={`cat-${p.category?.toLowerCase().replace(' ', '') || 'other'}`} 
                                  size={48} 
                                  color={theme.pri}
                                  className="opacity-50"
                                />
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
                              This listing was flagged and removed by an administrator. Please contact support or re-list following guidelines.
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-ink-2">{formatPrice(p.price)}</div>
                              <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove from Dashboard">
                                <ThemedIcon name="plus" size={16} className="rotate-45" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {/* Quick View Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalProduct(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-ink">{modalProduct.title}</h3>
              <button onClick={() => setModalProduct(null)} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-ink-3 hover:bg-surface-2 transition-colors font-bold">✕</button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="md:w-1/2">
                  {modalProduct.img ? (
                    <img
                      src={modalProduct.img.startsWith('http') ? getOptimizedImageUrl(modalProduct.img, 800) : modalProduct.img}
                      alt={modalProduct.title}
                      className="w-full rounded-2xl object-contain bg-bg max-h-80"
                    />
                  ) : (
                    <div className="w-full h-64 bg-pri-light rounded-2xl flex items-center justify-center text-6xl">
                      <ThemedIcon 
                        name={`cat-${modalProduct.category?.toLowerCase().replace(' ', '') || 'other'}`} 
                        size={64} 
                        color={theme.pri}
                        className="opacity-50"
                      />
                    </div>
                  )}
                </div>
                {/* Details */}
                <div className="md:w-1/2 space-y-4">
                  <div className="text-2xl font-extrabold text-ink">{formatPrice(modalProduct.price)}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-ink-3 flex items-center gap-1.5"><ThemedIcon name="sell" size={14} className="opacity-70" /> Condition</span>
                      <span className="font-medium text-ink">{modalProduct.condition || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-ink-3 flex items-center gap-1.5"><ThemedIcon name="category_nav" size={14} className="opacity-70" /> Category</span>
                      <span className="font-medium text-ink">{modalProduct.category || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-ink-3 flex items-center gap-1.5"><ThemedIcon name="profile" size={14} className="opacity-70" fill /> Seller</span>
                      <span 
                        className="font-medium text-pri cursor-pointer hover:underline"
                        onClick={() => {
                          setProfileUser(modalProduct.seller);
                          setModalProduct(null);
                        }}
                      >
                        {modalProduct.seller?.name || 'Anonymous'}
                        {modalProduct.seller?.rollNo && ` (${modalProduct.seller.rollNo})`}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-ink-2 leading-relaxed">{modalProduct.description}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {modalProduct.seller?.mobileNo && (
                      <a href={`tel:${modalProduct.seller.mobileNo}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pri text-white text-sm font-semibold rounded-lg text-center hover:bg-pri-dark transition-colors">
                        <ThemedIcon name="phone" size={16} color="#ffffff" fill /> Call {modalProduct.seller.mobileNo}
                      </a>
                    )}
                    {modalProduct.seller?.whatsappNo && (
                      <a href={`https://wa.me/${modalProduct.seller.whatsappNo.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg text-center hover:bg-emerald-600 transition-colors">
                        <ThemedIcon name="message" size={16} color="#ffffff" fill /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Profile Modal */}
      {profileUser && (
        <ProfileModal 
          user={profileUser} 
          onClose={() => setProfileUser(null)} 
          onFilterBySeller={(id, name) => {
            navigate(`/browse?seller=${id}`); // Redirect to browse with seller filter
          }}
        />
      )}
    </div>
  );
}
