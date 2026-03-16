# 📦 NIT KKR Marketplace — Project Overview

> **DevNote #00** — Read this first! This is the master map of the entire project.

---

## 🗂️ Folder Structure

```
NIT_MARKETPLACE/
│
├── backend/                  ← Node.js / Express server
│   ├── server.js             ← Entry point: starts the HTTP server
│   ├── app.js                ← App setup: routes, middleware, static files
│   ├── config/
│   │   ├── db.js             ← MongoDB connection setup
│   │   ├── cloudinary.js     ← Cloudinary configuration
│   │   └── generateToken.js  ← JWT token creation
│   ├── routes/               ← URL-to-controller mapping
│   │   ├── authRoutes.js     ← /api/auth/*
│   │   ├── productRoutes.js  ← /api/products/*
│   │   ├── userRoutes.js     ← /api/users/*
│   │   └── adminRoutes.js    ← /api/admin/*
│   ├── controllers/          ← Handle HTTP request/response
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── productImageController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── services/             ← Business logic (what happens)
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── userService.js
│   ├── repositories/         ← Raw database access
│   │   ├── productRepository.js
│   │   └── activityRepository.js
│   └── middlewares/
│       ├── authMiddleware.js  ← JWT token checker
│       └── errorMiddleware.js ← 404 / global error handler
│
├── data/                     ← (Retired) Local storage was here
│   └── seed/                 ← Sample data for database hydration
│
├── frontend/                 ← Static HTML/CSS/JS (served by Express)
│   ├── pages/                ← One HTML file per page
│   │   ├── index.html        ← Home / Landing page  (URL: /)
│   │   ├── auth.html         ← Login page           (URL: /auth)
│   │   ├── browse.html       ← Browse listings      (URL: /browse)
│   │   ├── sell.html         ← Create/Edit listing  (URL: /sell)
│   │   ├── dashboard.html    ← User dashboard       (URL: /dashboard)
│   │   ├── profile.html      ← User profile         (URL: /profile)
│   │   └── admin.html        ← Admin panel          (URL: /admin)
│   ├── components/           ← Reusable UI pieces (return HTML strings)
│   │   ├── Navbar.js         ← Top navigation bar
│   │   ├── Sidebar.js        ← Slide-out side menu
│   │   ├── Footer.js         ← Site footer
│   │   ├── PageHeader.js     ← Page title + breadcrumb banner
│   │   ├── SortDropdown.js   ← Sort selector UI
│   │   ├── productCard.js    ← Individual product card
│   │   └── Toast.js          ← Notification popups
│   ├── js/
│   │   ├── pages/            ← One JS controller per page
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── browse.js
│   │   │   ├── sell.js
│   │   │   ├── dashboard.js
│   │   │   ├── profile.js
│   │   │   └── admin.js
│   │   ├── services/
│   │   │   └── apiService.js  ← ALL fetch() calls to backend live here
│   │   ├── ui/
│   │   │   └── browseUI.js    ← DOM rendering helpers for browse page
│   │   └── utils/
│   │       ├── navigation-utils.js  ← Injects Navbar, Sidebar, Footer
│   │       └── helpers.js           ← Tiny utility functions (e.g., getEmoji)
│   └── css/
│       ├── base/             ← Global styles
│       │   ├── variables.css  ← CSS custom properties (colors, spacing)
│       │   ├── reset.css      ← Browser default resets
│       │   └── fonts.css      ← Google Fonts imports
│       ├── components/       ← Styles for shared components
│       │   ├── navbar.css, sidebar.css, footer.css
│       │   ├── buttons.css, modal.css, toast.css
│       │   ├── product-card.css, sort-dropdown.css
│       │   └── page-header.css
│       └── pages/            ← Page-specific styles
│           ├── index.css, browse.css, dashboard.css
│           ├── profile.css, sell.css
│           └── (auth.css is in /css/ root, not /css/pages/)
│
└── DevNotes/                 ← 📖 YOU ARE HERE — developer documentation
    ├── Overview/
    ├── Pages/
    ├── Backend/
    └── Components/

---

## 🌐 How Pages Are Served

The backend `app.js` serves the frontend as static files AND also handles clean URLs:

```
User visits: http://localhost:5000/browse
           ↓
app.js: app.get('/browse', ...) → sends browse.html
           ↓
Browse.html loads: <script type="module" src="../js/pages/browse.js">
           ↓
