const express = require('express');
const { getPendingProducts, approveProduct, getUsers, getStats, getAllProducts, deleteProductAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/pending', protect, admin, getPendingProducts);
router.get('/stats', protect, admin, getStats);
router.put('/approve/:id', protect, admin, approveProduct);
router.get('/users', protect, admin, getUsers);
router.get('/products', protect, admin, getAllProducts);
router.delete('/products/:id', protect, admin, deleteProductAdmin);

module.exports = router;
