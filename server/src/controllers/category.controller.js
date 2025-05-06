const Category = require('../models/category');
const Product = require('../models/product');
const { Op } = require('sequelize');

const categoryController = {
    // 获取分类列表
    async getCategories(req, res) {
        try {
            const categories = await Category.findAll({
                attributes: ['value', 'label', 'count', 'image'],
            });

            res.json({
                code: 200,
                data: categories,
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 获取推荐分类
    async getRecommendCategories(req, res) {
        try {
            // 获取销量最高的5个分类
            const categories = await Category.findAll({
                order: [['count', 'DESC']],
                limit: 5,
                attributes: ['id', 'value', 'label', 'image'],
            });

            // 为每个分类获取销量最高的3个商品
            const categoriesWithProducts = await Promise.all(
                categories.map(async (category) => {
                    const products = await Product.findAll({
                        where: {
                            categoryId: category.id,
                        },
                        order: [['createdAt', 'DESC']],
                        limit: 3,
                        attributes: ['id', 'name', 'price', 'image', 'tags', 'description'],
                    });

                    return {
                        ...category.toJSON(),
                        products: products,
                    };
                })
            );

            res.json({
                code: 200,
                data: categoriesWithProducts,
            });
        } catch (error) {
            console.error('获取推荐分类失败:', error);
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },
};

module.exports = categoryController;
