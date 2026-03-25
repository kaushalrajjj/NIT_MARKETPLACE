import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';
import ProfileModal from '../components/ProfileModal';
import { getOptimizedImageUrl, formatPrice } from '../services/helpers';
import ThemedIcon from '../components/ThemedIcon';
import { useTheme } from '../services/ThemeContext';

const CATEGORIES = [
  { value: 'all', icon: 'category_nav', name: 'All Categories' },
  { value: 'Books', icon: 'cat-books', name: 'Books & Notes' },
  { value: 'Electronics', icon: 'cat-electronics', name: 'Electronics' },
  { value: 'Cycle', icon: 'cat-cycle', name: 'Cycles & Gear' },
  { value: 'Hostel Stuff', icon: 'cat-hostel', name: 'Hostel Essentials' },
  { value: 'Academic', icon: 'cat-academic', name: 'Lab & Academic' },
  { value: 'Other', icon: 'cat-other', name: 'Other' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
];

export default function BrowsePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  // Filters
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [conditions, setConditions] = useState([]);
  const [sellerYear, setSellerYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState(null);

  // Modals
  const [modalProduct, setModalProduct] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (user?.token) {
      api.fetchActivity(user.token).then(act => {
        setWishlistedIds(new Set(act.wishlisted || []));
      }).catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [category, sort, search, conditions, sellerId, sellerYear]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await api.queryProducts({
        filters: {
          category,
          minPrice,
          maxPrice,
          condition: conditions.join(','),
          search,
          seller: sellerId,
          sellerYear: sellerYear || undefined,
        },
        sort,
        page: 1,
        limit: 24,
        fields: ['_id', 'title', 'description', 'price', 'category', 'condition', 'seller', 'img', 'createdAt'],
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }

  const toggleWish = async (productId) => {
    if (!user?.token) {
      showToast('Login to save items', 'error');
      return;
    }
    const isAdded = !wishlistedIds.has(productId);
    const newSet = new Set(wishlistedIds);
    isAdded ? newSet.add(productId) : newSet.delete(productId);
    setWishlistedIds(newSet);
    showToast(isAdded ? 'Added to wishlist ❤️' : 'Removed from wishlist', isAdded ? 'success' : 'info');
    try {
      await api.syncWishlist(productId, isAdded, user.token);
    } catch {
      const revertSet = new Set(newSet);
      isAdded ? revertSet.delete(productId) : revertSet.add(productId);
      setWishlistedIds(revertSet);
      showToast('Wishlist sync failed', 'error');
    }
  };

  const openModal = (id) => {
    const p = products.find(x => x._id === id);
    if (p) setModalProduct(p);
  };

  const toggleCondition = (val) => {
    setConditions(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Page Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-pri/70 mb-1">
                <Link to="/" className="hover:text-pri">Home</Link> / <span className="text-pri font-medium">Browse</span>
              </div>
              <h1 className="text-2xl font-extrabold text-ink">Browse Marketplace</h1>
              <p className="text-sm text-pri/70 mt-1">Explore campus listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Categories */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-surface rounded-2xl border border-border p-4 sticky top-24">
              <h3 className="font-bold text-ink text-sm mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                      ${category === cat.value ? 'bg-pri-light text-pri font-semibold' : 'text-ink-2 hover:bg-bg'}`}
                  >
                    <ThemedIcon
                      name={cat.icon}
                      size={18}
                      color={category === cat.value ? theme.pri : '#9ca3af'}
                      fill={category === cat.value}
                    />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="text-sm text-ink-3">
                Showing <strong className="text-ink">{total}</strong> results
                {sellerName && (
                  <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-pri/10 text-pri text-xs font-bold rounded-lg border border-pri/20 animate-slide-in">
                    <ThemedIcon name="profile" size={12} color={theme.pri} fill /> {sellerName}
                    <button onClick={() => { setSellerId(null); setSellerName(null); }} className="hover:text-pri-dark font-black">✕</button>
                  </span>
                )}
                {sellerYear && (
                  <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20 animate-slide-in">
                    <ThemedIcon name="college" size={12} className="opacity-70" /> {sellerYear} Year
                    <button onClick={() => setSellerYear('')} className="hover:text-amber-700 font-black">✕</button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Category */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="lg:hidden px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.name}</option>)}
                </select>

                {/* Filters Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-border rounded-lg text-sm bg-surface text-ink hover:bg-bg flex items-center gap-2 transition-colors"
                  >
                    <ThemedIcon name="category_nav" size={14} className="text-pri" /> Filters
                  </button>
                  {showFilters && (
                    <div className="absolute right-0 top-12 w-72 bg-surface rounded-2xl border border-border shadow-2xl p-5 z-40">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-ink text-sm">Advanced Filters</h4>
                        <button onClick={() => setShowFilters(false)} className="text-ink-3 hover:text-ink">✕</button>
                      </div>
                      {/* Price */}
                      <div className="mb-6">
                        <div className="text-xs font-semibold text-ink-2 mb-2">Price Range</div>
                        <div className="flex flex-col gap-3">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs">₹</span>
                            <input
                              type="number"
                              value={minPrice}
                              onChange={e => setMinPrice(e.target.value)}
                              placeholder="Min"
                              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-bg text-ink focus:ring-1 focus:ring-pri/30 outline-none"
                            />
                          </div>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs">₹</span>
                            <input
                              type="number"
                              value={maxPrice}
                              onChange={e => setMaxPrice(e.target.value)}
                              placeholder="Max"
                              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-bg text-ink focus:ring-1 focus:ring-pri/30 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Condition */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-ink-2 mb-2">Condition</div>
                        <div className="space-y-2">
                          {['New', 'Lightly Used', 'Used', 'Damaged'].map(c => (
                            <label key={c} className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                              <input type="checkbox" checked={conditions.includes(c)} onChange={() => toggleCondition(c)} className="rounded border-border text-pri focus:ring-pri/40" />
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Seller Year */}
                      <div className="mb-6">
                        <div className="text-xs font-semibold text-ink-2 mb-2">Seller Year</div>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4].map(y => (
                            <button
                              key={y}
                              onClick={() => setSellerYear(sellerYear === String(y) ? '' : String(y))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sellerYear === String(y)
                                ? 'bg-pri text-white border-pri'
                                : 'bg-bg text-ink-3 border-border hover:border-pri/50'
                                }`}
                            >
                              Year {y}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); setConditions([]); setSellerYear(''); }} className="flex-1 py-2 text-sm text-ink-2 border border-border rounded-lg hover:bg-bg">Reset</button>
                        <button onClick={() => { fetchProducts(); setShowFilters(false); }} className="flex-1 py-2 text-sm text-white bg-pri rounded-lg hover:bg-pri-dark font-semibold">Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort */}
                <div className="relative">
                  <button onClick={() => setShowSort(!showSort)} className="px-4 py-2 border border-border rounded-lg text-sm bg-surface text-ink hover:bg-bg flex items-center gap-2 transition-colors">
                    <ThemedIcon name="sell" size={14} className="text-pri opacity-70" /> {SORT_OPTIONS.find(s => s.value === sort)?.label}
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-12 w-48 bg-surface rounded-xl border border-border shadow-xl z-40 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setSort(opt.value); setShowSort(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt.value ? 'bg-pri-light text-pri font-semibold' : 'hover:bg-bg text-ink-2'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description..."
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 focus:border-pri transition-all lg:hidden"
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20 text-ink-3">
                <div className="inline-block w-8 h-8 border-[3px] border-pri-mid border-t-pri rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 text-ink-2 flex justify-center"><ThemedIcon name="search" size={48} /></div>
                <h3 className="font-bold text-ink-2 text-lg">No products found</h3>
                <p className="text-sm text-ink-3 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onQuickView={openModal}
                    onShowProfile={(u) => setProfileUser(u)}
                    onWishToggle={toggleWish}
                    isWished={wishlistedIds.has(p._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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

            {!user ? (
              <div className="text-center py-16 px-6">
                <div className="flex justify-center mb-5"><ThemedIcon name="lock" size={48} className="text-ink-2" /></div>
                <h3 className="text-xl font-bold text-ink mb-4">Login to View Details</h3>
                <Link to="/auth" className="inline-block px-6 py-3 bg-pri text-white font-bold rounded-xl hover:bg-pri-dark transition-colors">
                  Login with NIT Email
                </Link>
              </div>
            ) : (
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

                    {/* Contact Buttons */}
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
                      {!modalProduct.seller?.mobileNo && !modalProduct.seller?.whatsappNo && (
                        <p className="text-sm text-ink-3 italic">No contact info provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Seller Profile Modal */}
      {profileUser && (
        <ProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onFilterBySeller={(id, name) => {
            setCategory('all');
            setSearch('');
            setSellerId(id);
            setSellerName(name);
            setProfileUser(null);
          }}
        />
      )}
    </div>
  );
}
