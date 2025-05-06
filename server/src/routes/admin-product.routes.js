const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/admin-product.controller');
const { adminAuthMiddleware, hasMerchantPermission } = require('../middlewares/admin-auth.middleware');

// 所有路由都需要管理员或商户身份验证
router.use(adminAuthMiddleware);

// 获取商品列表
router.get('/', adminProductController.getProducts);

// 获取商品详情
router.get('/:id', adminProductController.getProductDetail);

// 以下接口需要商户权限(管理员也可以访问)
router.use(hasMerchantPermission);

// 创建商品
router.post('/', adminProductController.createProduct);

// 更新商品
router.put('/:id', adminProductController.updateProduct);

// 删除商品
router.delete('/:id', adminProductController.deleteProduct);

// 批量删除商品
router.post('/batch/delete', adminProductController.batchDeleteProducts);

module.exports = router;
