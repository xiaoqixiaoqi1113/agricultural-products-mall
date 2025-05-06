const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(401).json({ code: 401, message: '未登录' });

        const decoded = jwt.verify(token, '@!#$#@123456');

        const admin = await Admin.findByPk(decoded.id);

        if (!admin) return res.status(401).json({ code: 401, message: '用户不存在' });

        if (admin.status === 'disabled') {
            return res.status(403).json({ code: 403, message: '账号已被禁用' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            message: '认证失败',
        });
    }
};

// 检查是否为管理员角色
const isAdminRole = (req, res, next) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({
            code: 403,
            message: '需要管理员权限',
        });
    }
    next();
};

// 检查是否为商户角色或管理员
const hasMerchantPermission = (req, res, next) => {
    if (req.admin.role !== 'merchant' && req.admin.role !== 'admin') {
        return res.status(403).json({
            code: 403,
            message: '需要商户权限',
        });
    }
    next();
};

module.exports = {
    adminAuthMiddleware,
    isAdminRole,
    hasMerchantPermission,
};
