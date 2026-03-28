const express = require('express');
const { getPendingProducts, approveProduct, getUsers, getStats, getAllProducts, deleteProductAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * Admin Routes — /api/admin/*
 * ────────────────────────────
 * ALL routes here require BOTH auth middlewares in order:
 *   1. protect → verifies the JWT token, attaches req.user
 *   2. admin   → checks req.user.role === 'admin', rejects students
 *
 * If any middleware fails, the request is rejected before hitting the controller.
 *
 * These routes allow admins to view and moderate all content on the platform.
 * Regular students can NEVER access any of these routes.
 */

// GET /api/admin/pending
// Returns all listings with isApproved: false (waiting for review).
// Excludes rejected and deleted listings.
router.get('/pending',         protect, admin, getPendingProducts);

// GET /api/admin/stats
// Returns platform metrics: { totalUsers, liveListings, pendingListings, totalVolume }
// Shown in the admin dashboard stats bar.
router.get('/stats',           protect, admin, getStats);

// PUT /api/admin/approve/:id
// Approve or reject a pending listing.
// Body: { approve: true } → make it live
// Body: { approve: false } → reject it (status: 'rejected_by_admin')
// Records which admin took the action in the product's actionByAdmin field.
router.put('/approve/:id',     protect, admin, approveProduct);

// GET /api/admin/users
// Returns list of all registered students (passwords stripped).
// Used to display the user count in the admin panel.
router.get('/users',           protect, admin, getUsers);

// GET /api/admin/products
// Returns ALL products in all states (pending, approved, rejected, deleted).
// Unlike the public browse endpoint which only shows approved+available.
router.get('/products',        protect, admin, getAllProducts);

// DELETE /api/admin/products/:id
// Admin soft-deletes a listing: sets status to 'deleted_by_admin' (not hard deleted).
// Also removes it from all users' wishlists.
// Records which admin deleted it in actionByAdmin.
router.delete('/products/:id', protect, admin, deleteProductAdmin);

module.exports = router;
