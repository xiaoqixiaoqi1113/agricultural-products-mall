const { Op } = require('sequelize');
const Favorite = require('../models/favorite');
const Product = require('../models/product');

const favoriteController = {
    // 获取收藏列表
    async getFavorites(req, res) {
        try {
            const { page = 1, pageSize = 10 } = req.query;
            const userId = req.user.id;
            const offset = (page - 1) * pageSize;

            const { count, rows } = await Favorite.findAndCountAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'image'],
                    },
                ],
                limit: parseInt(pageSize),
                offset: offset,
            });

            const formattedItems = rows.map((item) => ({
                id: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
            }));

            res.json({
                code: 200,
                data: {
                    total: count,
                    items: formattedItems,
                },
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 添加收藏
    async addFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.body;

            // 检查商品是否存在
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({
                    code: 404,
                    message: '商品不存在',
                });
            }

            // 检查是否已收藏
            const existingFavorite = await Favorite.findOne({
                where: { userId, productId },
            });

            if (existingFavorite) return res.status(400).json({ code: 400, message: '商品已收藏' });

            // 创建收藏记录
            await Favorite.create({ userId, productId });

            res.json({
                code: 200,
                message: '收藏成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 取消收藏
    async removeFavorite(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await Favorite.destroy({
                where: { id, userId },
            });

            if (!result) {
                return res.status(404).json({
                    code: 404,
                    message: '收藏记录不存在',
                });
            }

            res.json({
                code: 200,
                message: '取消收藏成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 通过商品ID取消收藏
    async removeFavoriteByProductId(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            const result = await Favorite.destroy({
                where: { productId, userId },
            });

            if (!result) {
                return res.status(404).json({
                    code: 404,
                    message: '收藏记录不存在',
                });
            }

            res.json({
                code: 200,
                message: '取消收藏成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 检查商品是否已收藏（用于商品列表和详情页）
    async checkFavoriteStatus(productIds, userId) {
        try {
            // 参数验证
            if (!userId) {
                return Array.isArray(productIds) ? {} : false;
            }
            if (!productIds) {
                return Array.isArray(productIds) ? {} : false;
            }

            const favorites = await Favorite.findAll({
                where: {
                    userId,
                    productId: {
                        [Op.in]: Array.isArray(productIds) ? productIds : [productIds],
                    },
                },
            });

            if (Array.isArray(productIds)) {
                return productIds.reduce((acc, id) => {
                    acc[id] = favorites.some((f) => f.productId.toString() === id.toString());
                    return acc;
                }, {});
            }

            return favorites.some((f) => f.productId.toString() === productIds.toString());
        } catch (error) {
            console.error('检查收藏状态失败:', error);
            return Array.isArray(productIds) ? {} : false;
        }
    },
};

module.exports = favoriteController;
