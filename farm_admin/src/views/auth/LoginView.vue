<template>
    <div class="login-container">
        <a-card title="登录" :bordered="false" style="width: 400px">
            <a-form :model="formState" name="login" autocomplete="off" @finish="onFinish">
                <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
                    <a-input v-model:value="formState.username" />
                </a-form-item>

                <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                    <a-input-password v-model:value="formState.password" />
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading" block> 登录 </a-button>
                </a-form-item>

                <div class="form-footer">
                    <router-link to="/register">还没有账号？立即注册</router-link>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
    import { reactive, ref } from 'vue';
    import { message } from 'ant-design-vue';
    import axios from 'axios';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const loading = ref(false);
    const formState = reactive({
        username: '',
        password: '',
    });

    const onFinish = async (values) => {
        try {
            loading.value = true;
            const response = await axios.post('http://localhost:3000/api/admin/auth/login', values);

            if (response.data.code === 200) {
                const { token, user } = response.data.data;
                // 存储token和用户信息
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                message.success('登录成功');
                // 登录成功后跳转到首页
                router.push('/');
            }
        } catch (error) {
            message.error(error.response?.data?.message || '登录失败，请重试');
        } finally {
            loading.value = false;
        }
    };
</script>

<style scoped lang="scss">
    .login-container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f0f2f5;
    }

    .form-footer {
        text-align: right;
        margin-top: 16px;
    }
</style>
