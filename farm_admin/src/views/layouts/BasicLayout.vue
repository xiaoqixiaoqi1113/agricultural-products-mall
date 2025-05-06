<template>
    <a-layout class="layout">
        <a-layout-header class="header">
            <div class="logo">农场商城后台管理系统</div>
            <div class="user-info">
                <span class="welcome">欢迎，{{ userInfo.username }}</span>
                <a-button type="link" @click="handleLogout">退出登录</a-button>
            </div>
        </a-layout-header>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff">
                <a-menu :selectedKeys="selectedKeys" @select="({ key }) => (selectedKeys = [key])" mode="inline" :style="{ height: '100%', borderRight: 0 }">
                    <!-- <a-menu-item key="analysis">
                        <template #icon>
                            <bar-chart-outlined />
                        </template>
                        <router-link to="/analysis">数据分析</router-link>
                    </a-menu-item>
                    <a-menu-item key="users" v-if="userInfo.role === 'admin'">
                        <template #icon>
                            <user-outlined />
                        </template>
                        <router-link to="/users">用户管理</router-link>
                    </a-menu-item> -->
                    <a-menu-item key="categories" v-if="userInfo.role === 'admin'">
                        <template #icon>
                            <appstore-outlined />
                        </template>
                        <router-link to="/categories">分类管理</router-link>
                    </a-menu-item>
                    <a-menu-item key="products">
                        <template #icon>
                            <shopping-outlined />
                        </template>
                        <router-link to="/products">商品管理</router-link>
                    </a-menu-item>
                    <a-menu-item key="orders">
                        <template #icon>
                            <shopping-cart-outlined />
                        </template>
                        <router-link to="/orders">订单管理</router-link>
                    </a-menu-item>
                </a-menu>
            </a-layout-sider>
            <a-layout-content class="content">
                <router-view></router-view>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { message } from 'ant-design-vue';
    import { UserOutlined, ShoppingOutlined, AppstoreOutlined, ShoppingCartOutlined, BarChartOutlined } from '@ant-design/icons-vue';
    import axios from 'axios';

    const router = useRouter();
    const selectedKeys = ref(['users']);
    const userInfo = ref({});

    onMounted(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            userInfo.value = JSON.parse(userStr);
        }
    });

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/admin/auth/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            message.success('退出成功');
            router.push('/login');
        } catch (error) {
            message.error('退出失败');
        }
    };
</script>

<style scoped>
    .layout {
        min-height: 100vh;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .logo {
        font-size: 18px;
        font-weight: bold;
        color: #1890ff;
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .welcome {
        color: rgba(0, 0, 0, 0.85);
    }
    .content {
        padding: 24px;
        margin: 24px;
        background: #fff;
        min-height: 280px;
    }
</style>
