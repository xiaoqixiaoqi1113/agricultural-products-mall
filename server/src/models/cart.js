const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Product = require('./product');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    selected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

// 建立关联关系
Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});
Cart.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
});

User.hasMany(Cart, {
    foreignKey: 'userId',
});
Product.hasMany(Cart, {
    foreignKey: 'productId',
});

module.exports = Cart;
