const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const User = require('../models/user');

const { Op } = require('sequelize');

// 获取订单列表
const getOrders = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search, status } = req.query;
        const offset = (page - 1) * pageSize;

        // 构建查询条件
        const where = {};
        if (search) {
            where[Op.or] = [{ orderNo: { [Op.like]: `%${search}%` } }, { '$user.username$': { [Op.like]: `%${search}%` } }];
        }
        if (status) {
            where.status = status;
        }

        // 查询订单
        const { count, rows } = await Order.findAndCountAll({
            where,
            attributes: ['id', 'orderNo', 'status', 'totalAmount', 'address', 'createTime'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                },
                {
                    model: OrderItem,
                    as: 'products',
                    attributes: ['id', 'quantity', 'price'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image'],
                        },
                    ],
                },
            ],
            order: [['createTime', 'DESC']],
            offset,
            limit: parseInt(pageSize),
            distinct: true,
        });

        res.json({
            code: 200,
            data: {
                total: count,
                items: rows,
            },
        });
    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 获取订单详情
const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            attributes: ['id', 'orderNo', 'status', 'totalAmount', 'address', 'createTime'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                },
                {
                    model: OrderItem,
                    as: 'products',
                    attributes: ['id', 'quantity', 'price'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image', 'price'],
                        },
                    ],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在',
            });
        }

        res.json({
            code: 200,
            data: order,
        });
    } catch (error) {
        console.error('获取订单详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 更新订单状态
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 验证状态值
        const validStatuses = ['pending', 'paid', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                code: 400,
                message: '无效的订单状态',
            });
        }

        // 检查订单是否存在
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在',
            });
        }

        // 更新状态
        await order.update({ status });

        res.json({
            code: 200,
            message: '更新成功',
            data: order,
        });
    } catch (error) {
        console.error('更新订单状态失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 删除订单
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查订单是否存在
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在',
            });
        }

        // 删除订单及其关联的订单项
        await Order.destroy({
            where: { id },
            include: [OrderItem],
        });

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除订单失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

module.exports = {
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    deleteOrder,
};
