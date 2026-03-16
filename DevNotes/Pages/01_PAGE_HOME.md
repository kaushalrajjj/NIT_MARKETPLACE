# 🏠 Home / Landing Page

> **DevNote #01** — Covers `index.html` + `js/pages/index.js`

---

## 📍 URL
```
http://localhost:5000/         (clean URL, served by Express)
http://localhost:5000/index    (also works via redirect)
```

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/index.html` | HTML structure of the landing page |
| `frontend/js/pages/index.js` | JS logic (scroll animations, search, contact form) |
| `frontend/css/pages/index.css` | All page-specific styles |
| `frontend/css/base/variables.css` | Color + spacing tokens used by index.css |
| `frontend/css/components/navbar.css` | Navbar styles (loaded in `<head>`) |
| `frontend/css/components/sidebar.css` | Sidebar styles |
| `frontend/css/components/footer.css` | Footer styles |
| `frontend/css/components/buttons.css` | `.btn`, `.btn-yellow`, `.btn-ghost` etc. |
| `frontend/css/components/toast.css` | Toast notification styles |
| `frontend/components/Navbar.js` | Injects navbar HTML |
| `frontend/components/Sidebar.js` | Injects sidebar HTML |
| `frontend/components/Footer.js` | Injects footer HTML |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` — ties all components together |

---

## 🧩 HTML Structure (index.html)

The HTML file has these main sections inside `<main>`:

```
index.html
│
├── #navbar-root              ← Navbar injected here by JS
├── #sidebar-root             ← Sidebar injected here by JS
├── #toast-root               ← Toast system lives here
│
├── <section class="hero">    ← Big hero banner with headline + buttons
│   ├── Links to /browse and /dashboard
│   └── Mini category cards (Books, Laptops, Cycles, Hostel)
│
├── <section id="categories"> ← 7 category buttons, all linking to /browse
│
├── <section id="hiw">        ← "How It Works" — 5 steps
│
├── <section id="trust">      ← Safety/Trust features section
│
├── <section id="about">      ← About the team + Founded/Team/Dept cards
│   └── About boxes show stats: Founded 2026, 5 team members, etc.
│
├── <section class="cta-bg">  ← Call-to-action: Login or Browse buttons
│   ├── Links to /auth and /browse
│
├── <section id="contact">    ← Contact info + a feedback form
│   └── Form has onsubmit="handleForm(event)" (local JS, no API call)
│
└── <footer> → #footer-root  ← Footer injected here by JS
```

---

## ⚙️ JavaScript (index.js)

```
index.js
│
├── import initNavigation from navigation-utils.js
│
├── window.handleSearch(val)
│   └── Redirects to /browse?search=<query> when navbar search is used
│
├── initScrollReveal()
│   └── Uses IntersectionObserver to animate .rv elements into view
│       as the user scrolls down (adds class "vis" to trigger CSS transitions)
│
├── window.handleForm(e)
│   └── Contact form submit handler — just changes button text to "✔ Sent!"
│       after 3 seconds. Does NOT actually send data anywhere.
│
├── window event: 'scroll'
│   └── Adds/removes box-shadow on the navbar when page is scrolled
│
└── DOMContentLoaded
    ├── initNavigation()    → injects Navbar, Sidebar, Footer
    └── initScrollReveal()  → activates scroll animations
```

---

## 🌐 Backend API Calls from This Page

| None! The home page is **100% static** — no API calls are made. |
|---|

The only dynamic things are:
- Navbar reads `localStorage` (not the server) to show username
- The in-page stats (like "1,800+ students") are hardcoded in the HTML

> **Note:** The stats on the homepage are **fake/static numbers**. The real live stats from the database are fetched only when `apiService.fetchPublicStats()` is called — but this is not wired into `index.js` currently.

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| "See what's new" button | `/browse` |
| "Sell an item" button | `/dashboard` |
| Category tiles (7 of them) | `/browse` |
| CTA "Login Now" button | `/auth` |
| CTA "Browse First" button | `/browse` |
| Navbar: Browse link | `/browse` |
| Navbar: Dashboard link | `/dashboard` |
| Navbar: Profile link | `/profile` |
| Sidebar: Home | `/` |
| Sidebar: Browse Items | `/browse` |
| Sidebar: Sell an Item | `/sell` |
| Sidebar: Dashboard | `/dashboard` |
| Sidebar: Wishlist | `/dashboard?tab=wishlist` |
| Sidebar: My Profile | `/profile` |
| Footer: Home | `/` |
| Footer: Browse Items | `/browse` |
| Footer: Sell an Item | `/sell` |
| Footer: Dashboard | `/dashboard` |

---

## 🔄 Data Flow on Load

```
Browser requests /
       ↓
Express (app.js) serves frontend/pages/index.html
       ↓
Browser parses HTML, loads CSS files from <head> links
       ↓
<script type="module" src="../js/pages/index.js"> runs
       ↓
DOMContentLoaded fires
       ↓
initNavigation() runs:
  ├── Reads localStorage → gets userInfo (name, profileImage)
  ├── Injects navbar HTML into #navbar-root
  ├── Injects sidebar HTML into #sidebar-root
  ├── Injects footer HTML into #footer-root
  ├── Highlights active link (Home = /)
  └── Silently fetches /api/users/activity (if logged in) → updates avatar
       ↓
initScrollReveal() runs:
  └── Watches .rv elements with IntersectionObserver
       ↓
Page is fully interactive
```

---

## 💡 Key Things to Know

- This page **does not require login**. Anyone can see it.
- The `handleSearch` function redirects to browse with a `?search=` query param.
  Browse.js will pick this up via `new URLSearchParams(window.location.search)`.
- The `.rv` (reveal) CSS class on sections is what controls the scroll animation.
  The class `.vis` is added by JS when the element enters the viewport.
- The contact form (`handleForm`) is purely cosmetic — no email is sent.
