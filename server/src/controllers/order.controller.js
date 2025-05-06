const { Op } = require('sequelize');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const User = require('../models/user');
const Cart = require('../models/cart');
const sequelize = require('../config/database');

const orderController = {
    // 获取订单列表
    async getOrders(req, res) {
        try {
            const { page = 1, pageSize = 10, status } = req.query;
            const offset = (page - 1) * pageSize;

            const where = {};
            if (status) {
                where.status = status;
            }

            const { count, rows } = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: OrderItem,
                        as: 'products',
                        include: [
                            {
                                model: Product,
                                attributes: ['name', 'image'],
                            },
                        ],
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['username', 'phone'],
                    },
                ],
                order: [['createTime', 'DESC']],
                limit: parseInt(pageSize),
                offset: offset,
            });

            const formattedOrders = rows.map((order) => ({
                id: order.id,
                orderNo: order.orderNo,
                createTime: order.createTime,
                updateTime: order.updateTime,
                status: order.status,
                totalAmount: order.totalAmount,
                user: order.user
                    ? {
                          username: order.user.username,
                          phone: order.user.phone,
                      }
                    : null,
                products: order.products.map((item) => ({
                    id: item.id,
                    name: item.Product.name,
                    price: item.price,
                    image: item.Product.image,
                    quantity: item.quantity,
                })),
            }));

            res.json({
                code: 200,
                data: {
                    total: count,
                    items: formattedOrders,
                },
            });
        } catch (error) {
            console.error('获取订单列表失败:', error);
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 获取订单详情
    async getOrderDetail(req, res) {
        try {
            const { id } = req.params;

            // 查找订单，包括关联的订单项和产品信息
            const order = await Order.findOne({
                where: {
                    id,
                    // 移除userId过滤，允许查看任何订单
                },
                include: [
                    {
                        model: OrderItem,
                        as: 'products',
                        include: [
                            {
                                model: Product,
                                attributes: ['id', 'name', 'price', 'image', 'description'],
                            },
                        ],
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'phone'],
                    },
                ],
            });

            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在',
                });
            }

            // 格式化订单数据
            const formattedOrder = {
                id: order.id,
                orderNo: order.orderNo,
                createTime: order.createTime,
                updateTime: order.updateTime,
                status: order.status,
                totalAmount: order.totalAmount,
                address: order.address,
                user: order.user,
                products: order.products.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    product: item.Product,
                    subtotal: parseFloat(item.price) * item.quantity,
                })),
            };

            return res.status(200).json({
                code: 200,
                message: '获取订单详情成功',
                data: formattedOrder,
            });
        } catch (error) {
            console.error('获取订单详情失败:', error);
            return res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 创建订单
    async createOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const userId = req.user.id;
            const { products, address } = req.body;

            // 生成订单号
            const orderNo = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // 计算总金额并获取商品信息
            let totalAmount = 0;
            const productDetails = await Product.findAll({
                where: {
                    id: {
                        [Op.in]: products.map((p) => p.productId),
                    },
                },
            });

            // 检查库存并准备更新数据
            const orderItems = [];
            for (const item of products) {
                const product = productDetails.find((p) => p.id === item.productId);
                if (!product) {
                    throw new Error('商品不存在');
                }
                if (product.stock < item.quantity) {
                    throw new Error(`商品 ${product.name} 库存不足`);
                }
                totalAmount += product.price * item.quantity;
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });

                // 更新商品库存
                await Product.update(
                    {
                        stock: sequelize.literal(`stock - ${item.quantity}`),
                    },
                    {
                        where: { id: item.productId },
                        transaction: t,
                    }
                );
            }

            // 创建订单
            const order = await Order.create(
                {
                    orderNo,
                    userId,
                    totalAmount,
                    address,
                    status: 'pending',
                },
                { transaction: t }
            );

            // 创建订单商品记录
            await OrderItem.bulkCreate(
                orderItems.map((item) => ({
                    ...item,
                    orderId: order.id,
                })),
                { transaction: t }
            );

            // 从购物车中删除已下单的商品
            await Cart.destroy({
                where: {
                    userId,
                    productId: {
                        [Op.in]: products.map((p) => p.productId),
                    },
                },
                transaction: t,
            });

            await t.commit();

            res.json({
                code: 200,
                message: '订单创建成功',
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                code: 500,
                message: error.message || '服务器错误',
            });
        }
    },

    // 取消订单
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await Order.findOne({
                where: { id, userId },
            });

            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在',
                });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({
                    code: 400,
                    message: '订单状态不允许取消',
                });
            }

            await order.update({ status: 'cancelled' });

            res.json({
                code: 200,
                message: '订单已取消',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 确认收货
    async confirmOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await Order.findOne({
                where: { id, userId },
            });

            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在',
                });
            }

            if (order.status !== 'shipping') {
                return res.status(400).json({
                    code: 400,
                    message: '订单状态不正确',
                });
            }

            await order.update({ status: 'completed' });

            res.json({
                code: 200,
                message: '确认收货成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 删除订单
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await Order.findOne({
                where: { id, userId },
            });

            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在',
                });
            }

            if (!['completed', 'cancelled'].includes(order.status)) {
                return res.status(400).json({
                    code: 400,
                    message: '只能删除已完成或已取消的订单',
                });
            }

            await order.destroy();

            res.json({
                code: 200,
                message: '删除成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 支付订单
    async payOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await Order.findOne({
                where: { id, userId },
            });

            if (!order) {
                return res.status(404).json({
                    code: 404,
                    message: '订单不存在',
                });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({
                    code: 400,
                    message: '订单状态不正确',
                });
            }

            await order.update({ status: 'paid' });

            res.json({
                code: 200,
                message: '支付成功',
            });
        } catch (error) {
            console.error('支付订单失败:', error);
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },
};

module.exports = orderController;
