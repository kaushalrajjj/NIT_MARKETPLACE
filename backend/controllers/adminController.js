const adminService = require('../services/adminService');

/**
 * adminController — HTTP handlers for admin-only routes.
 * ────────────────────────────────────────────────────────
 * All routes here require BOTH protect + admin middlewares:
 *   protect → verifies JWT and attaches req.user
 *   admin   → checks req.user.role === 'admin', rejects everyone else
 *
 * Routes:
 *   GET    /api/admin/pending         → getPendingProducts
 *   GET    /api/admin/stats           → getStats
 *   PUT    /api/admin/approve/:id     → approveProduct
 *   GET    /api/admin/users           → getUsers
 *   GET    /api/admin/products        → getAllProducts
 *   DELETE /api/admin/products/:id    → deleteProductAdmin
 */
const adminController = {
    /**
     * GET /api/admin/pending — Fetch all listings waiting for approval.
     * Returns products with isApproved === false (and not rejected/deleted).
     */
    getPendingProducts: async (req, res) => {
        try {
            const products = await adminService.getPendingProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * PUT /api/admin/approve/:id — Approve or reject a listing.
     *
     * Body: { approve: true/false }
     *   true  → marks isApproved: true, status: 'available' (goes live on marketplace)
     *   false → marks status: 'rejected_by_admin' (stays in DB but hidden from browse)
     *
     * The admin's ID is recorded in actionByAdmin for audit trail.
     */
    approveProduct: async (req, res) => {
        const { approve } = req.body;
        try {
            const result = await adminService.approveProduct(req.params.id, approve, req.user._id);
            if (approve) {
                res.json(result); // Return the updated product
            } else {
                res.json({ message: 'Listing rejected and deleted' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * GET /api/admin/users — Return all registered students (passwords stripped).
     */
    getUsers: async (req, res) => {
        try {
            const users = await adminService.getUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * GET /api/admin/stats — Return platform-wide metrics for the admin dashboard.
     * Returns: { totalUsers, liveListings, pendingListings, totalVolume }
     */
    getStats: async (req, res) => {
        try {
            const stats = await adminService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * GET /api/admin/products — Return ALL products regardless of status.
     * (Normal students only see approved+available products on the browse page)
     * Admin sees: pending, approved, rejected, deleted — everything.
     */
    getAllProducts: async (req, res) => {
        try {
            const products = await adminService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * DELETE /api/admin/products/:id — Force-delete an inappropriate listing.
     *
     * Unlike student self-deletion (which removes from DB), admin deletion
     * sets status: 'deleted_by_admin' so there's an audit trail.
     * Also removes the product from everyone's wishlists.
     */
    deleteProductAdmin: async (req, res) => {
        try {
            const result = await adminService.deleteProductAdmin(req.params.id, req.user._id);
            res.json({ message: 'Product deleted by admin', product: result });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adminController;
