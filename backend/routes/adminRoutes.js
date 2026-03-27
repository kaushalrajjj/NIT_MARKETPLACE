const express = require('express');
const { getPendingProducts, approveProduct, getUsers, getStats, getAllProducts, deleteProductAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Fetch listings that require admin approval
router.get('/pending', protect, admin, getPendingProducts);

// Get counts of users, products, etc.
router.get('/stats', protect, admin, getStats);

// Approve a product listing
router.put('/approve/:id', protect, admin, approveProduct);

// Retrieve all registered users
router.get('/users', protect, admin, getUsers);

// Retrieve all product listings (all states)
router.get('/products', protect, admin, getAllProducts);

// Delete an inappropriate listing
router.delete('/products/:id', protect, admin, deleteProductAdmin);

module.exports = router;
