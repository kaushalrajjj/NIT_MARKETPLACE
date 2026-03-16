const productService = require('../services/productService');
const userService = require('../services/userService');

/**
 * Controller for product-related HTTP requests.
 */
const productController = {
    queryProducts: async (req, res) => {
        try {
            if (req.user) {
                req.body.filters = req.body.filters || {};
                // Only exclude if NOT explicitly filtering for a seller
                if (!req.body.filters.seller) {
                    req.body.filters.excludeSeller = req.user._id;
                }
            }
            const data = await productService.queryProducts(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    syncWishlist: async (req, res) => {
        try {
            const { productId, isAdded } = req.body;
            await productService.updateWishlist(req.user._id, productId, isAdded);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createProduct: async (req, res) => {
        try {
            const product = await productService.createProduct(req.user._id, req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductById: async (req, res) => {
        try {
            const product = await productService.getProductById(req.params.id);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMyProducts: async (req, res) => {
        try {
            const products = await productService.getUserProducts(req.user._id);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPublicStats: async (req, res) => {
        try {
            const stats = await userService.getPublicStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateProductStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const updated = await productService.updateProductStatus(req.params.id, req.user._id, status);
            res.json(updated);
        } catch (err) {
            const isAuthError = err.message === 'Not authorized';
            res.status(isAuthError ? 401 : 404).json({ message: err.message });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            await productService.deleteProduct(req.params.id, req.user._id);
            res.json({ message: 'Product removed' });
        } catch (err) {
            const isAuthError = err.message === 'Not authorized';
            res.status(isAuthError ? 401 : 404).json({ message: err.message });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const updated = await productService.updateProduct(req.params.id, req.user._id, req.body);
            res.json(updated);
        } catch (err) {
            const status = err.message.startsWith('Unauthorized') ? 403 : 400;
            res.status(status).json({ message: err.message });
        }
    }
};

module.exports = productController;
