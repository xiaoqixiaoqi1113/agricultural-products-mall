<template>
    <div class="register-container">
        <a-card title="注册" :bordered="false" style="width: 400px">
            <a-form :model="formState" name="register" autocomplete="off" @finish="onFinish">
                <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
                    <a-input v-model:value="formState.username" />
                </a-form-item>

                <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                    <a-input-password v-model:value="formState.password" />
                </a-form-item>

                <a-form-item label="角色" name="role" :rules="[{ required: true, message: '请选择角色!' }]">
                    <a-select v-model:value="formState.role">
                        <a-select-option value="admin">管理员</a-select-option>
                        <a-select-option value="merchant">商家</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="邮箱" name="email" :rules="[{ type: 'email', message: '请输入有效的邮箱地址!' }]">
                    <a-input v-model:value="formState.email" />
                </a-form-item>

                <a-form-item label="手机号" name="phone">
                    <a-input v-model:value="formState.phone" />
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading" block> 注册 </a-button>
                </a-form-item>

                <div class="form-footer">
                    <router-link to="/login">已有账号？立即登录</router-link>
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
        role: undefined,
        email: '',
        phone: '',
    });

    const onFinish = async (values) => {
        try {
            loading.value = true;
            const response = await axios.post('http://localhost:3000/api/admin/auth/register', values);

            if (response.data.code === 200) {
                message.success('注册成功');
                router.push('/login');
            }
        } catch (error) {
            message.error(error.response?.data?.message || '注册失败，请重试');
        } finally {
            loading.value = false;
        }
    };
</script>

<style scoped lang="scss">
    .register-container {
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
