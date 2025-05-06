<template>
    <div class="register-container">
        <el-card class="register-card">
            <template #header>
                <h2>注册</h2>
            </template>
            <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" block @click="handleRegister">
                        {{ loading ? '注册中...' : '注册' }}
                    </el-button>
                    <div class="text-right">
                        <router-link to="/auth/login">已有账号？立即登录</router-link>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import { useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { register } from '@/api/auth';

    const router = useRouter();
    const registerFormRef = ref(null);
    const loading = ref(false);

    const registerForm = reactive({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
    });

    const validatePass = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请输入密码'));
        } else {
            if (registerForm.confirmPassword !== '') {
                registerFormRef.value.validateField('confirmPassword');
            }
            callback();
        }
    };

    const validatePass2 = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== registerForm.password) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    };

    const rules = {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
        ],
        password: [
            { required: true, validator: validatePass, trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
        ],
        confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    };

    const handleRegister = async () => {
        if (!registerFormRef.value) return;

        try {
            await registerFormRef.value.validate();
            loading.value = true;

            const { username, password, email } = registerForm;
            await register({ username, password, email });

            ElMessage.success('注册成功');
            router.push('/auth/login');
        } catch (error) {
            if (error.message) {
                ElMessage.error(error.message);
            } else {
                console.error('注册失败:', error);
            }
        } finally {
            loading.value = false;
        }
    };
</script>

<style scoped lang="scss">
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f7fa;
    }

    .register-card {
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

    .text-right {
        text-align: right;
        margin-top: 12px;

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
