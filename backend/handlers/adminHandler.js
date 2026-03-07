const jsonDb = require('../config/jsonDb');

// @desc    Get all pending products for approval
// @route   GET /api/admin/pending
const getPendingProducts = async (req, res) => {
    try {
        const products = jsonDb.products.find({ isApproved: false });
        const productsWithSeller = products.map(p => {
            const seller = jsonDb.users.findById(p.seller);
            return { ...p, seller: seller ? { name: seller.name, email: seller.email } : null };
        });
        res.json(productsWithSeller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject a listing
// @route   PUT /api/admin/approve/:id
const approveProduct = async (req, res) => {
    const { approve } = req.body;
    try {
        if (approve) {
            const product = jsonDb.products.update(req.params.id, { isApproved: true });
            res.json(product);
        } else {
            jsonDb.products.delete(req.params.id);
            res.json({ message: 'Listing rejected and deleted' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const users = jsonDb.users.find();
        const usersSanitized = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(usersSanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get platform stats (Admin only)
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const users = jsonDb.users.find();
        const products = jsonDb.products.find();
        const liveListings = products.filter(p => p.isApproved).length;
        const pendingListings = products.filter(p => !p.isApproved).length;

        res.json({
            totalUsers: users.length,
            liveListings,
            pendingListings,
            totalVolume: products.reduce((acc, p) => acc + (p.price || 0), 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingProducts, approveProduct, getUsers, getStats };
