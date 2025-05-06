const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

module.exports = Category;
