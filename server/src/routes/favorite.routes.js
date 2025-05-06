const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 所有收藏相关的路由都需要登录
router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:id', favoriteController.removeFavorite);
router.delete('/product/:productId', favoriteController.removeFavoriteByProductId);

module.exports = router;
