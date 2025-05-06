const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin-auth.controller');
const { adminAuthMiddleware } = require('../middlewares/admin-auth.middleware');

// 公开路由
router.post('/login', adminAuthController.login);
router.post('/register', adminAuthController.register);

// 需要认证的路由
router.use(adminAuthMiddleware);
router.get('/profile', adminAuthController.getProfile);
router.post('/change-password', adminAuthController.changePassword);
router.post('/logout', adminAuthController.logout);

module.exports = router;
