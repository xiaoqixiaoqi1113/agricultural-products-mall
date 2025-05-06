const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Product = require('./product');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// 建立关联关系
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});
Comment.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
});

User.hasMany(Comment, {
    foreignKey: 'userId',
});
Product.hasMany(Comment, {
    foreignKey: 'productId',
});

module.exports = Comment;
