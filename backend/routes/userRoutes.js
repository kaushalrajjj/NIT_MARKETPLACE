const express = require('express');
const { getMe, updateMe, changePassword, uploadAvatar, removeAvatar, getActivity, getWishlist } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * User Routes — /api/users/*
 * ────────────────────────────
 * All routes here require authentication (protect middleware verifies the JWT).
 * These routes manage the logged-in user's own data.
 *
 * No admin routes are here — admin-specific actions are in /api/admin/*
 */

// GET /api/users/me
// Returns the current user's full profile (minus password).
// req.user is already attached by protect, so this is a passthrough.
router.get('/me',           protect, getMe);

// PUT /api/users/me
// Updates editable contact fields: mobileNo, whatsappNo, secondaryEmail.
// Academic fields (branch, year, hostel, rollNo) cannot be changed here.
router.put('/me',           protect, updateMe);

// PUT /api/users/me/password
// Changes password directly without OTP. LEGACY — not used by the frontend.
// Frontend uses the OTP-gated flow: /api/auth/send-password-change-otp then verify.
router.put('/me/password',  protect, changePassword);

// POST /api/users/me/avatar
// Uploads a new profile photo. Handled by multer + Cloudinary inside the controller.
// The old avatar is automatically deleted from Cloudinary before the new one is saved.
router.post('/me/avatar',   protect, uploadAvatar);

// DELETE /api/users/me/avatar
// Removes the profile photo — sets activity.img to null in DB and deletes from Cloudinary.
router.delete('/me/avatar', protect, removeAvatar);

// GET /api/users/me/wishlist
// Returns full product objects (not just IDs) for all saved items.
router.get('/me/wishlist',  protect, getWishlist);

// GET /api/users/activity
// Returns the full UserActivity record: { listed, sold, wishlisted, img }.
// Used by ProfilePage and DashboardPage to show activity stats.
router.get('/activity',     protect, getActivity);

module.exports = router;
