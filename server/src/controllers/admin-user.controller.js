const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

// 获取管理员列表
exports.getAdminUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search, role, status } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};
        if (search) {
            where[Op.or] = [{ username: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }];
        }
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Admin.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: offset,
        });

        res.json({
            code: 200,
            data: {
                total: count,
                items: rows,
            },
        });
    } catch (error) {
        console.error('获取管理员列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 创建管理员
exports.createAdminUser = async (req, res) => {
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
        const admin = await Admin.create({
            username,
            password: hashedPassword,
            role,
            email,
            phone,
            status: 'active',
        });

        // 返回创建的用户信息(不包含密码)
        const { password: _, ...adminData } = admin.toJSON();

        res.status(201).json({
            code: 200,
            message: '创建成功',
            data: adminData,
        });
    } catch (error) {
        console.error('创建管理员失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 更新管理员信息
exports.updateAdminUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, phone, role, status } = req.body;

        const admin = await Admin.findByPk(id);
        if (!admin) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            });
        }

        // 更新用户信息
        await admin.update({
            email,
            phone,
            role,
            status,
        });

        res.json({
            code: 200,
            message: '更新成功',
            data: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                status: admin.status,
            },
        });
    } catch (error) {
        console.error('更新管理员信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 重置管理员密码
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const admin = await Admin.findByPk(id);
        if (!admin) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await admin.update({ password: hashedPassword });

        res.json({
            code: 200,
            message: '密码重置成功',
        });
    } catch (error) {
        console.error('重置密码失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 删除管理员
exports.deleteAdminUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 不能删除自己
        if (id === req.admin.id) {
            return res.status(400).json({
                code: 400,
                message: '不能删除当前登录用户',
            });
        }

        const result = await Admin.destroy({
            where: { id },
        });

        if (!result) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            });
        }

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除管理员失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};
