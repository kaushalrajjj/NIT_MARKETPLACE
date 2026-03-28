const { cloudinary, avatarStorage } = require('../config/cloudinary');
const multer = require('multer');
const userService = require('../services/userService');
const productService = require('../services/productService');
const activityRepository = require('../repositories/activityRepository');
const bcrypt = require('bcryptjs');

/**
 * Multer upload config for profile avatars.
 *
 * multer is a middleware for handling multipart/form-data (file uploads).
 * Instead of storing files on disk, we use Cloudinary's multer storage adapter
 * (avatarStorage) which streams the file directly to Cloudinary — no disk I/O.
 *
 * Limits:
 *   fileSize: 5MB max (profile photos don't need to be huge)
 *   fileFilter: only image formats (jpg, png, webp, gif)
 */
const upload = multer({
    storage: avatarStorage, // Stream directly to Cloudinary's avatars folder
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB = 5 × 1024 × 1024 bytes
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const path = require('path');
        const ext = path.extname(file.originalname).toLowerCase();
        // cb(null, true)  = accept the file
        // cb(new Error)   = reject the file with an error message
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
});

/**
 * userController — HTTP handlers for user profile + activity routes
 * ─────────────────────────────────────────────────────────────────
 * All routes here require authentication (protect middleware) except where noted.
 *
 * Routes:
 *   GET    /api/users/me           → getMe
 *   PUT    /api/users/me           → updateMe
 *   PUT    /api/users/me/password  → changePassword (direct, no OTP — legacy)
 *   POST   /api/users/me/avatar    → uploadAvatar
 *   DELETE /api/users/me/avatar    → removeAvatar
 *   GET    /api/users/me/wishlist  → getWishlist
 *   GET    /api/users/activity     → getActivity
 */
