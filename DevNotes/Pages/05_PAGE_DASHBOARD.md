# 📊 Dashboard Page

> **DevNote #05** — Covers `dashboard.html` + `js/pages/dashboard.js`

---

## 📍 URL
```
http://localhost:5000/dashboard                    ← My Listings tab (default)
http://localhost:5000/dashboard?tab=wishlist        ← Opens Wishlist tab
http://localhost:5000/dashboard?tab=sold            ← Opens Sold Items tab
http://localhost:5000/dashboard?tab=orders          ← Opens Order History tab
```

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/dashboard.html` | Dashboard HTML structure with 4 tab sections |
| `frontend/js/pages/dashboard.js` | All tab logic, product card rendering, wishlist |
| `frontend/css/pages/dashboard.css` | Dashboard layout, tab styles |
| `frontend/css/components/product-card.css` | `.pc`, `.pimg`, `.pbody` card styles |
| `frontend/css/components/modal.css` | Modal overlay styles |
| `frontend/css/components/sort-dropdown.css` | Sort widget styles |
| `frontend/css/components/page-header.css` | Page header banner styles |
| `frontend/components/PageHeader.js` | Injects "My Dashboard" header banner |
| `frontend/components/SortDropdown.js` | Sort widget (Newest / Price Low / Price High) |
| `frontend/components/Toast.js` | Notifications for actions |
| `frontend/js/services/apiService.js` | All API calls |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` |
| `frontend/js/utils/helpers.js` | `getEmoji(category)` for product thumbnails |
| `frontend/assets/icons/trash.svg` | Delete icon on product cards |

---

## 🔐 Auth Guard

Top of `dashboard.js`:
```js
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';
const TOKEN = userInfo?.token;
```
Not logged in → immediately sent to `/auth`.

---

## 🧩 HTML Structure (dashboard.html)

```
dashboard.html
│
├── #navbar-root              ← Navbar injected by JS
├── #page-header-root         ← PageHeader banner injected by JS
├── #toast-root               ← Toast notifications
├── <aside> → #sidebar-root   ← Sidebar injected by JS
│
└── <main class="browse-layout">
    └── .main-content
        │
        ├── <!-- TAB BAR -->
        │   ├── .dash-tab "🏪 My Listings"    onclick="switchTab('listings')"
        │   ├── .dash-tab "❤️ Wishlist"       onclick="switchTab('wishlist')"
        │   │   └── #wishBadge               ← number badge showing count
        │   ├── .dash-tab "🤝 Sold Items"     onclick="switchTab('sold')"
        │   └── .dash-tab "📜 Order History"  onclick="switchTab('orders')"
        │
        ├── #listingsSection    ← My active listings (visible by default)
        │   ├── Toolbar with sort dropdown #sort-root
        │   ├── #listingsCount  ← "You have N active listings"
        │   └── #pgrid          ← Product cards injected here
        │
        ├── #wishlistSection    ← (hidden by default)
        │   ├── #wishlistCount  ← "N saved items"
        │   └── #wgrid          ← Wishlist product cards injected here
        │
        ├── #soldSection        ← (hidden by default)
        │   ├── #soldCount      ← "N items sold"
        │   └── #sgrid          ← Sold product cards injected here
        │
        └── #ordersSection      ← (hidden by default)
            └── #ogrid          ← "Order history coming soon" placeholder

<footer> → #footer-root
```

---

## ⚙️ JavaScript (dashboard.js) — Detailed Walkthrough

### Module-Level State
```js
let myProducts  = [];           // My own product listings
let currentSort = 'Newest First'; // Current sort order
let activeTab   = 'listings';   // Currently visible tab
```

### Functions Explained

