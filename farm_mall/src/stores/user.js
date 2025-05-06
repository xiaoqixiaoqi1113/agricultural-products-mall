import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const token = ref('');
    const user = ref(null);
    const isLoggedIn = ref(false);

    // 设置用户信息
    const setUser = (userData) => {
        user.value = userData;
        isLoggedIn.value = true;
    };

    // 设置token
    const setToken = (newToken) => {
        token.value = newToken;
    };

    // 清除用户信息
    const clearUser = () => {
        token.value = '';
        user.value = null;
        isLoggedIn.value = false;
        localStorage.removeItem('tokenData');
    };

    // 从本地存储恢复用户状态
    const restoreUser = () => {
        const tokenData = localStorage.getItem('tokenData');
        if (tokenData) {
            const data = JSON.parse(tokenData);
            if (data.expires > Date.now()) {
                token.value = data.token;
                user.value = data.user;
                isLoggedIn.value = true;
                return true;
            } else {
                clearUser();
            }
        }
        return false;
    };

    return {
        token,
        user,
        isLoggedIn,
        setUser,
        setToken,
        clearUser,
        restoreUser,
    };
});
