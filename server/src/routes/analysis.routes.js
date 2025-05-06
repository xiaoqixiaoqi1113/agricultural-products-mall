const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { adminAuthMiddleware } = require('../middlewares/admin-auth.middleware');

// 所有数据分析相关的路由都需要登录
router.use(adminAuthMiddleware);

// 获取统计数据
router.get('/statistics', analysisController.getStatistics);

// 获取销售趋势
router.get('/sales-trend', analysisController.getSalesTrend);

// 获取热销商品
router.get('/hot-products', analysisController.getHotProducts);

module.exports = router;
