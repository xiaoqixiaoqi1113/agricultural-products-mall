import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/auth/LoginView.vue'),
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/auth/RegisterView.vue'),
        },
        {
            path: '/',
            component: () => import('../views/layouts/BasicLayout.vue'),
            children: [
                {
                    path: '',
                    redirect: '/products',
                },
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/users/UserList.vue'),
                },
                {
                    path: 'categories',
                    name: 'categories',
                    component: () => import('../views/categories/CategoryList.vue'),
                },
                {
                    path: 'products',
                    name: 'products',
                    component: () => import('../views/products/ProductList.vue'),
                },
                {
                    path: 'orders',
                    name: 'orders',
                    component: () => import('../views/orders/OrderList.vue'),
                },
                {
                    path: '/analysis',
                    name: 'Analysis',
                    component: () => import('@/views/analysis/Index.vue'),
                    meta: {
                        title: '数据分析',
                        icon: 'BarChartOutlined',
                        requiresAuth: true,
                    },
                },
            ],
        },
    ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.path !== '/login' && to.path !== '/register' && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;
