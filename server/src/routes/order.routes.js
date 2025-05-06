const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 订单详情接口不需要认证
router.get('/:id', orderController.getOrderDetail);

// 其他订单相关的路由需要登录
router.use(authMiddleware);

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/confirm', orderController.confirmOrder);
router.delete('/:id', orderController.deleteOrder);
router.post('/:id/pay', orderController.payOrder);

module.exports = router;
