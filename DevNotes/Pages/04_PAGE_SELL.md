# 🏷️ Sell / Create & Edit Listing Page

> **DevNote #04** — Covers `sell.html` + `js/pages/sell.js`

---

## 📍 URLs
```
http://localhost:5000/sell              ← Create NEW listing
http://localhost:5000/sell?edit=<id>    ← EDIT existing listing
```

The same page handles both creating and editing — the `?edit=` URL param switches it into "edit mode".

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/sell.html` | Sell form HTML |
| `frontend/js/pages/sell.js` | All logic: create, edit, image upload |
| `frontend/css/pages/sell.css` | Page-specific layout and form styles |
| `frontend/css/base/variables.css` | Color tokens |
| `frontend/css/components/navbar.css` | Navbar styles |
| `frontend/css/components/sidebar.css` | Sidebar styles |
| `frontend/css/components/buttons.css` | Button styles |
| `frontend/css/components/toast.css` | Toast notification styles |
| `frontend/css/components/footer.css` | Footer styles |
| `frontend/components/Toast.js` | Success/error notifications |
| `frontend/js/services/apiService.js` | `create()`, `updateProduct()` API calls |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` |
| `data/product-images/` | Uploaded photos saved here (on the server) |
| `backend/controllers/productImageController.js` | Handles image upload/delete |

---

## 🔐 Auth Guard

This is a **protected page**. At the very top of `sell.js`:
```js
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';
```
If the user is not logged in, they're immediately kicked to `/auth`.

---

## 🧩 HTML Structure (sell.html)

```
sell.html
│
├── #navbar-root              ← Navbar injected by JS
├── <aside> → #sidebar-root   ← Sidebar injected by JS
├── #toast-root               ← Toast notifications
│
└── <main class="sell-container">
    │
    ├── .sell-hero            ← Page heading (swapped to "Edit Listing" in edit mode)
    │   ├── #sellHeroIcon     ← "🏷️" (or "✏️" in edit mode)
    │   ├── #sellPageTitle    ← "List a New Item" (or "Edit Listing")
    │   └── #sellPageSub      ← Subtitle text
    │
    └── <form id="sellForm" class="sell-form">
        │
        ├── SECTION 1: Category (🔒 Fixed after posting)
        │   └── <select id="category">  ← Disabled in edit mode
        │       Options: Books, Electronics, Cycles, Hostel, Tools, Other
        │
        ├── SECTION 2: Listing Details (✏️ Can be edited later)
        │   ├── <input id="title">          ← Item name
        │   ├── <input id="price" type="number"> ← Price in ₹
        │   ├── <select id="condition">     ← Brand New / Like New / Lightly Used / Used / Damaged
        │   ├── <select id="location">      ← BH-1 through BH-8, KCH, Meera Bhawan, Main Gate
        │   └── <textarea id="description"> ← Listing description
        │
        ├── SECTION 3: Product Photo (📸)
        │   ├── #imgUploadArea    ← Drag & drop / click to upload zone
        │   ├── #imgPlaceholder   ← "📷 Click to upload" placeholder
        │   ├── #imgPreview       ← Shows selected/existing image
        │   ├── <input type="file" id="productImg" style="display:none">
        │   └── #imgActions       ← "Change Photo" + "Remove" buttons (shown when image set)
        │
        └── <button id="submitBtn">Publish Listing</button>

<footer> → #footer-root
```

---

## ⚙️ JavaScript (sell.js) — Detailed Walkthrough

### Module-Level State
```js
const editId      = new URLSearchParams(window.location.search).get('edit');
const isEditMode  = Boolean(editId);  // true if ?edit=<id> in URL

let selectedFile     = null;   // File object chosen by user
let existingImgName  = null;   // Filename already on server (in edit mode)
let removeExisting   = false;  // Did user click "Remove" on existing image?
```

### Functions Explained

