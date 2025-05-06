const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 所有购物车相关的路由都需要登录
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);
router.put('/selected', cartController.updateSelected);
router.put('/selected/all', cartController.updateAllSelected);

module.exports = router;
