const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            });
        }

        // 验证用户类型
        if (user.role === 'user') {
            return res.status(403).json({
                code: 403,
                message: '无权限访问',
            });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            });
        }

        // 更新最后登录时间
        await user.update({
            lastLoginTime: new Date(),
        });

        // 生成token
        const token = jwt.sign({ id: user.id, role: user.role }, '@!#$#@123456', { expiresIn: '24h' });

        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findOne({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({
                code: 400,
                message: '用户名已存在',
            });
        }

        // 创建新用户
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
            status: 'active',
            lastLoginTime: new Date(),
        });

        res.status(201).json({
            code: 200,
            message: '注册成功',
        });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 获取当前用户信息
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            });
        }

        res.json({
            code: 200,
            data: user,
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 退出登录
exports.logout = (req, res) => {
    res.json({
        code: 200,
        message: '退出成功',
    });
};
