import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/components/layout/Layout.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Layout,
            children: [
                {
                    path: '',
                    redirect: '/product/list',
                },
                {
                    path: 'product/list',
                    component: () => import('@/views/product/List.vue'),
                },
                {
                    path: 'cart',
                    component: () => import('@/views/user/Cart.vue'),
                    meta: { requiresAuth: true },
                },
                {
                    path: 'orders',
                    component: () => import('@/views/user/Orders.vue'),
                    meta: { requiresAuth: true },
                },
                {
                    path: 'favorites',
                    component: () => import('@/views/user/Favorites.vue'),
                    meta: { requiresAuth: true },
                },
                {
                    path: 'product/detail/:id',
                    component: () => import('@/views/product/Detail.vue'),
                },
                {
                    path: 'product/category',
                    component: () => import('@/views/product/Category.vue'),
                },
            ],
        },
        {
            path: '/auth',
            children: [
                {
                    path: 'login',
                    component: () => import('@/views/auth/Login.vue'),
                },
                {
                    path: 'register',
                    component: () => import('@/views/auth/Register.vue'),
                },
            ],
        },
        {
            path: '/products',
            children: [
                {
                    path: '',
                    name: 'ProductList',
                    component: () => import('@/views/product/List.vue'),
                },
                {
                    path: ':id',
                    name: 'ProductDetail',
                    component: () => import('@/views/product/Detail.vue'),
                },
            ],
        },
    ],
});

router.beforeEach((to, from, next) => {
    const tokenData = localStorage.getItem('tokenData');
    let isLoggedIn = false;

    if (tokenData) {
        const { expires } = JSON.parse(tokenData);
        isLoggedIn = expires > Date.now();

        // 如果token已过期，清除存储
        if (!isLoggedIn) {
            localStorage.removeItem('tokenData');
            localStorage.removeItem('username');
        }
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !isLoggedIn) {
        next({
            path: '/auth/login',
            query: { redirect: to.fullPath },
        });
    } else if (isLoggedIn && (to.path === '/auth/login' || to.path === '/auth/register')) {
        next('/');
    } else {
        next();
    }
});

export default router;
