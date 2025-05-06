<template>
    <div class="category-list">
        <div class="action-bar">
            <a-button type="primary" @click="showCreateModal">新增分类</a-button>
        </div>

        <a-table :columns="columns" :data-source="categoryList" :loading="loading" :pagination="false">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                    <img :src="record.image" alt="分类图片" style="width: 50px; height: 50px; object-fit: cover" />
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a @click="showEditModal(record)">编辑</a>
                        <a-popconfirm title="确定要删除此分类吗？" @confirm="handleDelete(record)" :disabled="record.count > 0">
                            <a :class="{ danger: true, disabled: record.count > 0 }">
                                删除
                                <a-tooltip v-if="record.count > 0">
                                    <template #title>该分类下还有商品，无法删除</template>
                                    <info-circle-outlined />
                                </a-tooltip>
                            </a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>

        <!-- 创建/编辑分类弹窗 -->
        <a-modal v-model:visible="modalVisible" :title="modalType === 'create' ? '新增分类' : '编辑分类'" @ok="handleModalOk" :confirmLoading="modalLoading">
            <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="分类标识" name="value" v-if="modalType === 'create'">
                    <a-input v-model:value="formState.value" placeholder="英文标识，用于程序内部" />
                </a-form-item>
                <a-form-item label="分类名称" name="label">
                    <a-input v-model:value="formState.label" />
                </a-form-item>
                <a-form-item label="分类图片" name="image">
                    <a-input v-model:value="formState.image" placeholder="请输入图片URL" />
                    <div class="image-preview" v-if="formState.image">
                        <img :src="formState.image" alt="分类图片预览" />
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { message } from 'ant-design-vue';
    import { InfoCircleOutlined } from '@ant-design/icons-vue';
    import axios from 'axios';

    // 表格列定义
    const columns = [
        { title: '分类图片', dataIndex: 'image', key: 'image', width: 100 },
        { title: '分类标识', dataIndex: 'value', key: 'value' },
        { title: '分类名称', dataIndex: 'label', key: 'label' },
        { title: '商品数量', dataIndex: 'count', key: 'count', width: 100 },
        { title: '操作', key: 'action', width: 200 },
    ];

    // 列表数据和加载状态
    const categoryList = ref([]);
    const loading = ref(false);

    // 表单相关
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const modalType = ref('create');
    const formRef = ref();
    const formState = reactive({
        value: '',
        label: '',
        image: '',
    });

    const rules = {
        value: [
            { required: true, message: '请输入分类标识' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: '分类标识只能包含字母、数字、下划线和横线' },
        ],
        label: [{ required: true, message: '请输入分类名称' }],
        image: [{ required: true, message: '请输入分类图片' }],
    };

    // 获取分类列表
    const fetchCategoryList = async () => {
        try {
            loading.value = true;
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.code === 200) {
                categoryList.value = response.data.data;
            }
        } catch (error) {
            message.error('获取分类列表失败');
        } finally {
            loading.value = false;
        }
    };

    // 显示创建分类弹窗
    const showCreateModal = () => {
        modalType.value = 'create';
        Object.assign(formState, {
            value: '',
            label: '',
            image: '',
        });
        modalVisible.value = true;
    };

    // 显示编辑分类弹窗
    const showEditModal = (record) => {
        modalType.value = 'edit';
        Object.assign(formState, {
            ...record,
        });
        modalVisible.value = true;
    };

    // 处理弹窗确认
    const handleModalOk = async () => {
        try {
            await formRef.value.validate();
            modalLoading.value = true;
            const token = localStorage.getItem('token');

            if (modalType.value === 'create') {
                await axios.post('http://localhost:3000/api/admin/categories', formState, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('创建成功');
            } else {
                const { id, count, ...updateData } = formState;
                await axios.put(`http://localhost:3000/api/admin/categories/${id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('更新成功');
            }

            modalVisible.value = false;
            fetchCategoryList();
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message);
            }
        } finally {
            modalLoading.value = false;
        }
    };

    // 处理删除分类
    const handleDelete = async (record) => {
        if (record.count > 0) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/admin/categories/${record.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('删除成功');
            fetchCategoryList();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('删除失败');
            }
        }
    };

    // 初始化
    onMounted(() => {
        fetchCategoryList();
    });
</script>

<style scoped>
    .category-list {
        padding: 24px;
    }
    .action-bar {
        margin-bottom: 16px;
    }
    .danger {
        color: #ff4d4f;
    }
    .danger.disabled {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
    }
    .image-preview {
        margin-top: 8px;
    }
    .image-preview img {
        width: 100px;
        height: 100px;
        object-fit: cover;
    }
</style>
