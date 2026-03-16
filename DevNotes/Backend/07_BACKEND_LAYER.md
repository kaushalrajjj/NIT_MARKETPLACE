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
3. **Repositories / Models** (The Database Access)
   - Talks directly to MongoDB using Mongoose Models.
   - Example: `Product.js` (Schema) and `productRepository.js`

---

## 🗄️ The Database (MongoDB & Mongoose)

The system uses **MongoDB** hosted on Atlas. We use **Mongoose** to define schemas and interact with the data.

**Key Collections**:
- **users**: Registered student and admin accounts.
- **products**: All product listings (approved and pending).
- **activities**: Map of user actions (wishlists, listed ids, etc).

### Schema Features:
- **Automatic Timestamps**: All models have `createdAt` and `updatedAt`.
- **Validation**: Enforces email formats, roll number uniqueness, etc.
- **Middleware**: Password hashing via `bcrypt` happens automatically on user save.

### The Activity Model
Activity is tracked separately to keep the User model lean:
```json
{
  "user": "ObjectId(user_id)",
  "wishlisted": ["ObjectId(prod_1)", "ObjectId(prod_2)"],
  "listed": ["ObjectId(prod_1)"],
  "sold": [],
  "profileImage": "https://res.cloudinary.com/..."
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

## 🖼️ Cloudinary Integration

Images are no longer stored on the server's local disk.
1. **Upload**: We use `multer` to handle the file stream and the Cloudinary SDK to upload directly.
2. **Storage**: We store the **secure_url** returned by Cloudinary in the MongoDB document.
3. **Cleanup**: When a product or profile image is updated/deleted, we call the Cloudinary API to `destroy` the old asset.
4. **Optimization**: Frontend uses Cloudinary's dynamic URL transformations for resizing (e.g., adding `/w_800/` to the URL).

---

## 🔗 Cross-Service Communication

Usually, controllers only talk to their respective service layer. But sometimes services interact across domains.
- Example: Creating a product (`productService.createProduct`) calls `activityRepository.addListed` to ensure the user's activity tracker is mapped to the new item.
- Example: Deleting a product (`productService.deleteProduct`) calls `activityRepository.removeProductEverywhereOnDelete` to scrub that product ID from ALL wishlists and listings across the entire app.