```
sell.js
│
├── DOMContentLoaded
│   ├── initNavigation()        → Navbar + Sidebar + Footer
│   ├── initToast()             → Toast system
│   ├── initImageUpload()       → Sets up file picker behavior
│   └── if (isEditMode)
│       └── loadProductForEdit(editId) → fills form with existing data
│
├── initImageUpload()
│   ├── Listens to: #productImg file input change
│   ├── Handles: drag-over, drag-leave, drop events on #imgUploadArea
│   ├── selectFile(file)
│   │   ├── Validates: max 4MB
│   │   ├── Sets selectedFile = file
│   │   ├── FileReader reads file → shows preview in #imgPreview
│   │   └── Hides placeholder, shows #imgActions
│   ├── window.changePhoto()     → triggers hidden file input click
│   └── window.removePhoto()     → clears preview, sets removeExisting = true
│
├── loadProductForEdit(productId)   ← EDIT MODE ONLY
│   ├── GET /api/products/:id       (direct fetch, no apiService wrapper)
│   ├── Verifies ownership: p.seller._id === userInfo._id
│   │   └── If NOT owner: shows error toast → redirects to /dashboard
│   ├── Changes page heading to "Edit Listing"
│   ├── Pre-fills: title, price, description, condition
│   ├── Disables: category dropdown (locked after posting)
│   └── If product has an image: shows it in #imgPreview
│
├── uploadProductImage(productId)
│   ├── Creates FormData with selectedFile as "image"
│   ├── POST /api/products/:id/image  with Authorization: Bearer token
│   └── Throws on failure
│
├── removeProductImage(productId)
│   └── DELETE /api/products/:id/image  with Authorization: Bearer token
│
└── sellForm submit event
    ├── Prevents default
    ├── Disables button, shows "Publishing..." or "Saving..."
    ├── Builds productData: { title, description, price, condition, category(if new) }
    │
    ├── IF isEditMode:
    │   ├── apiService.updateProduct(editId, productData, token)
    │   │   → PATCH /api/products/:id
    │   ├── If removeExisting && existingImgName → removeProductImage()
    │   └── If selectedFile → uploadProductImage()
    │
    ├── IF creating new:
    │   ├── apiService.create(productData, token)
    │   │   → POST /api/products/
    │   │   → Returns new product with _id
    │   └── If selectedFile → uploadProductImage(newProduct._id)
    │
    ├── On success: shows toast, redirects to /dashboard after 1 second
    └── On error: shows error toast, re-enables button
```

---

## 🌐 Backend API Calls

### Create New Product
```
apiService.create(productData, token)
   ↓
POST /api/products/   { title, description, price, condition, category }
Header: Authorization: Bearer <token>
   ↓
productController.createProduct
   ↓
productService.createProduct(userId, productData)
   ├── Adds seller: userId, isApproved: true, status: 'available'
   ├── productRepository.create(data)   ← writes to products.json
   └── activityRepository.addListed(userId, newProduct._id)  ← updates userActivity.json
   ↓
Returns: { _id, title, price, category, ... }
```

### Upload Image (After Creating)
```
POST /api/products/:id/image   FormData: { image: <file> }
Header: Authorization: Bearer <token>
   ↓
productImageController.uploadImage
   ├── multer saves file to /data/product-images/ as "productId_timestamp.ext"
   ├── Deletes old image file if product had one
   └── jsonDb.products.update(productId, { img: newFilename })
   ↓
Returns: { img: "filename.jpg", url: "/product-images/filename.jpg" }
```

### Edit Existing Product
```
apiService.updateProduct(editId, data, token)
   ↓
PATCH /api/products/:id   { title, description, price, condition }
Header: Authorization: Bearer <token>
   ↓
productController.updateProduct
   ↓
productService.updateProduct(productId, requesterId, updates)
   ├── Checks: product.seller === requesterId (ownership)
   ├── Only allows: title, description, price, condition
   ├── NEVER allows: category (locked forever)
   └── productRepository.update(id, patch)  ← writes to products.json
   ↓
Returns: updated product
```

### Load Product for Editing
```
GET /api/products/:id    (no auth required)
   ↓
productController.getProductById
   ↓
productService.getProductById(id)
   ├── productRepository.findById(id)
   └── Resolves seller info from users.json + userActivity.json
   ↓
Returns: { _id, title, price, seller: { _id, name, ... }, ... }
```

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| After successful submit | `/dashboard` (redirect) |
| Dashboard "✏️" button on listing | `/sell?edit=<productId>` |
| Navbar, Sidebar, Footer links | Home, Browse, Dashboard, Profile |

---

## 🔄 Data Flow: User Creates a New Listing

```
User fills title, price, condition, description, uploads photo
      ↓
Clicks "Publish Listing"
      ↓
sell.js: sellForm submit event fires
  → Builds { title, price, description, condition, category }
  → apiService.create(productData, token)
      ↓
POST /api/products/
      ↓
Backend:
  → productController.createProduct
  → productService.createProduct(userId, data)
  → productRepository.create({ ...data, seller: userId, isApproved: true, status: 'available' })
  → Writes new product to products.json (with auto-generated _id)
  → activityRepository.addListed(userId, product._id) → updates userActivity.json
  → Returns { _id: "abc123", title: "...", ... }
      ↓
Frontend receives new product _id
      ↓
If user selected a photo:
  → uploadProductImage("abc123")
  → POST /api/products/abc123/image  (multipart/form-data)
  → Backend saves file to /data/product-images/abc123_timestamp.jpg
  → Updates products.json: { img: "abc123_timestamp.jpg" }
      ↓
showToast("Listing published! ✅")
setTimeout → redirect to /dashboard
```

---

## 💡 Key Things to Know

- **Category is permanently locked** once a listing is posted. The `<select id="category">` is disabled in edit mode, and the backend's `updateProduct` service also explicitly refuses to patch category.
- **Edit access:** Only the listing owner can edit it. Ownership is verified on BOTH frontend (seller._id check) and backend (product.seller !== requesterId).
- **Image handling in edit mode:** The user can change the photo (replaces old one on server), remove the photo (deleted from server), or leave it as-is (nothing happens to image).
- **Images are served** via a static route: `app.use('/product-images', express.static(...))` — the browser requests `/product-images/filename.jpg` directly from Express.

