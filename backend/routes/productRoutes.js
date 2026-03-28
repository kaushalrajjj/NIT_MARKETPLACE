const express = require('express');
const productController = require('../controllers/productController');
const productImageController = require('../controllers/productImageController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * Product Routes — /api/products/*
 * ──────────────────────────────────
 * Mix of public and protected routes.
 * Public: browse, view single product, stats (no login needed)
 * Protected: create, edit, delete, image upload, wishlist (login required)
 *
 * IMPORTANT ORDERING:
 *   Static paths (like /query, /wishlist, /stats/public, /me) MUST be defined
 *   BEFORE the dynamic /:id route. Otherwise Express would try to match
 *   "query" or "wishlist" as an ID and fail to find a product.
 */

// POST /api/products/query
// Main browse endpoint — search, filter and paginate products.
// optionalAuth: logged-in users automatically have their own products excluded
// (the controller sets excludeSeller = req.user._id if there's a user).
router.post('/query',        optionalAuth, productController.queryProducts);

// POST /api/products/wishlist
// Toggle a product in/out of the logged-in user's wishlist.
// Body: { productId: '...', isAdded: true/false }
router.post('/wishlist',     protect, productController.syncWishlist);

// GET /api/products/stats/public
// Public stats for the landing page: total listings, students, etc.
// No auth needed — shown to all visitors.
router.get('/stats/public',  productController.getPublicStats);

// GET /api/products/me
// Returns all products listed by the current user (all states, including rejected).
// Used by DashboardPage to show "My Listings" tab.
router.get('/me',            protect, productController.getMyProducts);

// POST /api/products
// Create a new listing. Sets isApproved: false — must be approved by admin first.
router.post('/',             protect, productController.createProduct);

// PUT /api/products/:id/status
// Update the listing's status: 'sold' or 'available'.
// Only the seller can change their own listing's status.
router.put('/:id/status',   protect, productController.updateProductStatus);

// PATCH /api/products/:id
// Edit listing details: title, description, price, condition.
// Category CANNOT be changed (locked at creation — enforced in productService).
// Only the seller can edit their own listing.
router.patch('/:id',         protect, productController.updateProduct);

// DELETE /api/products/:id
// Permanently hard-delete a listing from the database.
// Only the seller can delete their own listing.
// (Admin soft-deletes via DELETE /api/admin/products/:id instead)
router.delete('/:id',        protect, productController.deleteProduct);

// POST /api/products/:id/image
// Upload or replace the product's image. Handled by multer + Cloudinary.
// Only the seller can upload to their own listing.
router.post('/:id/image',    protect, productImageController.uploadImage);

// DELETE /api/products/:id/image
// Remove the product's image (sets img: null in DB and deletes from Cloudinary).
// Only the seller can remove their own listing's image.
router.delete('/:id/image',  protect, productImageController.removeImage);

// GET /api/products/:id
// Get full details for one product, with seller profile resolved.
// Public — no auth needed. Used for QuickViewModal.
router.get('/:id',           productController.getProductById);

module.exports = router;
