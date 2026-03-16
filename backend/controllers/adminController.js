const adminService = require('../services/adminService');

const adminController = {
    getPendingProducts: async (req, res) => {
        try {
            const products = await adminService.getPendingProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    approveProduct: async (req, res) => {
        const { approve } = req.body;
        try {
            const result = await adminService.approveProduct(req.params.id, approve);
            if (approve) {
                res.json(result);
            } else {
                res.json({ message: 'Listing rejected and deleted' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await adminService.getUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getStats: async (req, res) => {
        try {
            const stats = await adminService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const products = await adminService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteProductAdmin: async (req, res) => {
        try {
            const result = await adminService.deleteProductAdmin(req.params.id);
            res.json({ message: 'Product deleted by admin', product: result });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adminController;
