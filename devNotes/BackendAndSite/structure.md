# Project Structure: NIT KKR Marketplace

This document provides a detailed map of the project, covering every directory and the purpose of its files.

## 🏗️ 1. Main Directory Tree

This is the high-level layout of the entire project, including key configuration and entry files.

```text
NIT_MARKETPLACE/
├── backend/                    # Server-side logic (Node.js/Express)
│   ├── config/                 # Database & Token configurations
│   ├── handlers/               # Route logic (The "Brain" of the API)
│   ├── middlewares/            # Security & Error checking
│   ├── routes/                 # API Endpoint definitions
│   ├── app.js                  # Main App configuration
│   └── server.js               # Entry point (Starts the server)
├── frontend/                   # Client-side assets
│   ├── assets/                 # Static media (Images, Fonts, Icons)
│   ├── components/             # Dynamic HTML builders (Navbar, Sidebar)
│   ├── css/                    # Styles (Base, Components, Pages)
│   ├── html/                   # Page structures
│   └── js/                     # Frontend logic (API, Pages, Utils)
├── data/                       # Database storage (.json files)
├── devNotes/                   # Developer documentation
├── .env                        # Environment variables (Private)
└── package.json                # Project dependencies & scripts
```

---

## 📂 2. Backend Deep Dive

The backend handles the server logic, authentication, and data management.

### `backend/`
*   `server.js`: The start file. It loads environment variables and kicks off the listener on Port 5000.
*   `app.js`: Connects all the middleware, defines static folder access, and links all major routes.

### `backend/config/`
*   `jsonDb.js`: The custom engine that reads/writes to the `.json` files in the `/data` folder.
*   `generateToken.js`: Logic to create secure JWT (JSON Web Tokens) for user sessions.

### `backend/handlers/`
*   `authHandler.js`: Handles Login, Signup, and Password encryption.
*   `productHandler.js`: Logic for creating, fetching, filtering, and deleting marketplace items.
*   `adminHandler.js`: Special logic for platform management and statistics.

---

## 🌐 3. Frontend Deep Dive

The frontend is served as a static site but uses modular JavaScript to feel dynamic.

### `frontend/html/`
Each file represents a unique page in the application:
*   `index.html`: **Landing Page** — Hero section and value proposition.
*   `auth.html`: **Authentication** — Combined login/signup interface.
*   `browse.html`: **Marketplace** — The main search/filter interface for items.
*   `sell.html`: **Submit Ad** — Form for students to post new items.
*   `dashboard.html`: **User Panel** — Manage personal listings and stats.
*   `profile.html`: **Settings** — View and edit student profile details.
*   `admin.html`: **Admin Panel** — View platform-wide metrics and moderate users.
*   `wishlist.html`: **Saved Items** — A collection of items the user is watching.

### `frontend/components/`
Modular JS files that inject HTML into the pages:
*   `Navbar.js`: The top navigation bar (Logo, Search, Links).
*   `Sidebar.js`: The mobile-friendly slide-out menu.
*   `Footer.js`: The bottom site information and links.
*   `productCard.js`: The standard layout for every item "box" shown in Browse or Home.

---

## � 4. Data Storage

The "database" is stored in plain text JSON files for portability.

### `data/`
*   `users.json`: Every student account, encrypted password, and contact info.
*   `products.json`: Every single item posted, its price, category, and approval status.
*   `notifications.json`: Logs for user alerts and platform messages.
