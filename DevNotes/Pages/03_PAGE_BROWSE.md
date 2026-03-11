# 🏪 Browse / Marketplace Page

> **DevNote #03** — Covers `browse.html` + `js/pages/browse.js` + `js/ui/browseUI.js`

---

## 📍 URL
```
http://localhost:5000/browse
http://localhost:5000/browse?search=laptop    ← with search pre-loaded
```

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/browse.html` | Browse page HTML skeleton |
| `frontend/js/pages/browse.js` | All logic: filters, wishlist, modal, rendering |
| `frontend/js/ui/browseUI.js` | DOM rendering helpers (products grid + filter chips) |
| `frontend/css/pages/browse.css` | Browse page layout + filter sidebar styles |
| `frontend/css/components/product-card.css` | Product card styles |
| `frontend/css/components/modal.css` | Quick View modal styles |
| `frontend/css/components/sort-dropdown.css` | Sort dropdown styles |
| `frontend/css/components/page-header.css` | Page header banner styles |
| `frontend/components/PageHeader.js` | Injects page title/breadcrumb banner |
| `frontend/components/SortDropdown.js` | Injects sort dropdown widget |
| `frontend/components/productCard.js` | Renders individual product card HTML |
| `frontend/components/Toast.js` | Wishlist feedback notifications |
| `frontend/js/services/apiService.js` | API calls for products + wishlist |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` |
| `frontend/js/utils/helpers.js` | `getEmoji(category)` — category icon lookup |

---

## 🧩 HTML Structure (browse.html)

```
browse.html
│
├── #navbar-root              ← Navbar injected by JS
├── #page-header-root         ← PageHeader banner injected by JS
├── #toast-root               ← Toast notifications
├── <aside> → #sidebar-root   ← Sidebar injected by JS
│
├── <!-- QUICK VIEW MODAL -->
│   └── #qvModal (.modal-overlay)
│       ├── #qvLoginWall      ← Shown to guests: "Login to View Details"
│       │   └── Link to /auth
│       └── #qvContent        ← Shown to logged-in users: full product detail
│           ├── #qvImgWrap    ← Product image or emoji
│           ├── #qvPrice      ← Price display
│           ├── #qvInfoRows   ← Condition, Category, Seller
│           ├── #qvDesc       ← Description
│           └── #modalContactActions ← Call + WhatsApp buttons
│
└── <main class="browse-layout">
    │
    ├── <aside class="filter-sidebar" id="filterSidebar">
    │   ├── Filter header + "Reset All" button
    │   └── Category list: All / Books / Electronics / Cycles / Hostel / Tools / Other
    │       Each label calls: onclick="setCat(this, 'categoryName')"
    │
    └── <section class="results-area">
        ├── Results toolbar
        │   ├── #resultsCount    ← "Showing X results"
        │   ├── Filters dropdown (#filtersPopover)
        │   │   ├── Price Range: #priceMin, #priceMax inputs
        │   │   ├── Condition checkboxes (name="condition")
        │   │   └── "Apply Filters" button → calls applyFilters()
        │   └── #sort-root      ← SortDropdown component injected here
        │
        ├── #activeFilters      ← Active filter chips (injected by JS)
        │
        └── #productsGrid       ← Product cards injected here by JS

<footer> → #footer-root         ← Footer injected by JS
```

---

## ⚙️ JavaScript (browse.js) — Detailed Walkthrough

### Module-Level State
```js
let products = [];          // ← Currently displayed products
let total = 0;              // ← Total matching products on backend
let wishlistedIds = new Set(); // ← IDs of products user has wishlisted
```

### Functions Explained

