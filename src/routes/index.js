const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Product routes
router.get('/products', productController.getProducts);
router.post('/products', protect, authorize('ADMIN'), productController.createProduct);
router.put('/products/:id', protect, authorize('ADMIN'), productController.updateProduct);
router.delete('/products/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
