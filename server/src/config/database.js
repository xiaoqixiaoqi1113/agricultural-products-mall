const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('farm_mall', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

module.exports = sequelize;
