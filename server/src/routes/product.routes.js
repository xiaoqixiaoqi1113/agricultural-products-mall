const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const optionalAuth = require('../middlewares/optional-auth.middleware');

// 使用可选认证中间件，这样未登录用户也能访问，但登录用户可以获取收藏状态
router.get('/', optionalAuth, productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', optionalAuth, productController.getProductDetail);

module.exports = router;
