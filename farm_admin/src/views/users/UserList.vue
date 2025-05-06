<template>
    <div class="user-list">
        <div class="action-bar">
            <div class="search-area">
                <a-input-search v-model:value="searchParams.search" placeholder="搜索用户名/邮箱/手机号" style="width: 250px" @search="handleSearch" />
                <a-select v-model:value="searchParams.role" style="width: 120px" placeholder="角色" allowClear @change="handleSearch">
                    <a-select-option value="admin">管理员</a-select-option>
                    <a-select-option value="merchant">商家</a-select-option>
                </a-select>
                <a-select v-model:value="searchParams.status" style="width: 120px" placeholder="状态" allowClear @change="handleSearch">
                    <a-select-option value="active">正常</a-select-option>
                    <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" @click="showCreateModal">新增用户</a-button>
        </div>

        <a-table :columns="columns" :data-source="userList" :loading="loading" :pagination="pagination" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                        {{ record.status === 'active' ? '正常' : '禁用' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a @click="showEditModal(record)">编辑</a>
                        <a @click="showResetPasswordModal(record)">重置密码</a>
                        <a-popconfirm title="确定要删除此用户吗？" @confirm="handleDelete(record)">
                            <a class="danger">删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>

        <!-- 创建/编辑用户弹窗 -->
        <a-modal v-model:visible="modalVisible" :title="modalType === 'create' ? '新增用户' : '编辑用户'" @ok="handleModalOk" :confirmLoading="modalLoading">
            <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="用户名" name="username" v-if="modalType === 'create'">
                    <a-input v-model:value="formState.username" />
                </a-form-item>
                <a-form-item label="密码" name="password" v-if="modalType === 'create'">
                    <a-input-password v-model:value="formState.password" />
                </a-form-item>
                <a-form-item label="角色" name="role">
                    <a-select v-model:value="formState.role">
                        <a-select-option value="admin">管理员</a-select-option>
                        <a-select-option value="merchant">商家</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="邮箱" name="email">
                    <a-input v-model:value="formState.email" />
                </a-form-item>
                <a-form-item label="手机号" name="phone">
                    <a-input v-model:value="formState.phone" />
                </a-form-item>
                <a-form-item label="状态" name="status" v-if="modalType === 'edit'">
                    <a-select v-model:value="formState.status">
                        <a-select-option value="active">正常</a-select-option>
                        <a-select-option value="disabled">禁用</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 重置密码弹窗 -->
        <a-modal v-model:visible="resetPasswordVisible" title="重置密码" @ok="handleResetPassword" :confirmLoading="resetPasswordLoading">
            <a-form :model="resetPasswordForm" :rules="{ newPassword: [{ required: true, message: '请输入新密码' }] }">
                <a-form-item label="新密码" name="newPassword">
                    <a-input-password v-model:value="resetPasswordForm.newPassword" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { message } from 'ant-design-vue';
    import axios from 'axios';

    // 表格列定义
    const columns = [
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '角色', dataIndex: 'role', key: 'role' },
        { title: '邮箱', dataIndex: 'email', key: 'email' },
        { title: '手机号', dataIndex: 'phone', key: 'phone' },
        { title: '状态', dataIndex: 'status', key: 'status' },
        { title: '最后登录时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime' },
        { title: '操作', key: 'action' },
    ];

    // 列表数据和加载状态
    const userList = ref([]);
    const loading = ref(false);
    const pagination = reactive({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 搜索参数
    const searchParams = reactive({
        search: '',
        role: undefined,
        status: undefined,
    });

    // 表单相关
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const modalType = ref('create');
    const formRef = ref();
    const formState = reactive({
        username: '',
        password: '',
        role: undefined,
        email: '',
        phone: '',
        status: 'active',
    });

    const rules = {
        username: [{ required: true, message: '请输入用户名' }],
        password: [{ required: true, message: '请输入密码' }],
        role: [{ required: true, message: '请选择角色' }],
        email: [{ type: 'email', message: '请输入有效的邮箱地址' }],
    };

    // 重置密码相关
    const resetPasswordVisible = ref(false);
    const resetPasswordLoading = ref(false);
    const resetPasswordForm = reactive({
        newPassword: '',
        userId: null,
    });

    // 获取用户列表
    const fetchUserList = async () => {
        try {
            loading.value = true;
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    ...searchParams,
                },
            });

            if (response.data.code === 200) {
                userList.value = response.data.data.items;
                pagination.total = response.data.data.total;
            }
        } catch (error) {
            message.error('获取用户列表失败');
        } finally {
            loading.value = false;
        }
    };

    // 搜索
    const handleSearch = () => {
        pagination.current = 1;
        fetchUserList();
    };

    // 表格变化
    const handleTableChange = (pag) => {
        pagination.current = pag.current;
        pagination.pageSize = pag.pageSize;
        fetchUserList();
    };

    // 显示创建用户弹窗
    const showCreateModal = () => {
        modalType.value = 'create';
        Object.assign(formState, {
            username: '',
            password: '',
            role: undefined,
            email: '',
            phone: '',
        });
        modalVisible.value = true;
    };

    // 显示编辑用户弹窗
    const showEditModal = (record) => {
        modalType.value = 'edit';
        Object.assign(formState, {
            ...record,
        });
        modalVisible.value = true;
    };

    // 显示重置密码弹窗
    const showResetPasswordModal = (record) => {
        resetPasswordForm.userId = record.id;
        resetPasswordForm.newPassword = '';
        resetPasswordVisible.value = true;
    };

    // 处理弹窗确认
    const handleModalOk = async () => {
        try {
            await formRef.value.validate();
            modalLoading.value = true;
            const token = localStorage.getItem('token');

            if (modalType.value === 'create') {
                await axios.post('http://localhost:3000/api/admin/users', formState, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('创建成功');
            } else {
                const { id, ...updateData } = formState;
                await axios.put(`http://localhost:3000/api/admin/users/${id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('更新成功');
            }

            modalVisible.value = false;
            fetchUserList();
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message);
            }
        } finally {
            modalLoading.value = false;
        }
    };

    // 处理重置密码
    const handleResetPassword = async () => {
        try {
            resetPasswordLoading.value = true;
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:3000/api/admin/users/${resetPasswordForm.userId}/reset-password`,
                { newPassword: resetPasswordForm.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success('密码重置成功');
            resetPasswordVisible.value = false;
        } catch (error) {
            message.error('密码重置失败');
        } finally {
            resetPasswordLoading.value = false;
        }
    };

    // 处理删除用户
    const handleDelete = async (record) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/admin/users/${record.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('删除成功');
            fetchUserList();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 初始化
    onMounted(() => {
        fetchUserList();
    });
</script>

<style scoped>
    .user-list {
        padding: 24px;
    }
    .action-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
    }
    .search-area {
        display: flex;
        gap: 16px;
    }
    .danger {
        color: #ff4d4f;
    }
</style>
