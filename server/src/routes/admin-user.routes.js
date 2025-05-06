const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/admin-user.controller');
const { adminAuthMiddleware, isAdminRole } = require('../middlewares/admin-auth.middleware');

// 所有路由都需要管理员身份验证
router.use(adminAuthMiddleware);
router.use(isAdminRole);

// 获取管理员列表
router.get('/', adminUserController.getAdminUsers);

// 创建管理员
router.post('/', adminUserController.createAdminUser);

// 更新管理员信息
router.put('/:id', adminUserController.updateAdminUser);

// 重置管理员密码
router.post('/:id/reset-password', adminUserController.resetPassword);

// 删除管理员
router.delete('/:id', adminUserController.deleteAdminUser);

module.exports = router;
