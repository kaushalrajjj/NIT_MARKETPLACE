const express = require('express');
const { getProducts, createProduct, getProductById, getMyProducts, getPublicStats, updateProductStatus, deleteProduct } = require('../handlers/productHandler');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getProducts);
router.get('/stats/public', getPublicStats);
router.get('/me', protect, getMyProducts);
router.post('/', protect, createProduct);
router.put('/:id/status', protect, updateProductStatus);
router.delete('/:id', protect, deleteProduct);
router.get('/:id', getProductById);

module.exports = router;
