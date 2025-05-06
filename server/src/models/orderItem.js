const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./order');
const Product = require('./product');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
});

// 建立关联关系
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
});
OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
});

Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'products',
});

module.exports = OrderItem;
