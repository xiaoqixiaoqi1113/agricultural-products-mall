const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        console.log(token);

        if (!token) return res.status(401).json({ code: 401, message: '未登录' });

        console.log(1111);

        const decoded = jwt.verify(token, '@!#$#@123456');

        console.log(decoded);

        console.log(2222);

        const user = await User.findByPk(decoded.id);

        console.log(user);

        console.log(3333);

        if (!user) return res.status(401).json({ code: 401, message: '用户不存在' });

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            message: '认证失败',
        });
    }
};

module.exports = authMiddleware;
