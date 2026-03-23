const express = require('express');
const productController = require('../controllers/productController');
const productImageController = require('../controllers/productImageController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// Specific paths must be defined before the generic /:id catch-all

// Search and filter products
router.post('/query',        optionalAuth, productController.queryProducts);

// Mark/unmark a product as wishlisted
router.post('/wishlist',     protect, productController.syncWishlist);

// Get counts and general marketplace stats
router.get('/stats/public',  productController.getPublicStats);

// Get current user's listed products
router.get('/me',            protect, productController.getMyProducts);

// Create a new product listing
router.post('/',             protect, productController.createProduct);

// Update product availability (Sold/Available)
router.put('/:id/status',   protect, productController.updateProductStatus);

// Edit product details
router.patch('/:id',         protect, productController.updateProduct);

// Delete product listing
router.delete('/:id',        protect, productController.deleteProduct);

// Upload/Update product image
router.post('/:id/image',    protect, productImageController.uploadImage);

// Remove product image
router.delete('/:id/image',  protect, productImageController.removeImage);

// Get specific product details
router.get('/:id',           productController.getProductById);

module.exports = router;
