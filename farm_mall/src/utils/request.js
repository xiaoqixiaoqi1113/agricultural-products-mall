import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api',
    timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const tokenDataStr = localStorage.getItem('tokenData');
        if (tokenDataStr) {
            const tokenData = JSON.parse(tokenDataStr);

            // 检查token是否过期
            if (tokenData.expires > Date.now()) {
                config.headers.Authorization = `Bearer ${tokenData.token}`;
            } else {
                // token过期，清除存储并跳转到登录页
                localStorage.removeItem('tokenData');
                window.location.href = '/auth/login';
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const { code, message, data } = response.data;
        if (code === 200) {
            return data;
        } else {
            ElMessage.error(message || '请求失败');
            return Promise.reject(new Error(message || '请求失败'));
        }
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('tokenData');
            window.location.href = '/auth/login';
        }
        ElMessage.error(error.response?.data?.message || error.message || '请求失败');
        return Promise.reject(error);
    }
);

export default request;
