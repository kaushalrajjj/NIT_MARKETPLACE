const express = require('express');
const { getMe, updateMe, changePassword, uploadAvatar, removeAvatar, getActivity, getWishlist } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/me',              protect, getMe);
router.put('/me',              protect, updateMe);
router.put('/me/password',     protect, changePassword);
router.post('/me/avatar',      protect, uploadAvatar);
router.delete('/me/avatar',    protect, removeAvatar);
router.get('/me/wishlist',     protect, getWishlist);
router.get('/activity',        protect, getActivity);

module.exports = router;
