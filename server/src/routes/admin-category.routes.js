const express = require('express');
const router = express.Router();
const adminCategoryController = require('../controllers/admin-category.controller');
const { adminAuthMiddleware, isAdminRole } = require('../middlewares/admin-auth.middleware');

// 所有路由都需要管理员或商户身份验证
router.use(adminAuthMiddleware);

// 获取分类列表
router.get('/', adminCategoryController.getCategories);

// 以下接口需要管理员权限
router.use(isAdminRole);

// 创建分类
router.post('/', adminCategoryController.createCategory);

// 更新分类
router.put('/:id', adminCategoryController.updateCategory);

// 删除分类
router.delete('/:id', adminCategoryController.deleteCategory);

module.exports = router;
