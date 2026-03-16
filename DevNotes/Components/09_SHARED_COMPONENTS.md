# 🧱 Shared Components

> **DevNote #09** — Covers the reusable UI pieces in `frontend/components/`

---

## 🏗️ Architecture Philosophy

To keep the frontend light and avoid React/Vue overhead, all standard UI components are standard JavaScript functions that return **HTML template strings**. These are injected dynamically into predefined root `<div>`s in every HTML file.

Example Flow:
1. `index.html` has `<div id="navbar-root"></div>`.
2. `navigation-utils.js` calls `getNavbarHTML()`.
3. The returned string is mapped via `navRoot.innerHTML = getNavbarHTML()`.

---

## 🧭 `Navbar.js` (Top Navigation)

- Returns the main header for all pages.
- Includes the **Hamburger Menu** (`onclick="window.openSidebar()"`).
- Contains the global **Search Bar** (`#navbarSearch`) that routes to `/browse`.
- Has static text links for Home, Browse, Dashboard, Profile, Contact.
- Powered by `navbar.css`.

---

## ⬅️ `Sidebar.js` (Slide-out Menu)

- Hidden by default. Tied to an overlay `#sidebarOverlay` to block background clicks.
- It dynamically reads `localStorage.getItem('userInfo')`.
  - **Logged Out:** Shows "Guest User" and a "Login" button.
  - **Logged In:** Parses details, replaces avatar initial with `profileImage` if it exists. Replaces "Login" with a "Log Out" button that triggers `apiService.logout()`.
- Active highlighting is styled via `navigation-utils.js` comparing `window.location.pathname`.
- Powered by `sidebar.css`.

---

## 📜 `PageHeader.js` (Title Banners)

- Used on internal pages (Browse, Dashboard) to provide a unified title banner below the navbar.
- Accepts a parameters object:
  ```js
  PageHeader({
      title: 'Browse Marketplace',
      description: 'Explore campus listings.',
      breadcrumbText: 'Browse Items',
      showAction: false
  })
  ```
- If `showAction: true`, injects a primary call-to-action button (like "✚ Sell an Item" linking to `/sell`).
- Powered by `page-header.css`.

---

## 🔽 `SortDropdown.js` (Sort Menu widget)

- An abstracted custom select dropdown instead of `<select>`.
- Appears on the Browse and Dashboard pages.
- Expects an array of `{ label, value }` configurations.
- Calls a globally attached function:
  ```html
  onclick="window.setSort(this, 'value_here', 'Label Here')"
  ```
- Uses `document.querySelector('.sort-menu')?.classList.toggle('open')` for behavior.
- Powered by `sort-dropdown.css`.

---

## 🍞 `Toast.js` (Global Notifications)

- Provides a minimal toast overlay replacing `alert()` boxes.
- Injection requires two steps in `DOMContentLoaded` of the page:
  ```js
  const toastRoot = document.getElementById('toast-root');
  if (toastRoot) toastRoot.innerHTML = getToastHTML();
  initToast(); // Attach global `window.showToast()` method
  ```
- Call anywhere: `window.showToast?.('Success! ✅', 'success')` or `'error'`, `'info'`.
- Auto-hides after 3 seconds with a slide-out animation.
- Powered by `toast.css`.

---

## 👟 `Footer.js` (Global Footer)

- Hardcoded list of `<ul>` links, category quick leaps, and direct developer contact info.
- Injected into `#footer-root` on every page exactly like Navbar.
- Powered by `footer.css`.
