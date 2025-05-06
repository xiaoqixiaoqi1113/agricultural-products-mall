const jwt = require('jsonwebtoken');
const User = require('../models/user');

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, '@!#$#@123456');
        const user = await User.findByPk(decoded.id);

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // 如果token无效，继续处理请求，但不设置req.user
        next();
    }
};

module.exports = optionalAuthMiddleware;