browse.js runs on the client (browser)
```

> **Important:** `wishlist` is NOT a separate page. It is a **tab inside dashboard.html** — accessible via `/dashboard?tab=wishlist`.

---

## 🔐 Authentication System (How Login Works)

1. User types email + password on `/auth`
2. `auth.js` calls `apiService.login(email, password)`
3. `apiService.js` sends `POST /api/auth/login` to backend
4. Backend:
   - Checks `users.json` first, then `admins.json`
   - Compares hashed password with `bcrypt`
   - Returns a JWT token if valid
5. Frontend stores the response in `localStorage` as `userInfo`:
   ```json
   {
     "_id": "...",
     "name": "Akshit Goyal",
     "email": "...@nitkkr.ac.in",
     "role": "student",
     "token": "eyJ...",
     "profileImage": "https://res.cloudinary.com/..."
   }
   ```
6. User is redirected to `/` (Home)

> Every page that needs auth reads `localStorage.getItem('userInfo')` via `apiService.getUserInfo()`.
> Protected pages immediately redirect to `/auth` if no userInfo is found.

---

## 🗄️ Database — MongoDB & Mongoose

The project uses **MongoDB Atlas** for data persistence. We use **Mongoose** as an ODM (Object Data Modeling) library to define schemas and interact with the database.

### Key Models:
- **User**: Name, email, password, role, contact info.
- **Product**: Title, description, price, category, condition, image URL, seller (ref to User).
- **Activity**: Track user-specific data like wishlists and listing counts.

### Image Storage:
We use **Cloudinary** for image hosting.
- No more local `/data/product-images` or `/data/profile-images`.
- All images are uploaded to Cloudinary, and we store the **secure URL** in the database.
- Uses `getOptimizedImageUrl` helper on the frontend to request specific sizes/qualities from Cloudinary.

---

## 📡 API Routes Summary

| Route | Method | Auth | What it does |
|---|---|---|---|
| `/api/auth/login` | POST | ❌ None | Login, returns token |
| `/api/products/query` | POST | ⚡ Optional | Browse/filter products |
| `/api/products/` | POST | ✅ Required | Create new listing |
| `/api/products/me` | GET | ✅ Required | Get my listings |
| `/api/products/:id` | GET | ❌ None | Get single product |
| `/api/products/:id` | PATCH | ✅ Required | Edit my listing |
| `/api/products/:id` | DELETE | ✅ Required | Delete my listing |
| `/api/products/:id/status` | PUT | ✅ Required | Mark as sold |
| `/api/products/:id/image` | POST | ✅ Required | Upload/Replace image on Cloudinary |
| `/api/products/wishlist` | POST | ✅ Required | Sync wishlist add/remove |
| `/api/products/stats/public` | GET | ❌ None | Homepage counters |
| `/api/users/me` | GET | ✅ Required | Get my profile |
| `/api/users/me` | PUT | ✅ Required | Update contact info |
| `/api/users/me/password` | PUT | ✅ Required | Change password |
| `/api/users/me/avatar` | POST | ✅ Required | Upload avatar to Cloudinary |
| `/api/users/me/wishlist` | GET | ✅ Required | Get wishlisted products |
| `/api/users/activity` | GET | ✅ Required | Get all user activity |
| `/api/admin/*` | GET/PUT | ✅ Admin only | Admin operations |

---

## 🧩 Shared Components Pattern

Every page uses exactly the same pattern to inject shared components:

**In every `.html` file:**
```html
<div id="navbar-root"></div>    ← Navbar goes here
<div id="sidebar-root"></div>   ← Sidebar goes here
<div id="toast-root"></div>     ← Toast notifications here
<div id="footer-root"></div>    ← Footer goes here
```

**In every page's `.js` file:**
```js
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();  // injects Navbar + Sidebar + Footer
    initToast();       // initializes toast notification system
});
```

`initNavigation()` lives in `navigation-utils.js` and does:
1. Injects `Navbar.js` HTML into `#navbar-root`
2. Injects `Sidebar.js` HTML into `#sidebar-root`
3. Injects `Footer.js` HTML into `#footer-root`
4. Sets the active link (highlights current page in nav)
5. Silently refreshes profile image in sidebar from backend

---

## 📄 Individual Page DevNotes

| Subfolder | File | What it covers |
|---|---|---|
| `Overview/` | `01_PAGE_HOME.md` | Landing page (index.html + index.js) |
| `Pages/` | `02_PAGE_AUTH.md` | Login page (auth.html + auth.js) |
| `Pages/` | `03_PAGE_BROWSE.md` | Browse/search page (browse.html + browse.js) |
| `Pages/` | `04_PAGE_SELL.md` | Create/Edit listing (sell.html + sell.js) |
| `Pages/` | `05_PAGE_DASHBOARD.md` | User dashboard (dashboard.html + dashboard.js) |
| `Pages/` | `06_PAGE_PROFILE.md` | Profile page (profile.html + profile.js) |
| `Backend/` | `07_BACKEND_LAYER.md` | Full backend chain for each API endpoint |
| `Overview/` | `08_DATA_FLOW.md` | How data flows from click → backend → screen |
| `Components/`| `09_SHARED_COMPONENTS.md` | Navbar, Sidebar, Footer, Toast, PageHeader |
