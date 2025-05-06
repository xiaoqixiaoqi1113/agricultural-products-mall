const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipping', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    address: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    createTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// 建立关联关系
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

User.hasMany(Order, {
    foreignKey: 'userId',
});

module.exports = Order;
