<template>
    <div class="product-list">
        <div class="action-bar">
            <div class="search-area">
                <a-input-search v-model:value="searchParams.search" placeholder="搜索商品名称/描述" style="width: 250px" @search="handleSearch" />
                <a-select v-model:value="searchParams.category" style="width: 120px" placeholder="商品分类" allowClear @change="handleSearch">
                    <a-select-option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                        {{ category.label }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="action-buttons">
                <a-button type="primary" @click="showCreateModal">新增商品</a-button>
                <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">批量删除</a-button>
            </div>
        </div>

        <a-table
            :columns="columns"
            :data-source="productList"
            :loading="loading"
            :pagination="pagination"
            :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                    <img :src="record.image" :alt="record.name" style="width: 50px; height: 50px; object-fit: cover" @error="handleImageError" />
                </template>
                <template v-if="column.key === 'tags'">
                    <a-tag v-for="tag in record.tags" :key="tag">{{ tag }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a @click="showEditModal(record)">编辑</a>
                        <a-popconfirm title="确定要删除此商品吗？" @confirm="handleDelete(record)">
                            <a class="danger">删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>

        <!-- 创建/编辑商品弹窗 -->
        <a-modal v-model:visible="modalVisible" :title="modalType === 'create' ? '新增商品' : '编辑商品'" @ok="handleModalOk" :confirmLoading="modalLoading" width="800px">
            <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                <a-form-item label="商品名称" name="name">
                    <a-input v-model:value="formState.name" />
                </a-form-item>
                <a-form-item label="商品价格" name="price">
                    <a-input-number v-model:value="formState.price" :min="0" :precision="2" :step="0.01" style="width: 200px" />
                </a-form-item>
                <a-form-item label="商品库存" name="stock">
                    <a-input-number v-model:value="formState.stock" :min="0" :precision="0" style="width: 200px" />
                </a-form-item>
                <a-form-item label="商品描述" name="description">
                    <a-textarea v-model:value="formState.description" :rows="4" />
                </a-form-item>
                <a-form-item label="商品主图" name="image">
                    <a-input v-model:value="formState.image" placeholder="请输入图片URL" />
                    <div class="image-preview" v-if="formState.image">
                        <img :src="formState.image" :alt="formState.name" @error="handleImageError" />
                    </div>
                </a-form-item>
                <a-form-item label="商品分类" name="categoryId">
                    <a-select v-model:value="formState.categoryId">
                        <a-select-option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                            {{ category.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="商品标签" name="tags">
                    <a-select v-model:value="formState.tags" mode="tags" style="width: 100%" placeholder="输入标签后按回车" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { message } from 'ant-design-vue';
    import axios from 'axios';

    // 表格列定义
    const columns = [
        { title: '商品图片', dataIndex: 'image', key: 'image', width: 100 },
        { title: '商品名称', dataIndex: 'name', key: 'name' },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => `¥${Number(price).toFixed(2)}`,
        },
        { title: '库存', dataIndex: 'stock', key: 'stock', width: 100 },
        { title: '分类', dataIndex: ['category', 'label'], key: 'category' },
        { title: '标签', dataIndex: 'tags', key: 'tags' },
        { title: '操作', key: 'action', width: 150 },
    ];

    // 列表数据和加载状态
    const productList = ref([]);
    const loading = ref(false);
    const pagination = reactive({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 搜索参数
    const searchParams = reactive({
        search: '',
        category: undefined,
    });

    // 选择行相关
    const selectedRowKeys = ref([]);
    const onSelectChange = (keys) => {
        selectedRowKeys.value = keys;
    };

    // 表单相关
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const modalType = ref('create');
    const formRef = ref();
    const formState = reactive({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        image: '',
        images: [],
        categoryId: undefined,
        tags: [],
        specifications: [],
    });

    // 分类列表
    const categoryOptions = ref([]);

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.code === 200) {
                categoryOptions.value = response.data.data;
            }
        } catch (error) {
            message.error('获取分类列表失败');
        }
    };

    // 图片输入处理
    const imagesInput = computed({
        get: () => formState.images.join(','),
        set: (val) => {
            formState.images = val.split(',').filter(Boolean);
        },
    });

    const rules = {
        name: [{ required: true, message: '请输入商品名称' }],
        price: [{ required: true, message: '请输入商品价格' }],
        stock: [{ required: true, message: '请输入商品库存' }],
        description: [{ required: true, message: '请输入商品描述' }],
        image: [{ required: true, message: '请输入商品主图' }],
        categoryId: [{ required: true, message: '请选择商品分类' }],
    };

    // 规格相关操作
    const addSpecification = () => {
        formState.specifications.push({ name: '', value: '' });
    };

    const removeSpecification = (index) => {
        formState.specifications.splice(index, 1);
    };

    // 获取商品列表
    const fetchProductList = async () => {
        try {
            loading.value = true;
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    ...searchParams,
                },
            });

            if (response.data.code === 200) {
                productList.value = response.data.data.items.map((item) => ({
                    ...item,
                    price: Number(item.price),
                    key: item.id,
                }));
                pagination.total = response.data.data.total;
            }
        } catch (error) {
            message.error('获取商品列表失败');
        } finally {
            loading.value = false;
        }
    };

    // 搜索
    const handleSearch = () => {
        pagination.current = 1;
        fetchProductList();
    };

    // 表格变化
    const handleTableChange = (pag) => {
        pagination.current = pag.current;
        pagination.pageSize = pag.pageSize;
        fetchProductList();
    };

    // 显示创建商品弹窗
    const showCreateModal = () => {
        modalType.value = 'create';
        Object.assign(formState, {
            name: '',
            price: 0,
            stock: 0,
            description: '',
            image: '',
            images: [],
            categoryId: undefined,
            tags: [],
            specifications: [],
        });
        // 确保有最新的分类数据
        fetchCategories();
        modalVisible.value = true;
    };

    // 显示编辑商品弹窗
    const showEditModal = (record) => {
        modalType.value = 'edit';
        Object.assign(formState, {
            ...record,
            categoryId: record.category.id,
        });
        // 确保有最新的分类数据
        fetchCategories();
        modalVisible.value = true;
    };

    // 处理弹窗确认
    const handleModalOk = async () => {
        try {
            await formRef.value.validate();
            modalLoading.value = true;
            const token = localStorage.getItem('token');

            const submitData = {
                ...formState,
                specifications: formState.specifications.filter((spec) => spec.name && spec.value),
            };

            if (modalType.value === 'create') {
                await axios.post('http://localhost:3000/api/admin/products', submitData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('创建成功');
            } else {
                const { id, category, ...updateData } = submitData;
                await axios.put(`http://localhost:3000/api/admin/products/${id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('更新成功');
            }

            modalVisible.value = false;
            fetchProductList();
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message);
            }
        } finally {
            modalLoading.value = false;
        }
    };

    // 处理删除商品
    const handleDelete = async (record) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/admin/products/${record.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('删除成功');
            fetchProductList();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 处理批量删除
    const handleBatchDelete = async () => {
        if (!selectedRowKeys.value.length) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/admin/products/batch/delete', { ids: selectedRowKeys.value }, { headers: { Authorization: `Bearer ${token}` } });
            message.success('批量删除成功');
            selectedRowKeys.value = [];
            fetchProductList();
        } catch (error) {
            message.error('批量删除失败');
        }
    };

    // 添加图片加载错误处理
    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
    };

    // 初始化
    onMounted(() => {
        fetchProductList();
        fetchCategories();
    });
</script>

<style scoped>
    .product-list {
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
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    .danger {
        color: #ff4d4f;
    }
    .image-preview {
        margin-top: 8px;
    }
    .image-preview img {
        width: 100px;
        height: 100px;
        object-fit: cover;
    }
    .images-preview {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
    }
    .images-preview img {
        width: 80px;
        height: 80px;
        object-fit: cover;
    }
    .spec-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
</style>
