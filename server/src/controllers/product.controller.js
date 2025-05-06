const { Op } = require('sequelize');
const Product = require('../models/product');
const Category = require('../models/category');
const favoriteController = require('./favorite.controller');

const productController = {
    // 获取商品列表
    async getProducts(req, res) {
        try {
            const { page = 1, pageSize = 10, category, search } = req.query;
            const offset = (page - 1) * pageSize;

            let where = {};
            if (search) {
                where.name = {
                    [Op.like]: `%${search}%`,
                };
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['value', 'label'],
                        where: category ? { value: category } : undefined,
                    },
                ],
                limit: parseInt(pageSize),
                offset: offset,
            });

            const favoriteStatus = req.user
                ? await favoriteController.checkFavoriteStatus(
                      rows.map((product) => product.id),
                      req.user.id
                  )
                : {};

            const items = rows.map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                tags: product.tags,
                category: product.category.value,
                isFavorite: favoriteStatus[product.id] || false,
            }));

            res.json({
                code: 200,
                data: {
                    total: count,
                    items: items,
                },
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 获取商品详情
    async getProductDetail(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['value', 'label'],
                    },
                ],
            });

            if (!product) {
                return res.status(404).json({
                    code: 404,
                    message: '商品不存在',
                });
            }

            console.log('User in request:', req.user);
            const userId = req.user ? req.user.id : null;
            console.log('Checking favorite status for:', { productId: id, userId });

            const isFavorite = userId ? await favoriteController.checkFavoriteStatus(id, userId) : false;

            res.json({
                code: 200,
                data: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    image: product.image,
                    images: product.images || [product.image],
                    stock: product.stock,
                    tags: product.tags,
                    category: product.category.value,
                    isFavorite,
                    specifications: product.specifications,
                },
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 搜索商品
    async searchProducts(req, res) {
        try {
            const { keyword } = req.query;
            const products = await Product.findAll({
                where: {
                    name: {
                        [Op.like]: `%${keyword}%`,
                    },
                },
                attributes: ['id', 'name', 'price', 'image', 'stock'],
                limit: 10,
            });

            res.json({
                code: 200,
                data: products,
            });
        } catch (error) {
            console.log(error);

            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },
};

module.exports = productController;
