const path = require('path');
const fs = require('fs');
const multer = require('multer');
const userService = require('../services/userService');
const productService = require('../services/productService');
const activityRepository = require('../repositories/activityRepository');
const bcrypt = require('bcryptjs');
const jsonDb = require('../config/jsonDb');

// ── Multer setup: store uploaded profile images in /data/profile-images ────────
const UPLOAD_DIR = path.join(__dirname, '../../data/profile-images');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        // Filename: userId + timestamp + extension
        cb(null, `${req.user._id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
});

const userController = {
    /**
     * GET /api/users/me — Get current user's profile (non-changeable + changeable fields)
     */
    getMe: async (req, res) => {
        try {
            const user = await userService.getUserById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const { password, ...safe } = user;
            res.json(safe);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me — Update changeable contact fields only
     * Accepted: phone, whatsapp, secondaryEmail
     */
    updateMe: async (req, res) => {
        try {
            const { phone, whatsapp, secondaryEmail } = req.body;
            const patch = {};
            if (phone !== undefined)         patch.phone = phone;
            if (whatsapp !== undefined)       patch.whatsapp = whatsapp;
            if (secondaryEmail !== undefined) patch.secondaryEmail = secondaryEmail;

            const updated = await userService.updateUserProfile(req.user._id, patch);
            if (!updated) return res.status(404).json({ message: 'User not found' });
            const { password: _pw, ...safe } = updated;
            res.json(safe);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me/password — Change password (requires current password)
     * Body: { currentPassword, newPassword }
     */
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Both current and new password are required.' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters.' });
            }

            const user = jsonDb.users.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNew = await bcrypt.hash(newPassword, salt);
            await userService.updateUserProfile(req.user._id, { password: hashedNew });

            res.json({ message: 'Password updated successfully.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/users/me/avatar — Upload profile image
     * Saves file to /data/profile-images/, stores filename in userActivity.img
     * Deletes old avatar file if it existed.
     */
    uploadAvatar: [
        upload.single('avatar'),
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded.' });
                }

                const userId = req.user._id;
                const newFilename = req.file.filename;

                // Delete previous avatar if any
                const activity = activityRepository.getOrCreate(userId);
                if (activity.img) {
                    const oldPath = path.join(UPLOAD_DIR, activity.img);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                // Store new filename in userActivity
                activityRepository.update(userId, { img: newFilename });

                res.json({
                    message: 'Avatar uploaded.',
                    img: newFilename,
                    url: `/profile-images/${newFilename}`
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    /**
     * DELETE /api/users/me/avatar — Remove profile image (revert to initials)
     */
    removeAvatar: async (req, res) => {
        try {
            const userId = req.user._id;
            const activity = activityRepository.getOrCreate(userId);
            if (activity.img) {
                const oldPath = path.join(UPLOAD_DIR, activity.img);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                activityRepository.update(userId, { img: null });
            }
            res.json({ message: 'Avatar removed.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/users/me/wishlist — Full product objects for all wishlisted items
     */
    getWishlist: async (req, res) => {
        try {
            const activity = activityRepository.getOrCreate(req.user._id);
            const wishlistedIds = activity.wishlisted || [];
            const products = wishlistedIds
                .map(id => jsonDb.products.findById(id))
                .filter(Boolean); // exclude any deleted products
            res.json(products);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/users/activity — Get current user's activity (wishlisted, listed, sold, img)
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
