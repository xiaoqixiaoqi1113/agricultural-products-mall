const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 获取评论列表不需要登录
router.get('/products/:id/comments', commentController.getComments);

// 提交评论需要登录
router.post('/products/:id/comments', authMiddleware, commentController.addComment);

module.exports = router;
