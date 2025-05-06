const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const admin = await Admin.findOne({
            where: { username },
        });

        if (!admin) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            });
        }

        // 检查账号状态
        if (admin.status === 'disabled') {
            return res.status(403).json({
                code: 403,
                message: '账号已被禁用',
            });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            });
        }

        // 更新最后登录时间
        await admin.update({
            lastLoginTime: new Date(),
        });

        // 生成token
        const token = jwt.sign({ id: admin.id, role: admin.role }, '@!#$#@123456', { expiresIn: '24h' });

        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    email: admin.email,
                    phone: admin.phone,
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
        const { username, password, role, email, phone } = req.body;

        // 检查用户名是否已存在
        const existingAdmin = await Admin.findOne({
            where: { username },
        });

        if (existingAdmin) {
            return res.status(400).json({
                code: 400,
                message: '用户名已存在',
            });
        }

        // 创建新用户
        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({
            username,
            password: hashedPassword,
            role,
            email,
            phone,
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
        const admin = await Admin.findByPk(req.admin.id, {
            attributes: { exclude: ['password'] },
        });

        if (!admin) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            });
        }

        res.json({
            code: 200,
            data: admin,
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 修改密码
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const admin = await Admin.findByPk(req.admin.id);

        // 验证旧密码
        const isValidPassword = await bcrypt.compare(oldPassword, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                code: 400,
                message: '原密码错误',
            });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await admin.update({ password: hashedPassword });

        res.json({
            code: 200,
            message: '密码修改成功',
        });
    } catch (error) {
        console.error('修改密码失败:', error);
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
