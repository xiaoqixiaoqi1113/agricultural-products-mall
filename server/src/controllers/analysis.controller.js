const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const OrderItem = require('../models/orderItem');

const analysisController = {
    // 获取统计数据
    async getStatistics(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 获取总销售额和今日销售额
            const totalSales = await Order.sum('totalAmount', {
                where: { status: { [Op.in]: ['paid', 'shipped', 'completed'] } },
            });

            const todaySales = await Order.sum('totalAmount', {
                where: {
                    status: { [Op.in]: ['paid', 'shipped', 'completed'] },
                    createdAt: { [Op.gte]: today },
                },
            });

            // 获取总订单量和今日订单量
            const totalOrders = await Order.count({
                where: { status: { [Op.in]: ['paid', 'shipped', 'completed'] } },
            });

            const todayOrders = await Order.count({
                where: {
                    status: { [Op.in]: ['paid', 'shipped', 'completed'] },
                    createdAt: { [Op.gte]: today },
                },
            });

            // 获取总用户数和今日新增用户
            const totalUsers = await User.count();
            const todayUsers = await User.count({
                where: {
                    createdAt: { [Op.gte]: today },
                },
            });

            res.json({
                code: 200,
                data: {
                    totalSales: totalSales || 0,
                    todaySales: todaySales || 0,
                    totalOrders: totalOrders || 0,
                    todayOrders: todayOrders || 0,
                    totalUsers: totalUsers || 0,
                    todayUsers: todayUsers || 0,
                },
            });
        } catch (error) {
            console.error('获取统计数据失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取统计数据失败',
            });
        }
    },

    // 获取今日销售趋势
    async getSalesTrend(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const orders = await Order.findAll({
                where: {
                    createdAt: { [Op.gte]: today },
                    status: { [Op.in]: ['paid', 'shipped', 'completed'] },
                },
                attributes: ['totalAmount', 'createdAt'],
            });

            // 初始化24小时的数据
            const hourlyData = Array(9)
                .fill(0)
                .map((_, index) => ({
                    time: String(index * 3).padStart(2, '0') + ':00',
                    sales: 0,
                    orders: 0,
                }));

            // 统计每个时间段的销售额和订单量
            orders.forEach((order) => {
                const hour = order.createdAt.getHours();
                const index = Math.floor(hour / 3);
                if (index < hourlyData.length) {
                    hourlyData[index].sales += Number(order.totalAmount);
                    hourlyData[index].orders += 1;
                }
            });

            res.json({
                code: 200,
                data: hourlyData,
            });
        } catch (error) {
            console.error('获取销售趋势失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取销售趋势失败',
            });
        }
    },

    // 获取热销商品
    async getHotProducts(req, res) {
        try {
            const hotProducts = await OrderItem.findAll({
                attributes: [
                    'productId',
                    [Sequelize.fn('SUM', Sequelize.col('OrderItem.quantity')), 'totalSales'],
                    [Sequelize.fn('SUM', Sequelize.literal('OrderItem.quantity * OrderItem.price')), 'totalAmount'],
                ],
                include: [
                    {
                        model: Product,
                        attributes: ['name'],
                        required: true,
                    },
                    {
                        model: Order,
                        attributes: [],
                        where: {
                            status: { [Op.in]: ['paid', 'shipped', 'completed'] },
                        },
                        required: true,
                    },
                ],
                group: ['OrderItem.productId', 'Product.id'],
                order: [[Sequelize.literal('totalSales'), 'DESC']],
                limit: 10,
            });

            const formattedProducts = hotProducts.map((item, index) => ({
                key: String(index + 1),
                index: index + 1,
                name: item.Product.name,
                sales: parseInt(item.getDataValue('totalSales')) || 0,
                amount: `￥${Number(item.getDataValue('totalAmount') || 0).toFixed(2)}`,
            }));

            res.json({
                code: 200,
                data: formattedProducts,
            });
        } catch (error) {
            console.error('获取热销商品失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取热销商品失败',
            });
        }
    },
};

module.exports = analysisController;
