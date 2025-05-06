const Comment = require('../models/comment');
const Product = require('../models/product');
const User = require('../models/user');

const commentController = {
    // 获取商品评论列表
    async getComments(req, res) {
        try {
            const { id } = req.params; // 商品ID
            const { page = 1, pageSize = 10 } = req.query;
            const offset = (page - 1) * pageSize;

            const { count, rows } = await Comment.findAndCountAll({
                where: { productId: id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['username'],
                    },
                ],
                order: [['createTime', 'DESC']],
                limit: parseInt(pageSize),
                offset: offset,
            });

            const formattedComments = rows.map((comment) => ({
                id: comment.id,
                username: comment.user.username,
                userAvatar: '', // 如果需要头像功能，可以在User模型中添加avatar字段
                rating: comment.rating,
                content: comment.content,
                createTime: comment.createTime,
            }));

            res.json({
                code: 200,
                data: {
                    total: count,
                    items: formattedComments,
                },
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },

    // 提交商品评论
    async addComment(req, res) {
        try {
            const { id } = req.params; // 商品ID
            const userId = req.user.id;
            const { rating, content } = req.body;

            // 检查商品是否存在
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({
                    code: 404,
                    message: '商品不存在',
                });
            }

            // 验证评分范围
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    code: 400,
                    message: '评分必须在1-5之间',
                });
            }

            // 创建评论
            await Comment.create({
                userId,
                productId: id,
                rating,
                content,
            });

            res.json({
                code: 200,
                message: '评论成功',
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '服务器错误',
            });
        }
    },
};

module.exports = commentController;
