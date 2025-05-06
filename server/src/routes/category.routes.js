const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getCategories);
router.get('/recommend', categoryController.getRecommendCategories);

module.exports = router;
