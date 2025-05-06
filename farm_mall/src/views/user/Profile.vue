<template>
    <div class="user-profile">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card>
                    <el-menu class="profile-menu" router :default-active="route.path">
                        <el-menu-item index="/user/orders">我的订单</el-menu-item>
                        <el-menu-item index="/user/favorites">我的收藏</el-menu-item>
                    </el-menu>
                </el-card>
            </el-col>
            <el-col :span="18">
                <router-view></router-view>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router';
    const route = useRoute();
</script>

<style scoped lang="scss">
    .user-profile {
        padding: 20px;
    }

    .profile-menu {
        border-right: none;
    }
</style>
