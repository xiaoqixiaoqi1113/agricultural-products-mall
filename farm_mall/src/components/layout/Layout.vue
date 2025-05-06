<template>
    <el-container class="layout-container">
        <el-header>
            <el-menu mode="horizontal" router :default-active="route.path" class="nav-menu">
                <!-- 左侧导航项 -->
                <div class="nav-left">
                    <el-menu-item index="/product/list">农产品列表</el-menu-item>
                    <el-menu-item index="/product/category">分类</el-menu-item>
                </div>

                <!-- 右侧导航项 -->
                <div class="nav-right">
                    <template v-if="isLoggedIn">
                        <el-menu-item index="/orders">我的订单</el-menu-item>
                        <el-menu-item index="/favorites">我的收藏</el-menu-item>
                        <el-menu-item index="/cart">
                            <el-badge :value="cartCount" :hidden="cartCount === 0"> 购物车 </el-badge>
                        </el-menu-item>
                        <el-dropdown trigger="hover" @command="handleCommand">
                            <el-menu-item>
                                <span class="user-dropdown">
                                    {{ user?.username }}
                                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                            </el-menu-item>

                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template v-else>
                        <el-menu-item index="/auth/login">登录</el-menu-item>
                        <el-menu-item index="/auth/register">注册</el-menu-item>
                    </template>
                </div>
            </el-menu>
        </el-header>
        <el-main>
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </el-main>
    </el-container>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { ArrowDown } from '@element-plus/icons-vue';
    import { useUserStore } from '@/stores/user';
    import { storeToRefs } from 'pinia';

    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const { isLoggedIn, user } = storeToRefs(userStore);
    const cartCount = ref(0);

    // 检查登录状态
    const checkLoginStatus = () => {
        return userStore.restoreUser();
    };

    // 处理退出登录
    const handleLogout = () => {
        userStore.clearUser();
        cartCount.value = 0;
        ElMessage.success('已退出登录');
        if (route.meta.requiresAuth) {
            router.push('/auth/login');
        }
    };

    // 处理下拉菜单命令
    const handleCommand = (command) => {
        if (command === 'logout') {
            handleLogout();
        }
    };

    // 监听路由变化
    watch(
        () => route.path,
        () => {
            // 检查是否需要登录
            if (route.meta.requiresAuth && !checkLoginStatus()) {
                ElMessage.warning('请先登录');
                router.push({
                    path: '/auth/login',
                    query: { redirect: route.fullPath },
                });
            }
        },
        { immediate: true }
    );

    // 组件挂载时检查登录状态
    onMounted(() => {
        checkLoginStatus();
    });
</script>

<style scoped lang="scss">
    .layout-container {
        min-height: 100vh;
    }

    .el-header {
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
        background-color: #fff;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .nav-menu {
        display: flex;
        justify-content: space-between;
        height: 100%;
        border-bottom: none;

        .nav-left,
        .nav-right {
            display: flex;
            align-items: center;
        }

        :deep(.el-menu-item) {
            padding: 0 20px;

            &.is-active {
                font-weight: bold;
            }
        }
    }

    .user-dropdown {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        .el-icon {
            font-size: 12px;
        }
    }

    // 路由切换动画
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
