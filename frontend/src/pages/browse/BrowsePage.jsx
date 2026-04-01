import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import ProfileModal from '../../components/ProfileModal';
import { useTheme } from '../../services/ThemeContext';
import ThemedIcon from '../../components/ThemedIcon';
import CategorySidebar, { CATEGORIES } from './CategorySidebar';
import FilterPanel from './FilterPanel';
import SortDropdown, { SORT_OPTIONS } from './SortDropdown';
import ActiveFilterBadges from './ActiveFilterBadges';
import ProductsGrid from './ProductsGrid';
import QuickViewModal from '../../components/common/QuickViewModal';

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
  const [filterPanelStyle, setFilterPanelStyle] = useState({});
  const [filterIsMobile, setFilterIsMobile] = useState(false);
  const filterBtnRef = useRef(null);
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
    const q = searchParams.get('search') || '';
    setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [category, sort, search, conditions, sellerId, sellerYear]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await api.queryProducts({
        filters: { category, minPrice, maxPrice, condition: conditions.join(','), search, seller: sellerId, sellerYear: sellerYear || undefined },
        sort, page: 1, limit: 24,
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
    if (!user?.token) { showToast('Login to save items', 'error'); return; }
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

  const toggleCondition = (val) =>
    setConditions(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]);

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
          <CategorySidebar category={category} onSelect={setCategory} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar with Shutter mask */}
            <div className="sticky top-[60px] z-30 pt-[15px] bg-bg">
              <div className="bg-surface rounded-2xl px-4 sm:px-6 py-4 shadow-xl border border-border transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-sm text-ink-3 shrink-0">
                    <strong className="text-ink">{total}</strong> results
                  </div>
                  {/* Active chips — desktop only (hidden on mobile to prevent clustering) */}
                  <div className="hidden sm:flex flex-1 min-w-0">
                    <ActiveFilterBadges
                      sellerName={sellerName}
                      sellerYear={sellerYear}
                      category={category}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      conditions={conditions}
                      onClearSeller={() => { setSellerId(null); setSellerName(null); }}
                      onClearYear={() => setSellerYear('')}
                      onClearCategory={() => setCategory('all')}
                      onClearPrice={() => { setMinPrice(''); setMaxPrice(''); }}
                      onClearCondition={(cond) => setConditions(prev => prev.filter(c => c !== cond))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Clear All — desktop only */}
                  {(category !== 'all' || minPrice !== '' || maxPrice !== '' || conditions.length > 0 || sellerYear !== '' || sellerId !== null) && (
                    <button
                      onClick={() => {
                        setCategory('all'); setMinPrice(''); setMaxPrice(''); setConditions([]); setSellerYear(''); setSellerId(null); setSellerName(null);
                      }}
                      className="hidden sm:block text-xs font-bold text-pri hover:bg-pri/5 px-2 py-1.5 rounded-lg transition-all"
                    >
                      Clear all
                    </button>
                  )}

                  {/* Filters Button */}
                  <div className="relative">
                    <button
                      ref={filterBtnRef}
                      onClick={() => {
                        if (!showFilters && filterBtnRef.current) {
                          const rect = filterBtnRef.current.getBoundingClientRect();
                          const panelWidth = 288;
                          const spaceOnLeft = rect.left;
                          if (spaceOnLeft >= panelWidth + 8) {
                            setFilterIsMobile(false);
                            setFilterPanelStyle({ position: 'absolute', right: 0, left: 'auto', top: '3rem' });
                          } else {
                            setFilterIsMobile(true);
                            setFilterPanelStyle({
                              position: 'fixed',
                              left: '8px',
                              right: 'auto',
                              top: `${rect.bottom + 8}px`,
                            });
                          }
                        }
                        setShowFilters(prev => !prev);
                      }}
                      className="px-3 sm:px-4 py-2 border border-border rounded-lg text-sm bg-surface text-ink hover:bg-bg flex items-center gap-2 transition-colors"
                    >
                      <ThemedIcon name="category_nav" size={14} className="text-pri" /> Filters
                    </button>
                    {showFilters && (
                      <FilterPanel
                        panelStyle={filterPanelStyle}
                        isMobile={filterIsMobile}
                        category={category}
                        onCategory={setCategory}
                        minPrice={minPrice} maxPrice={maxPrice}
                        conditions={conditions} sellerYear={sellerYear}
                        onMinPrice={setMinPrice} onMaxPrice={setMaxPrice}
                        onToggleCondition={toggleCondition}
                        onSellerYear={setSellerYear}
                        onReset={() => { setMinPrice(''); setMaxPrice(''); setConditions([]); setSellerYear(''); }}
                        onApply={() => { fetchProducts(); setShowFilters(false); }}
                        onClose={() => setShowFilters(false)}
                      />
                    )}
                  </div>

                  <SortDropdown
                    sort={sort} show={showSort}
                    onToggle={() => setShowSort(!showSort)}
                    onSelect={(val) => { setSort(val); setShowSort(false); }}
                  />
                </div>
              </div>

              {/* Active filter chips — mobile only, shown below the toolbar */}
              {(category !== 'all' || minPrice !== '' || maxPrice !== '' || conditions.length > 0 || sellerYear !== '' || sellerId !== null) && (
                <div className="sm:hidden flex items-center gap-2 pt-2 pb-1 px-1 overflow-x-auto scrollbar-hide">
                  <ActiveFilterBadges
                    sellerName={sellerName}
                    sellerYear={sellerYear}
                    category={category}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    conditions={conditions}
                    onClearSeller={() => { setSellerId(null); setSellerName(null); }}
                    onClearYear={() => setSellerYear('')}
                    onClearCategory={() => setCategory('all')}
                    onClearPrice={() => { setMinPrice(''); setMaxPrice(''); }}
                    onClearCondition={(cond) => setConditions(prev => prev.filter(c => c !== cond))}
                  />
                  <button
                    onClick={() => {
                      setCategory('all'); setMinPrice(''); setMaxPrice(''); setConditions([]); setSellerYear(''); setSellerId(null); setSellerName(null);
                    }}
                    className="text-xs font-bold text-pri whitespace-nowrap px-2 py-1 rounded-lg hover:bg-pri/5 flex-shrink-0"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <ProductsGrid
              loading={loading} products={products}
              wishlistedIds={wishlistedIds}
              onQuickView={openModal}
              onShowProfile={(u) => setProfileUser(u)}
              onWishToggle={toggleWish}
            />
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {modalProduct && (
        <QuickViewModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onShowProfile={(u) => setProfileUser(u)}
          user={user}
          requireAuth
        />
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
