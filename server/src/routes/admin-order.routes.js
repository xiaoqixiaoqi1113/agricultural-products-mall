const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin-order.controller');
const { adminAuthMiddleware } = require('../middlewares/admin-auth.middleware');

// 所有路由都需要管理员或商户身份验证
router.use(adminAuthMiddleware);

// 获取订单列表
router.get('/', adminOrderController.getOrders);

// 获取订单详情
router.get('/:id', adminOrderController.getOrderDetail);

// 更新订单状态
router.put('/:id/status', adminOrderController.updateOrderStatus);

// 删除订单
router.delete('/:id', adminOrderController.deleteOrder);

module.exports = router;