```
browse.js
│
├── buildFilters()
│   └── Reads DOM values → returns a filters object:
│       { category, minPrice, maxPrice, condition, search }
│
├── fetchAndRender()  ← THE MAIN FUNCTION
│   ├── Shows "Loading products..." in #productsGrid
│   ├── Calls: apiService.query({filters, sort, page, limit, fields})
│   │         → POST /api/products/query
│   ├── Saves results into: products[] and total
│   ├── Calls renderGrid()
│   └── Calls renderActiveFilters()
│
├── renderGrid()
│   ├── Calls browseUI.renderProducts({products, total})
│   │   → This writes HTML into #productsGrid
│   └── Syncs heart button state for each product from wishlistedIds Set
│
├── renderActiveFilters()
│   └── Calls browseUI.renderActiveFilters(filters, callbacks)
│       → Shows chips like [Books ×] [₹0–500 ×] above the grid
│       → Each chip has an onclick that calls a window.* function
│
├── window.setCat(el, cat)          ← Category filter
│   ├── Sets window.selectedCategory
│   ├── Highlights clicked category button
│   └── Calls fetchAndRender()
│
├── window.setSort(el, value, label)  ← Sort change
│   ├── Sets window.currentSort
│   ├── Updates sort button label
│   └── Calls fetchAndRender()
│
├── window.applyFilters()           ← "Apply Filters" button
│   └── Calls fetchAndRender()
│
├── window.toggleWish(productId, btn)  ← Heart button click
│   ├── Checks: if user is NOT logged in → shows toast, returns
│   ├── Optimistic UI update (immediately toggles heart, no waiting)
│   ├── apiService.syncWishlist(productId, isAdded, token)
│   │   → POST /api/products/wishlist
│   └── If API fails → reverts the heart button
│
├── window.openModal(id)            ← Product card click → Quick View
│   ├── Opens #qvModal overlay
│   ├── If NOT logged in → shows #qvLoginWall (lock screen)
│   ├── If logged in → populates and shows #qvContent
│   │   ├── Finds product in local products[] array
│   │   ├── Fills in: title, image/emoji, price, condition, category, seller
│   │   └── Generates Call + WhatsApp buttons using seller's phone number
│   └── Blocks body scroll
│
├── window.closeModal()
│   └── Closes #qvModal, resets panels
│
├── window.resetFilters() / clearSearch() / resetPrice() / clearCondition()
│   └── Various filter reset helpers, each calls fetchAndRender()
│
└── DOMContentLoaded (async)
    ├── initNavigation()            → Navbar + Sidebar + Footer
    ├── initToast()                 → Toast system
    ├── Reads ?search= from URL     → window.searchQuery
    ├── Injects PageHeader banner   → #page-header-root
    ├── Injects SortDropdown        → #sort-root
    ├── Fetches user's wishlisted IDs from /api/users/activity
    │   (so hearts are correct on first render)
    └── fetchAndRender()            → Initial product load
```

---

## 🌐 Backend API Calls

### 1. Load Products
```
apiService.query({ filters, sort, page, limit, fields })
   ↓
POST /api/products/query
   ↓
productController.queryProducts → productService.queryProducts
   ↓
productRepository.query(filters)  ← reads products.json, applies filter logic
   ↓
Sort → Paginate → Resolve seller info (joins users.json + userActivity.json)
   ↓
Returns: { products: [...], total: 48, page: 1, pages: 4 }
```

### 2. Load Wishlist IDs (on page load)
```
apiService.fetchActivity(token)
   ↓
GET /api/users/activity
   ↓
userController.getActivity → productService.getUserActivity
   ↓
activityRepository.getOrCreate(userId)  ← reads userActivity.json
   ↓
Returns: { wishlisted: ["id1","id2"], listed: [...], ... }
```

### 3. Toggle Wishlist Heart
```
apiService.syncWishlist(productId, isAdded, token)
   ↓
POST /api/products/wishlist  { productId, isAdded }
   ↓
productController.syncWishlist → productService.updateWishlist
   ↓
activityRepository.update(userId, { wishlisted: [...updatedArray] })
   ↓
Writes to userActivity.json
```

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| Category buttons (sidebar) | Filters products in-place (no page change) |
| Login wall in Quick View modal | `/auth` |
| Navbar, Sidebar, Footer links | Home, Browse, Sell, Dashboard, Profile |

---

## 🔄 Full Data Flow: User Clicks a Category

```
User clicks "Books" category in sidebar
      ↓
onclick="setCat(this, 'Books')" fires
      ↓
window.setCat(el, 'Books') runs
  → window.selectedCategory = 'Books'
  → Removes 'active' from all .cat-filter-item
  → Adds 'active' to clicked element
  → Calls fetchAndRender()
      ↓
fetchAndRender() runs
  → buildFilters() → returns { category: 'Books', ... }
  → Shows "Loading..." in grid
  → apiService.query({ filters: { category: 'Books' }, ... })
  → POST /api/products/query
      ↓
Backend:
  → productRepository.query({ category: 'Books', ... })
  → Reads products.json, filters by isApproved:true, status:'available', category:'Books'
  → Sorts by newest
  → Paginates
  → Resolves seller info from users.json + userActivity.json
  → Returns { products: [...], total: 12 }
      ↓
Frontend:
  → products[] updated
  → renderGrid() → browseUI.renderProducts() → writes cards into #productsGrid
  → Syncs heart buttons from wishlistedIds
  → renderActiveFilters() → shows "Books ×" chip above grid
```

---

## 💡 Key Things to Know

- **Guests can browse** without logging in, but clicking a product card shows the login wall instead of seller details.
- **Logged-in users** can see full details (seller name, contact, WhatsApp) in the Quick View modal.
- **Wishlist is optimistic** — the heart button toggles instantly before the backend confirms. If the backend fails, it reverts.
- **Seller filtering:** When a logged-in user queries products, the backend automatically excludes their own listings (filters by `excludeSeller: req.user._id`).
- **Search from homepage:** If user searched on the homepage, the `?search=` URL param is read on load and pre-applied.
- **`fields` parameter:** The query sends only specific fields to reduce payload size: `['_id', 'title', 'description', 'price', 'category', 'condition', 'seller', 'img', 'createdAt']`
