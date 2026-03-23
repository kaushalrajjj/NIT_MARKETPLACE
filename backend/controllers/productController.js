const productService = require('../services/productService');
const userService = require('../services/userService');

/**
 * Controller for product-related HTTP requests.
 */
const productController = {
    /** 
     * Search and Filter Products 
     * Supports optional authentication to exclude user's own products 
     */
    queryProducts: async (req, res, next) => {
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
            next(error);
        }
    },

    /** 
     * Add or Remove Product from User Wishlist 
     */
    syncWishlist: async (req, res, next) => {
        try {
            const { productId, isAdded } = req.body;
            await productService.updateWishlist(req.user._id, productId, isAdded);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    /** 
     * List a New Product for Sale 
     */
    createProduct: async (req, res, next) => {
        try {
            const product = await productService.createProduct(req.user._id, req.body);
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    },

    /** 
     * Get Detailed Information for a Single Product 
     */
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

    /** 
     * Get All Products Listed by the Current User 
     */
    getMyProducts: async (req, res) => {
        try {
            const products = await productService.getUserProducts(req.user._id);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /** 
     * Get General Marketplace Statistics 
     */
    getPublicStats: async (req, res) => {
        try {
            const stats = await userService.getPublicStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /** 
     * Update Product Availability Status (e.g., Sold) 
     */
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

    /** 
     * Permanently Remove a Product Listing 
     */
    deleteProduct: async (req, res) => {
        try {
            await productService.deleteProduct(req.params.id, req.user._id);
            res.json({ message: 'Product removed' });
        } catch (err) {
            const isAuthError = err.message === 'Not authorized';
            res.status(isAuthError ? 401 : 404).json({ message: err.message });
        }
    },

    /** 
     * Update Product Details (Title, Description, Price, etc.) 
     */
    updateProduct: async (req, res, next) => {
        try {
            const updated = await productService.updateProduct(req.params.id, req.user._id, req.body);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = productController;