```
dashboard.js
│
├── window.switchTab(tab)        ← Called by tab button clicks
│   ├── Updates activeTab
│   ├── Removes 'active' from all .dash-tab buttons
│   ├── Adds 'active' to matching tab button
│   ├── Shows/hides the 4 section divs
│   └── Triggers data loads:
│       ├── 'wishlist' → loadAndRenderWishlist()
│       ├── 'sold'     → renderSoldTab()  (uses myProducts)
│       └── 'orders'   → renderOrdersTab() (placeholder)
│
├── refreshProducts()            ← Loads MY listings from backend
│   ├── apiService.fetchMyProducts(TOKEN)
│   │   → GET /api/products/me
│   ├── Saves to myProducts[]
│   └── applySortAndRender()
│
├── applySortAndRender()
│   ├── Creates sorted copy of myProducts
│   ├── Sorts by: Newest First / Price Low / Price High
│   └── renderMyProducts(sorted)
│
├── renderMyProducts(products)   ← Writes listing cards into #pgrid
│   ├── Filters to active only (status !== 'sold')
│   ├── Updates #listingsCount
│   └── Each card has:
│       ├── productThumb(p)   → <img> if has photo, else emoji
│       ├── "Active" badge
│       ├── 🗑️ Delete button  → onclick="deleteProduct(productId)"
│       ├── "Mark Sold"       → onclick="markAsSold(productId)"
│       └── ✏️ Edit button    → href="/sell?edit=productId"
│
├── renderSoldTab()              ← Shows sold items from myProducts
│   ├── Filters to: status === 'sold'
│   └── Writes cards to #sgrid (greyed out, no action buttons)
│
├── renderOrdersTab()
│   └── Shows placeholder "Order history coming soon"
│
├── loadAndRenderWishlist()      ← Fetches wishlist products from backend
│   ├── apiService.fetchWishlist(TOKEN)
│   │   → GET /api/users/me/wishlist
│   ├── renderWishlistTab(list)
│   └── updateWishBadge(list.length)
│
├── renderWishlistTab(list)      ← Writes wishlist cards into #wgrid
│   └── Each card has:
│       ├── Category emoji (not real image)
│       ├── Condition badge
│       ├── ❤️ Remove button  → onclick="removeWish(productId)"
│       └── "View Item" button → href="/browse"
│
├── window.removeWish(productId)  ← Remove item from wishlist
│   ├── apiService.syncWishlist(productId, false, TOKEN)
│   │   → POST /api/products/wishlist { productId, isAdded: false }
│   ├── Removes card from DOM (no full re-render)
│   └── Updates badge count
│
├── window.markAsSold(id)         ← Mark listing as sold
│   ├── Confirm dialog: "Mark this item as sold?"
│   ├── apiService.updateStatus(id, 'sold', TOKEN)
│   │   → PUT /api/products/:id/status { status: 'sold' }
│   └── refreshProducts() → re-renders listings
│
├── window.deleteProduct(id)      ← Delete listing
│   ├── Confirm dialog: "Are you sure you want to delete this listing?"
│   ├── apiService.delete(id, TOKEN)
│   │   → DELETE /api/products/:id
│   └── refreshProducts() → re-renders listings
│
├── window.setSort(el, value, label)  ← Sort dropdown change
│   ├── Updates currentSort
│   └── applySortAndRender() (no API call needed — uses local myProducts[])
│
├── updateWishBadge(count)
│   └── Updates #wishBadge number + toggles .visible class
│
└── DOMContentLoaded (async)
    ├── initNavigation()            → Navbar + Sidebar + Footer
    ├── initToast()                 → Toast system
    ├── Injects PageHeader          → #page-header-root
    ├── Injects SortDropdown        → #sort-root
    ├── refreshProducts()           → Load my listings
    ├── Fetches activity for wishlist badge count
    └── Reads ?tab= param from URL → switchTab(tab)
```

---

## 🌐 Backend API Calls

### Load My Products
```
apiService.fetchMyProducts(TOKEN)
   ↓
GET /api/products/me
   ↓
productController.getMyProducts
   ↓
productService.getUserProducts(userId)
   ↓
productRepository.find({ seller: userId })  ← No approval/status filter!
(Returns ALL your own products, including sold ones)
   ↓
Returns: [ {_id, title, price, status, img, ...}, ... ]
```

