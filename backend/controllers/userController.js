const { cloudinary, avatarStorage } = require('../config/cloudinary');
const multer = require('multer');
const userService = require('../services/userService');
const productService = require('../services/productService');
const activityRepository = require('../repositories/activityRepository');
const bcrypt = require('bcryptjs');

const upload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // increased to 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const path = require('path');
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
});

const userController = {
    /**
     * GET /api/users/me — Get current user's profile
     */
    getMe: async (req, res) => {
        try {
            const user = await userService.getUserById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            
            const userObj = user.toObject ? user.toObject() : user;
            const { password, ...safe } = userObj;
            res.json(safe);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me — Update changeable contact fields only
     */
    updateMe: async (req, res) => {
        try {
            const { mobileNo, whatsappNo } = req.body;
            const patch = {};
            if (mobileNo !== undefined)   patch.mobileNo = mobileNo;
            if (whatsappNo !== undefined)  patch.whatsappNo = whatsappNo;

            const updated = await userService.updateUserProfile(req.user._id, patch);
            if (!updated) return res.status(404).json({ message: 'User not found' });
            
            const userObj = updated.toObject ? updated.toObject() : updated;
            const { password: _pw, ...safe } = userObj;
            res.json(safe);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * PUT /api/users/me/password — Change password
     */
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Both current and new password are required.' });
            }
            if (newPassword.length < 12) {
                return res.status(400).json({ message: 'New password must be at least 12 characters.' });
            }

            const user = await userService.getUserById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            const salt = await bcrypt.genSalt(12);
            const hashedNew = await bcrypt.hash(newPassword, salt);
            await userService.updateUserProfile(req.user._id, { password: hashedNew });

            res.json({ message: 'Password updated successfully.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/users/me/avatar — Upload profile image
     */
    uploadAvatar: [
        upload.single('avatar'),
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded.' });
                }

                const userId = req.user._id;
                const activity = await activityRepository.getOrCreate(userId);

                // Delete previous avatar from Cloudinary if it exists
                if (activity.img && activity.img.startsWith('http')) {
                    try {
                        const urlParts = activity.img.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('.')[0];
                        const folderName = 'nit_marketplace/avatars';
                        await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
                    } catch (err) {
                        console.error('Cloudinary avatar delete error:', err);
                    }
                }

                const newImageUrl = req.file.path;
                // Store new URL in userActivity
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
     * DELETE /api/users/me/avatar — Remove profile image
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
                await activityRepository.update(userId, { img: null });
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
            const activity = await activityRepository.getOrCreate(req.user._id);
            const wishlistedIds = activity.wishlisted || [];
            const products = await Promise.all(
                wishlistedIds.map(id => productService.getProductById(id))
            );
            res.json(products.filter(Boolean));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/users/activity — Get current user's activity
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
