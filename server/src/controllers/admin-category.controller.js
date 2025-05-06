const Category = require('../models/category');
const Product = require('../models/product');
const { Op } = require('sequelize');

// 获取分类列表
const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'value', 'label', 'image'],
            order: [['createdAt', 'DESC']],
        });

        // 获取每个分类下的商品数量
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.count({
                    where: { categoryId: category.id },
                });
                return {
                    ...category.toJSON(),
                    count,
                };
            })
        );

        res.json({
            code: 200,
            data: categoriesWithCount,
        });
    } catch (error) {
        console.error('获取分类列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 创建分类
const createCategory = async (req, res) => {
    try {
        const { value, label, image } = req.body;

        // 验证必填字段
        if (!value || !label || !image) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要字段',
            });
        }

        // 检查value是否已存在
        const existingCategory = await Category.findOne({
            where: { value },
        });

        if (existingCategory) {
            return res.status(400).json({
                code: 400,
                message: '分类标识已存在',
            });
        }

        // 创建分类
        const category = await Category.create({
            value,
            label,
            image,
        });

        res.status(201).json({
            code: 200,
            message: '创建成功',
            data: {
                ...category.toJSON(),
                count: 0,
            },
        });
    } catch (error) {
        console.error('创建分类失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 更新分类
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, image } = req.body;

        // 验证必填字段
        if (!label || !image) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要字段',
            });
        }

        // 检查分类是否存在
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在',
            });
        }

        // 更新分类
        await category.update({
            label,
            image,
        });

        // 获取分类下的商品数量
        const count = await Product.count({
            where: { categoryId: id },
        });

        res.json({
            code: 200,
            message: '更新成功',
            data: {
                ...category.toJSON(),
                count,
            },
        });
    } catch (error) {
        console.error('更新分类失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 删除分类
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查分类是否存在
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在',
            });
        }

        // 检查分类下是否有商品
        const count = await Product.count({
            where: { categoryId: id },
        });

        if (count > 0) {
            return res.status(400).json({
                code: 400,
                message: '该分类下还有商品，无法删除',
            });
        }

        // 删除分类
        await category.destroy();

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
