const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Product = require('./product');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
});

// 建立关联关系
Favorite.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});
Favorite.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
});

User.hasMany(Favorite, {
    foreignKey: 'userId',
});
Product.hasMany(Favorite, {
    foreignKey: 'productId',
});

module.exports = Favorite;