const userController = {
    /**
     * GET /api/users/me — Return the current user's profile.
     *
     * The protect middleware already resolved and attached the user to req.user,
     * so we just send it back. Password is already stripped in the middleware.
     */
    getMe: async (req, res) => {
        try {
            res.json(req.user); // Safely pre-resolved by protect middleware (no password)
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me — Update editable contact fields.
     *
     * Only allows: mobileNo, whatsappNo, secondaryEmail.
     * Academic fields (branch, year, hostel, rollNo) are immutable after registration.
     * If whatsappNo is not provided but mobileNo is, whatsapp defaults to mobile.
     */
    updateMe: async (req, res) => {
        try {
            const { mobileNo, whatsappNo, secondaryEmail } = req.body;

            // Build the update patch — only include fields that were actually sent
            const patch = {};
            if (mobileNo !== undefined)       patch.mobileNo = mobileNo;
            if (whatsappNo !== undefined)     patch.whatsappNo = whatsappNo;
            if (secondaryEmail !== undefined) patch.secondaryEmail = secondaryEmail;

            // If only mobileNo was updated and whatsappNo wasn't provided,
            // keep whatsapp in sync with mobile (they're usually the same)
            if (whatsappNo === undefined && mobileNo !== undefined) patch.whatsappNo = mobileNo;

            const updated = await userService.updateUserProfile(req.user._id, patch);
            if (!updated) return res.status(404).json({ message: 'User not found' });

            // Strip password from response before sending
            const userObj = updated.toObject ? updated.toObject() : updated;
            const { password: _pw, ...safe } = userObj;
            res.json(safe);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me/password — Change password directly (no OTP).
     *
     * LEGACY route — still works but the app now uses the OTP-gated flow
     * (see authController.sendPasswordChangeOtp and verifyOtpAndChangePassword).
     * This route is kept for compatibility but NOT called by the frontend.
     *
     * Validation:
     *   - Both current and new password must be provided
     *   - New password must be 6-12 characters
     *   - Current password must match the stored bcrypt hash
     */
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Both current and new password are required.' });
            }
            if (newPassword.length < 6 || newPassword.length > 12) {
                return res.status(400).json({ message: 'New password must be between 6 and 12 characters.' });
            }

            // Fetch the full user document (with password hash) from DB
            const user = await userService.getUserById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Compare the submitted current password against the stored bcrypt hash
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            // Hash the new password before saving (never store plain text)
            const salt = await bcrypt.genSalt(12); // 12 salt rounds = secure but not too slow
            const hashedNew = await bcrypt.hash(newPassword, salt);
            await userService.updateUserProfile(req.user._id, { password: hashedNew });

            res.json({ message: 'Password updated successfully.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/users/me/avatar — Upload or replace the user's profile photo.
     *
     * This is an "array controller" — it's an array of two middlewares:
     *   1. upload.single('avatar') — multer intercepts the request, reads the file,
     *      streams it to Cloudinary, and puts the URL into req.file.path
     *   2. The async handler — deletes the old avatar from Cloudinary if it exists,
     *      then saves the new URL to UserActivity
     *
     * WHY UserActivity and not User?
     *   Profile photos are optional and frequently changed.
     *   The User model stores core identity data (name, email, roll, branch) which
     *   rarely changes. Avatar is stored in the UserActivity collection instead.
     */
    uploadAvatar: [
        upload.single('avatar'), // multer middleware: field name must be 'avatar' in the form
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded.' });
                }

                const userId = req.user._id;

                // Get or create the activity record for this user
                const activity = await activityRepository.getOrCreate(userId);

                // If there's already an avatar, delete it from Cloudinary first.
                // We only store one avatar per user — old ones would waste storage.
                if (activity.img && activity.img.startsWith('http')) {
                    try {
                        // Reconstruct the Cloudinary public_id from the stored URL
                        // URL format: .../upload/nit_marketplace/avatars/filename.jpg
                        const urlParts = activity.img.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('.')[0]; // strip extension
                        const folderName = 'nit_marketplace/avatars';
                        await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
                    } catch (err) {
                        // Log but don't fail the request — old image deletion is best-effort
                        console.error('Cloudinary avatar delete error:', err);
                    }
                }

                // multer + Cloudinary storage puts the uploaded image URL in req.file.path
                const newImageUrl = req.file.path;

                // Save the new avatar URL in the UserActivity record
                await activityRepository.update(userId, { img: newImageUrl });

                res.json({
                    message: 'Avatar uploaded to Cloudinary.',
                    img: newImageUrl,
                    url: newImageUrl
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    /**
     * DELETE /api/users/me/avatar — Remove profile photo.
     * Deletes from Cloudinary and sets activity.img = null in DB.
     */
    removeAvatar: async (req, res) => {
        try {
            const userId = req.user._id;
            const activity = await activityRepository.getOrCreate(userId);

            if (activity.img) {
                if (activity.img.startsWith('http')) {
                    try {
                        const urlParts = activity.img.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('.')[0];
                        const folderName = 'nit_marketplace/avatars';
                        await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
                    } catch (err) {
                        console.error('Cloudinary avatar delete error:', err);
                    }
                }
                await activityRepository.update(userId, { img: null }); // Clear the URL
            }
            res.json({ message: 'Avatar removed.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/users/me/wishlist — Return full product objects for all wishlisted items.
     *
     * UserActivity stores just the product IDs in the wishlisted array.
     * This controller fetches each product's full data so the frontend can display them.
     * filter(Boolean) removes any nulls (from products that were deleted after being wishlisted).
     */
    getWishlist: async (req, res) => {
        try {
            const activity = await activityRepository.getOrCreate(req.user._id);
            const wishlistedIds = activity.wishlisted || [];

            // Fetch all wishlisted products in parallel (Promise.all is faster than sequential await)
            const products = await Promise.all(
                wishlistedIds.map(id => productService.getProductById(id))
            );

            // Filter out nulls (products that no longer exist)
            res.json(products.filter(Boolean));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/users/activity — Return the user's activity record.
     * Includes: listed[], sold[], wishlisted[], img (avatar URL).
     */
    getActivity: async (req, res) => {
        try {
            const activity = await productService.getUserActivity(req.user._id);
            res.json(activity);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = userController;
