const Cart = require('../models/cart');
const Product = require('../models/product');
const { Op } = require('sequelize');

const cartController = {
    // 获取购物车列表
    async getCart(req, res) {
        try {
            const userId = req.user.id; // 假设通过认证中间件设置了req.user
            const cartItems = await Cart.findAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'image'],
                    },
                ],
            });

            const formattedItems = cartItems.map((item) => ({
                id: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity,
                selected: item.selected,
            }));

            res.json({
                code: 200,
                data: formattedItems,
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 添加到购物车
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            // 检查商品是否存在并且有足够库存
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({
                    code: 404,
                    message: '商品不存在',
                });
            }

            if (product.stock <= 0) {
                return res.status(400).json({
                    code: 400,
                    message: '商品已售罄',
                });
            }

            // 检查是否已经在购物车中
            let cartItem = await Cart.findOne({
                where: { userId, productId },
            });

            const totalQuantity = cartItem ? cartItem.quantity + quantity : quantity;
            if (totalQuantity > product.stock) {
                return res.status(400).json({
                    code: 400,
                    message: '商品库存不足',
                });
            }

            if (cartItem) {
                // 如果已存在，更新数量
                await cartItem.update({
                    quantity: totalQuantity,
                });
            } else {
                // 如果不存在，创建新记录
                cartItem = await Cart.create({
                    userId,
                    productId,
                    quantity,
                });
            }

            res.json({
                code: 200,
                message: '添加成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 更新购物车商品数量
    async updateQuantity(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            const userId = req.user.id;

            const cartItem = await Cart.findOne({
                where: { id, userId },
                include: [
                    {
                        model: Product,
                        as: 'product',
                    },
                ],
            });

            if (!cartItem) {
                return res.status(404).json({
                    code: 404,
                    message: '购物车商品不存在',
                });
            }

            if (quantity > cartItem.product.stock) {
                return res.status(400).json({
                    code: 400,
                    message: '商品库存不足',
                });
            }

            await cartItem.update({ quantity });

            res.json({
                code: 200,
                message: '更新成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 删除购物车商品
    async removeFromCart(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await Cart.destroy({
                where: { id, userId },
            });

            if (!result) {
                return res.status(404).json({
                    code: 404,
                    message: '购物车商品不存在',
                });
            }

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

    // 更新购物车商品选中状态
    async updateSelected(req, res) {
        try {
            const { ids, selected } = req.body;
            const userId = req.user.id;

            await Cart.update(
                { selected },
                {
                    where: {
                        id: { [Op.in]: ids },
                        userId,
                    },
                }
            );

            res.json({
                code: 200,
                message: '更新成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 全选/取消全选购物车商品
    async updateAllSelected(req, res) {
        try {
            const { selected } = req.body;
            const userId = req.user.id;

            await Cart.update(
                { selected },
                {
                    where: { userId },
                }
            );

            res.json({
                code: 200,
                message: '更新成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },
};

module.exports = cartController;
