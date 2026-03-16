const express = require('express');
const productController = require('../controllers/productController');
const productImageController = require('../controllers/productImageController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// Specific paths must be defined before the generic /:id catch-all

router.post('/query',        optionalAuth, productController.queryProducts);
router.post('/wishlist',     protect, productController.syncWishlist);
router.get('/stats/public',  productController.getPublicStats);
router.get('/me',            protect, productController.getMyProducts);
router.post('/',             protect, productController.createProduct);
router.put('/:id/status',   protect, productController.updateProductStatus);
router.patch('/:id',         protect, productController.updateProduct);
router.delete('/:id',        protect, productController.deleteProduct);
router.post('/:id/image',    protect, productImageController.uploadImage);
router.delete('/:id/image',  protect, productImageController.removeImage);
router.get('/:id',           productController.getProductById);

module.exports = router;
