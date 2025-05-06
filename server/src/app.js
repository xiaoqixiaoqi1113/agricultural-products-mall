const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const commentRoutes = require('./routes/comment.routes');
const adminAuthRoutes = require('./routes/admin-auth.routes');
const adminUserRoutes = require('./routes/admin-user.routes');
const adminProductRoutes = require('./routes/admin-product.routes');
const adminCategoryRoutes = require('./routes/admin-category.routes');
const adminOrderRoutes = require('./routes/admin-order.routes');
const analysisRoutes = require('./routes/analysis.routes');

const app = express();

// CORS配置
app.use(
    cors({
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:5173', 'http://localhost:5174'],
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api', commentRoutes);

// 管理后台路由
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

// 注册路由
app.use('/api/admin/analysis', analysisRoutes);

// 数据库连接
sequelize.sync().then(() => {
    console.log('数据库已连接');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        console.log('Database connection has been established successfully.');
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
