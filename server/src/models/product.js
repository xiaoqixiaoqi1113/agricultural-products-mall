const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category');
const Admin = require('./admin');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    specifications: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
});

// 建立关联关系
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});
Category.hasMany(Product, {
    foreignKey: 'categoryId',
});

// 添加与管理员的关联关系，记录商品创建者
Product.belongsTo(Admin, {
    foreignKey: 'createdBy',
    as: 'creator',
});
Admin.hasMany(Product, {
    foreignKey: 'createdBy',
});

module.exports = Product;
