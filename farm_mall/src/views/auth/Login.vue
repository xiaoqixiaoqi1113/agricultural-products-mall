<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <h2>登录</h2>
            </template>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
                </el-form-item>
                <el-form-item>
                    <div class="login-actions">
                        <el-button type="primary" :loading="loading" @click="handleLogin">
                            {{ loading ? '登录中...' : '登录' }}
                        </el-button>
                        <div class="text-right">
                            <router-link to="/auth/register">还没有账号？立即注册</router-link>
                        </div>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { login } from '@/api/auth';
    import { useUserStore } from '@/stores/user';

    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const loginFormRef = ref(null);
    const loading = ref(false);

    const loginForm = reactive({
        username: '',
        password: '',
    });

    const rules = {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
        ],
    };

    const handleLogin = async () => {
        if (!loginFormRef.value) return;

        try {
            await loginFormRef.value.validate();
            loading.value = true;

            const data = await login(loginForm);
            // 保存到 pinia store
            userStore.setToken(data.token);
            userStore.setUser(data.user);

            // 保存到本地存储
            const tokenData = {
                token: data.token,
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
                user: data.user,
            };
            localStorage.setItem('tokenData', JSON.stringify(tokenData));

            ElMessage.success('登录成功');

            // 获取重定向地址
            const redirect = route.query.redirect || '/';
            router.push(redirect);
        } catch (error) {
            console.error('登录失败:', error);
            ElMessage.error(error.message || '登录失败');
        } finally {
            loading.value = false;
        }
    };
</script>

<style scoped lang="scss">
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f7fa;
    }

    .login-card {
        width: 400px;

        :deep(.el-card__header) {
            text-align: center;
            h2 {
                margin: 0;
                font-size: 24px;
                color: #303133;
            }
        }
    }

    .login-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .el-button {
            width: 100%;
        }
    }

    .text-right {
        text-align: right;

        a {
            color: var(--el-color-primary);
            text-decoration: none;
            font-size: 14px;

            &:hover {
                color: var(--el-color-primary-light-3);
            }
        }
    }
</style>
