# 🗄️ Backend Layer & Database

> **DevNote #07** — Covers Node.js Backend (`server.js`, `app.js`, `routes`, `controllers`, `services`, `repositories`, `data`)

---

## 🏗️ Backend Architecture (3-Tier)

The backend follows a standard 3-tier REST architecture:

1. **Routes & Controllers** (The Entry Point)
   - Handles HTTP (req, res), extracts parameters/body.
   - Example: `productController.js`
2. **Services** (The Brains)
   - Business logic, validation, authorization checks.
   - Example: `productService.js`
3. **Repositories** (The Database Access)
   - Talks directly to the database (JSON files).
   - Example: `productRepository.js`

---

## 📂 The JSON "Database"

The system doesn't use MongoDB or SQL. It writes straight to JSON files using a custom wrapper in `backend/config/jsonDb.js`.

**Data files stored in `/data/`**:
- `users.json`: Registered students.
- `admins.json`: System administrators.
- `products.json`: All product listings.
- `userActivity.json`: User interactions and stats.

### `jsonDb.js` Features:
- **`find(query)`**: Returns all items matching the query.
- **`findOne(query)`**: Returns the first item matching the query.
- **`findById(id)`**: Fast lookup by `_id`.
- **`create(data)`**: Auto-generates `_id` and `createdAt`, saves to JSON.
- **`update(id, patch)`**: Merges patch, updates `updatedAt`, saves to JSON.
- **`delete(id)`**: Removes item and saves.

### The `userActivity.json` Store
Because activity is heavily accessed by `userId`, it uses a specific map structure:
```json
{
  "userId_123": {
    "wishlisted": ["prod_abc", "prod_xyz"],
    "listed": ["prod_abc", "prod_123"],
    "sold": ["prod_old"],
    "orderHistory": [],
    "img": "userId_123_timestamp.jpg"
  }
}
```

---

## 🚦 Routing (`backend/routes/`)

Mapped in `app.js`:
```js
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/users',    userRoutes);
```

### Express Static Serving
`app.js` is also responsible for serving the frontend and images:
```js
// Serve HTML pages (Clean URLs)
app.get('/browse', (req, res) => res.sendFile(path.join(frontendPath, 'pages', 'browse.html')));

// Serve images
app.use('/profile-images', express.static(profileImagesPath));
app.use('/product-images', express.static(productImagesPath));
```

---

## 🛡️ Authentication Middleware (`authMiddleware.js`)

Most endpoints are guarded. The middleware checks the `Authorization: Bearer <token>` header.

- **`protect`**: Requires a valid JWT. Attaches `req.user`. Returns 401 if missing/invalid.
- **`admin`**: Checks if `req.user.role === 'admin'`. Returns 401 if not.
- **`optionalAuth`**: Attaches `req.user` if a token is present, but allows guests to proceed without error. (Used for `/api/products/query` to exclude a logged-in user's own listings).

---

## 📦 API Cheat Sheet

### Auth
- `POST /api/auth/login`: Authenticates against `users.json` or `admins.json`, returns JWT.

### Users
- `GET /api/users/me`: Returns `req.user` profile.
- `PUT /api/users/me`: Updates contact fields (phone, whatsapp, secondaryEmail).
- `PUT /api/users/me/password`: Updates password via `bcrypt`.
- `POST /api/users/me/avatar`: Uploads profile image via `multer`.
- `DELETE /api/users/me/avatar`: Removes profile image file.
- `GET /api/users/me/wishlist`: Returns full product objects for wishlisted IDs.
- `GET /api/users/activity`: Returns the `userActivity` object for `req.user`.

### Products
- `POST /api/products/query`: Advanced search (filters, sort, pagination). Optional Auth.
- `POST /api/products/wishlist`: Adds/removes a product from `req.user`'s wishlist.
- `GET /api/products/stats/public`: Returns high-level stats for the homepage.
- `GET /api/products/me`: Returns all products where `seller === req.user._id`.
- `POST /api/products/`: Creates new product listing.
- `PUT /api/products/:id/status`: Updates status (e.g., 'sold').
- `PATCH /api/products/:id`: Updates title, desc, price, condition (owner only).
- `DELETE /api/products/:id`: Deletes listing and cleans up wishlists globally (owner only).
- `POST /api/products/:id/image`: Uploads/replaces listing image.
- `DELETE /api/products/:id/image`: Removes listing image.
- `GET /api/products/:id`: Retrieves a single product by ID.

---

## 🖼️ File Uploads (`multer`)

Images are uploaded as `multipart/form-data`.
`multer` intercepts the file in `userController.js` and `productImageController.js`.
- Saved mapped securely (e.g., `userId_timestamp.jpg`).
- File size limites (e.g., 2MB for profile, 4MB for products).
- Automatic old file cleanup when an image is replaced or deleted.

---

## 🔗 Cross-Service Communication

Usually, controllers only talk to their respective service layer. But sometimes services interact across domains.
- Example: Creating a product (`productService.createProduct`) calls `activityRepository.addListed` to ensure the user's activity tracker is mapped to the new item.
- Example: Deleting a product (`productService.deleteProduct`) calls `activityRepository.removeProductEverywhereOnDelete` to scrub that product ID from ALL wishlists and listings across the entire app.