### Mark as Sold
```
apiService.updateStatus(id, 'sold', TOKEN)
   ↓
PUT /api/products/:id/status   { status: 'sold' }
   ↓
productController.updateProductStatus
   ↓
productService.updateProductStatus(productId, userId, status)
   ├── Checks ownership: product.seller === userId
   ├── productRepository.update(id, { status: 'sold' })
   └── activityRepository.markSold(userId, productId)
       → adds productId to user's sold[] in userActivity.json
```

### Delete Product
```
apiService.delete(id, TOKEN)
   ↓
DELETE /api/products/:id
   ↓
productController.deleteProduct
   ↓
productService.deleteProduct(productId, userId)
   ├── Checks ownership
   ├── productRepository.delete(id)   ← removes from products.json
   └── activityRepository.removeProductEverywhereOnDelete(id)
       ├── Removes from ALL users' wishlisted[] arrays
       └── Removes from seller's listed[] array
       (both in userActivity.json)
```

### Load Wishlist Products
```
apiService.fetchWishlist(TOKEN)
   ↓
GET /api/users/me/wishlist
   ↓
userController.getWishlist
   ├── activityRepository.getOrCreate(userId)
   ├── Gets wishlisted[] ID array
   └── Maps IDs to full product objects via jsonDb.products.findById(id)
   ↓
Returns: [ { full product object }, ... ]  (excludes deleted products)
```

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| Tab bar buttons | Stay on same page, switch sections |
| ✏️ Edit button on listing | `/sell?edit=<productId>` |
| "View Item" on wishlist card | `/browse` |
| Empty state "Browse Items" link | `/browse` |
| Empty state "Start selling" link | `/sell` |
| "✚ Sell an Item" in PageHeader | `/sell` |
| Navbar, Sidebar, Footer | Home, Browse, Sell, Dashboard, Profile |

---

## 🔄 Data Flow: User Switches to Wishlist Tab

```
User clicks "❤️ Wishlist" tab button
      ↓
onclick="switchTab('wishlist')" fires
      ↓
window.switchTab('wishlist') runs
  → Removes 'active' from all tabs, adds to wishlist tab
  → Hides #listingsSection, shows #wishlistSection
  → Calls: loadAndRenderWishlist()
      ↓
loadAndRenderWishlist():
  → Shows "Loading wishlist..." in #wgrid
  → apiService.fetchWishlist(TOKEN)
      ↓
GET /api/users/me/wishlist
      ↓
Backend:
  → userController.getWishlist
  → activityRepository.getOrCreate(userId) → gets userActivity.json[userId]
  → Gets wishlisted: ["prodId1", "prodId2"]
  → Maps each to full product: jsonDb.products.findById("prodId1")
  → Filters out any null (deleted products)
  → Returns: [ { _id, title, price, category, condition, ... }, ... ]
      ↓
renderWishlistTab(products):
  → Updates #wishlistCount: "2 saved items"
  → Writes cards to #wgrid
  → Each card: emoji thumb + title + price + "Remove" + "View Item"
      ↓
updateWishBadge(2) → shows "2" badge on wishlist tab
```

---

## 💡 Key Things to Know

- **Sorting is local** — when user changes the sort order, `applySortAndRender()` just re-sorts the already-downloaded `myProducts[]` array. No new API call.
- **Sold items appear in both places:** The sold products still appear in `myProducts[]` (because `GET /api/products/me` has no status filter), but `renderMyProducts` filters out the sold ones for the Listings tab. The Sold tab separately filters for `status === 'sold'`.
- **Wishlist badge:** On page load, the badge count is fetched from `/api/users/activity` (lightweight call). The full product list for the wishlist tab is only fetched when the user actually clicks the Wishlist tab.
- **Delete cleans up everywhere:** When a product is deleted, the backend removes it from ALL users' wishlists — not just the seller's data. This is done in `activityRepository.removeProductEverywhereOnDelete()`.
- **URL tab param:** Visiting `/dashboard?tab=wishlist` directly works — the JS reads `?tab=` on load and calls `switchTab('wishlist')`.
