# 🔄 Data Flow & State Management

> **DevNote #08** — Tracking data from click to database

---

## 🚦 Local State vs. Backend State

The NIT Marketplace was designed *without* complex state management libraries like Redux or React Context. All frontend logic is vanilla JS and state is stored simply in plain script variables.

### Local Variables (Frontend State)
In any `js/pages/*.js` script (e.g., `browse.js`):
```js
let products = [];
let total = 0;
let wishlistedIds = new Set();
// These reset completely if the user refreshes the page.
```

### Persistent Settings (localStorage)
- `userInfo`: Contains the user's name, email, role, and the **JWT token**. Crucial for authentication.
  ```json
  {"_id":"...","name":"Ahskit Goyal","token":"eyJ..."}
  ```

### Database Persistence (Backend)
- Actual changes (e.g., product created, wishlist updated) are sent directly to the Express server using `apiService.js`, which then performs operations on **MongoDB** using Mongoose.
- Images are handled via the **Cloudinary** service.

---

## 🖼️ The Standard UI Cycle
Every dynamic action follows the exact same pattern:

1. **User interacts.**
   - Example: Clicks a filter, types in a search box.
2. **Event updates Local State.**
   - `buildFilters()` reads the DOM, `fetchAndRender()` is called.
3. **Data is loaded from Backend.**
   - `apiService.query(payload)` calls `POST /api/products/query`.
   - The server queries MongoDB, filters, paginates, and returns an array of products.
4. **Local State is synced.**
   - `products = data.products; total = data.total;`
5. **UI is dynamically re-rendered.**
   - Old components are wiped out using `.innerHTML = ''`.
   - `renderGrid()` or `browseUI.renderProducts()` injects the new HTML strings into the grid container.

---

## 💖 Optimistic UI Updates (The Wishlist)

Waiting for the server is slow. To make the app feel instantly responsive, some interactions (like hearting an item) update the UI *before* the server responds.

```js
// browse.js -> window.toggleWish(productId, btn)

// 1. Check Auth (early exit)
if (!token) return toast("Login required");

// 2. Predict State
const isAdded = !wishlistedIds.has(productId);

// 3. Immediately update UI + Local State
isAdded ? wishlistedIds.add(productId) : wishlistedIds.delete(productId);
btn.innerHTML = isAdded ? '❤️' : '♡'; // (Looks instant!)

// 4. Send request to backend asynchronously
try {
  await apiService.syncWishlist(productId, isAdded, token);
  // Reaches backend -> updates MongoDB Activity collection -> completes.
} catch (error) {
  // 5. Rollback on failure (undo the optimistic change)
  isAdded ? wishlistedIds.delete(productId) : wishlistedIds.add(productId);
  btn.innerHTML = isAdded ? '♡' : '❤️';
  toast("Sync failed, please try again.");
}
```

---

## 🛍️ Fast-Path Architecture (Data Orchestrator)

The architecture emphasizes doing as much as possible on the frontend if the data is already available.

### Scenario: Changing the Sort Order in Dashboard
When a user on their **Dashboard** changes the sort from "Newest First" to "Price: Low to High", the app does **NOT** hit the backend.
```js
// dashboard.js -> applySortAndRender()

// Create a copy of the *already loaded* myProducts array
const sorted = [...myProducts];

// Sort it locally in memory
if (currentSort === 'Price: Low to High') {
    sorted.sort((a, b) => a.price - b.price);
}

// Re-render
renderMyProducts(sorted);
```
**Benefit:** Instant updates, zero network latency, less load on the backend mapping server.

---

## 🪟 Cross-Page State (The Search Bar)
How does a search typed on the homepage carry over to the browse page?
1. User types "Cycle" in the navbar on `index.html`.
2. `window.handleSearch('Cycle')` is called.
3. The browser redirects to: `/browse?search=Cycle`
4. On `browse.html` load, `DOMContentLoaded` fires.
5. `new URLSearchParams(window.location.search).get('search')` extracts "Cycle".
6. It automatically sets `window.searchQuery = "Cycle"`, pre-fills the navbar input, and calls `fetchAndRender()`.

---

## 🛡️ "Login Wall" Lazy Rendering
In multiple places, actions are blocked for non-authenticated users.

### The Quick View Modal (Browse Page)
If a guest clicks a product on `browse.html`, `openModal(id)` executes.
- It checks `apiService.getUserInfo()`.
- **Guest?** It forces the modal to show `<div id="qvLoginWall">` and hides `<div id="qvContent">`. (Does not even fetch the product content details).
- **User?** Show `<div id="qvContent">` and map the seller details dynamically.
