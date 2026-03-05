const express = require('express');
const { getPendingProducts, approveProduct, getUsers, getStats } = require('../handlers/adminHandler');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/pending', protect, admin, getPendingProducts);
router.get('/stats', protect, admin, getStats);
router.put('/approve/:id', protect, admin, approveProduct);
router.get('/users', protect, admin, getUsers);

module.exports = router;
