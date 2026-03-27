const express = require('express');
const { getMe, updateMe, changePassword, uploadAvatar, removeAvatar, getActivity, getWishlist } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get current user's profile information
router.get('/me',              protect, getMe);

// Update user contact details (Mobile/WhatsApp)
router.put('/me',              protect, updateMe);

// Change account password
router.put('/me/password',     protect, changePassword);

// Upload or update profile avatar image
router.post('/me/avatar',      protect, uploadAvatar);

// Remove profile avatar image
router.delete('/me/avatar',    protect, removeAvatar);

// Get current user's wishlist items
router.get('/me/wishlist',     protect, getWishlist);

// Get user activity summary (listings, etc.)
router.get('/activity',        protect, getActivity);

module.exports = router;
