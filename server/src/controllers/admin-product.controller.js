const { Op } = require('sequelize');
const Product = require('../models/product');
const Category = require('../models/category');
const Admin = require('../models/admin');

// 获取商品列表
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search, category, status } = req.query;
        const offset = (page - 1) * pageSize;
        const admin = req.admin; // 获取当前登录的管理员用户

        const where = {};
        if (search) {
            where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }];
        }
        if (category) {
            where.categoryId = category;
        }

        // 如果不是管理员角色，只能查看自己创建的商品
        if (admin.role !== 'admin') {
            where.createdBy = admin.id;
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'value', 'label'],
                },
                {
                    model: Admin,
                    as: 'creator',
                    attributes: ['id', 'username', 'role'],
                },
            ],
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
        console.error('获取商品列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 创建商品
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, image, images, categoryId, tags, specifications, stock } = req.body;
        const admin = req.admin; // 获取当前登录的管理员用户

        // 检查分类是否存在
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({
                code: 400,
                message: '分类不存在',
            });
        }

        // 创建商品
        const product = await Product.create({
            name,
            price,
            description,
            image,
            images: images || [],
            categoryId,
            tags: tags || [],
            specifications: specifications || [],
            stock: stock || 0,
            createdBy: admin.id, // 记录创建者ID
        });

        // 更新分类商品数量
        await category.increment('count');

        res.status(201).json({
            code: 200,
            message: '创建成功',
            data: product,
        });
    } catch (error) {
        console.error('创建商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 更新商品
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image, images, categoryId, tags, specifications, stock } = req.body;
        const admin = req.admin; // 获取当前登录的管理员用户

        // 构建查询条件
        const where = { id };

        // 如果不是管理员，只能更新自己创建的商品
        if (admin.role !== 'admin') {
            where.createdBy = admin.id;
        }

        // 查找符合条件的商品
        const product = await Product.findOne({ where });

        if (!product) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或您无权修改',
            });
        }

        // 如果更改了分类
        if (categoryId && categoryId !== product.categoryId) {
            // 检查新分类是否存在
            const newCategory = await Category.findByPk(categoryId);
            if (!newCategory) {
                return res.status(400).json({
                    code: 400,
                    message: '分类不存在',
                });
            }

            // 更新原分类和新分类的商品数量
            const oldCategory = await Category.findByPk(product.categoryId);
            await oldCategory.decrement('count');
            await newCategory.increment('count');
        }

        // 更新商品信息
        await product.update({
            name,
            price,
            description,
            image,
            images: images || product.images,
            categoryId: categoryId || product.categoryId,
            tags: tags || product.tags,
            specifications: specifications || product.specifications,
            stock: stock !== undefined ? stock : product.stock,
        });

        res.json({
            code: 200,
            message: '更新成功',
            data: product,
        });
    } catch (error) {
        console.error('更新商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 删除商品
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = req.admin; // 获取当前登录的管理员用户

        // 构建查询条件
        const where = { id };

        // 如果不是管理员，只能删除自己创建的商品
        if (admin.role !== 'admin') {
            where.createdBy = admin.id;
        }

        // 查找符合条件的商品
        const product = await Product.findOne({ where });

        if (!product) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或您无权删除',
            });
        }

        // 更新分类商品数量
        const category = await Category.findByPk(product.categoryId);
        await category.decrement('count');

        // 删除商品
        await product.destroy();

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 获取商品详情
exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = req.admin; // 获取当前登录的管理员用户

        const where = { id };

        // 如果不是管理员角色，只能查看自己创建的商品
        if (admin.role !== 'admin') {
            where.createdBy = admin.id;
        }

        const product = await Product.findOne({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'value', 'label'],
                },
                {
                    model: Admin,
                    as: 'creator',
                    attributes: ['id', 'username', 'role'],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或您无权查看',
            });
        }

        res.json({
            code: 200,
            data: product,
        });
    } catch (error) {
        console.error('获取商品详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};

// 批量删除商品
exports.batchDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        const admin = req.admin; // 获取当前登录的管理员用户

        // 构建查询条件
        const where = {
            id: {
                [Op.in]: ids,
            },
        };

        // 如果不是管理员，只能删除自己创建的商品
        if (admin.role !== 'admin') {
            where.createdBy = admin.id;
        }

        // 获取要删除的商品
        const products = await Product.findAll({ where });

        // 检查是否找到所有要删除的商品
        if (products.length !== ids.length) {
            const foundIds = products.map((p) => p.id);
            const notFoundIds = ids.filter((id) => !foundIds.includes(id));

            // 如果是普通用户，可能是因为尝试删除不属于自己的商品
            if (admin.role !== 'admin') {
                return res.status(403).json({
                    code: 403,
                    message: '您无权删除某些商品',
                    data: { unauthorizedIds: notFoundIds },
                });
            }

            // 如果是管理员，可能是商品不存在
            return res.status(404).json({
                code: 404,
                message: '某些商品不存在',
                data: { notFoundIds },
            });
        }

        // 更新各个分类的商品数量
        const categoryIds = [...new Set(products.map((p) => p.categoryId))];
        for (const categoryId of categoryIds) {
            const count = products.filter((p) => p.categoryId === categoryId).length;
            const category = await Category.findByPk(categoryId);
            await category.decrement('count', { by: count });
        }

        // 批量删除商品
        await Product.destroy({ where });

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('批量删除商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
        });
    }
};
