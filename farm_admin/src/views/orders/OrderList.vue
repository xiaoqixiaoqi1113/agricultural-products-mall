<template>
    <div class="order-list">
        <div class="action-bar">
            <div class="search-area">
                <a-input-search
                    :value="searchParams.search"
                    @update:value="(val) => (searchParams.search = val)"
                    placeholder="搜索订单号/用户名/手机号"
                    style="width: 250px"
                    @search="handleSearch" />
                <a-select
                    :value="searchParams.status"
                    @update:value="(val) => (searchParams.status = val)"
                    style="width: 120px"
                    placeholder="订单状态"
                    allowClear
                    @change="handleSearch">
                    <a-select-option value="pending">待付款</a-select-option>
                    <a-select-option value="paid">待发货</a-select-option>
                    <a-select-option value="shipped">待收货</a-select-option>
                    <a-select-option value="completed">已完成</a-select-option>
                    <a-select-option value="cancelled">已取消</a-select-option>
                </a-select>
            </div>
        </div>

        <a-table :columns="columns" :data-source="orderList" :loading="loading" :pagination="pagination" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                    <a-tag :color="getStatusColor(record.status)">
                        {{ getStatusText(record.status) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'totalAmount'"> ¥{{ Number(record.totalAmount).toFixed(2) }} </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a @click="showOrderDetail(record)">查看详情</a>
                        <a-dropdown v-if="record.status !== 'cancelled' && record.status !== 'completed'">
                            <a class="ant-dropdown-link" @click.prevent>
                                更新状态
                                <down-outlined />
                            </a>
                            <template #overlay>
                                <a-menu @click="({ key }) => handleStatusUpdate(record, key)">
                                    <a-menu-item key="pending">标记待付款</a-menu-item>
                                    <a-menu-item key="paid">标记待发货</a-menu-item>
                                    <a-menu-item key="completed">标记已完成</a-menu-item>
                                    <a-menu-item key="cancelled">标记已取消</a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                        <a-popconfirm title="确定要删除此订单吗？" @confirm="handleDelete(record)">
                            <a class="danger">删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>

        <!-- 订单详情弹窗 -->
        <a-modal :visible="detailVisible" @update:visible="(val) => (detailVisible = val)" title="订单详情" width="800px" :footer="null">
            <a-descriptions bordered>
                <a-descriptions-item label="订单号" span="3">{{ currentOrder?.orderNo }}</a-descriptions-item>
                <a-descriptions-item label="订单状态">
                    <a-tag :color="getStatusColor(currentOrder?.status)">
                        {{ getStatusText(currentOrder?.status) }}
                    </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="下单时间">
                    {{ formatDate(currentOrder?.createTime) }}
                </a-descriptions-item>
                <a-descriptions-item label="用户信息" span="3">
                    {{ currentOrder.address.phone ? currentOrder.address.phone : '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="收货地址" span="3">
                    {{ currentOrder?.address.province }}{{ currentOrder?.address.city }}{{ currentOrder?.address.district }}{{ currentOrder?.address.detail }}
                </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <div class="order-items">
                <h3>订单商品</h3>
                <a-table :columns="orderItemColumns" :data-source="currentOrder?.products" :pagination="false">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'product'">
                            <div class="product-info">
                                <img :src="record.product.image" :alt="record.product.name" @error="handleImageError" />
                                <span>{{ record.product.name }}</span>
                            </div>
                        </template>
                        <template v-if="column.key === 'price'"> ¥{{ Number(record.price).toFixed(2) }} </template>
                        <template v-if="column.key === 'subtotal'"> ¥{{ Number(record.subtotal).toFixed(2) }} </template>
                    </template>
                </a-table>

                <div class="order-total">
                    <span>订单总额：</span>
                    <span class="total-amount">¥{{ Number(currentOrder?.totalAmount).toFixed(2) }}</span>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import { message } from 'ant-design-vue';
    import { DownOutlined } from '@ant-design/icons-vue';
    import axios from 'axios';

    // 订单状态配置
    const statusConfig = {
        pending: { color: 'warning', text: '待付款' },
        paid: { color: 'processing', text: '待发货' },
        shipped: { color: 'primary', text: '待收货' },
        completed: { color: 'success', text: '已完成' },
        cancelled: { color: 'danger', text: '已取消' },
    };

    // 表格列定义
    const columns = [
        { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
        {
            title: '用户信息',
            key: 'userInfo',
            customRender: ({ record }) => {
                return record.user.username;
            },
        },
        { title: '订单状态', dataIndex: 'status', key: 'status' },
        { title: '订单金额', dataIndex: 'totalAmount', key: 'totalAmount' },
        {
            title: '下单时间',
            dataIndex: 'createTime',
            key: 'createTime',
            customRender: ({ text }) => formatDate(text),
        },
        { title: '操作', key: 'action', width: 200 },
    ];

    // 订单商品列定义
    const orderItemColumns = [
        { title: '商品信息', dataIndex: 'product', key: 'product', width: '40%' },
        { title: '单价', dataIndex: 'price', key: 'price' },
        { title: '数量', dataIndex: 'quantity', key: 'quantity' },
        { title: '小计', key: 'subtotal' },
    ];

    // 列表数据和加载状态
    const orderList = ref([]);
    const loading = ref(false);
    const pagination = reactive({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 搜索参数
    const searchParams = reactive({
        search: '',
        status: undefined,
    });

    // 详情弹窗相关
    const detailVisible = ref(false);
    const currentOrder = ref(null);

    // 获取订单列表
    const fetchOrderList = async () => {
        try {
            loading.value = true;
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    ...searchParams,
                },
            });

            if (response.data.code === 200) {
                orderList.value = response.data.data.items.map((item) => ({
                    ...item,
                    key: item.id,
                }));
                pagination.total = response.data.data.total;
            }
        } catch (error) {
            message.error('获取订单列表失败');
        } finally {
            loading.value = false;
        }
    };

    // 获取订单详情
    const fetchOrderDetail = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.code === 200) {
                currentOrder.value = response.data.data;
            }
        } catch (error) {
            message.error('获取订单详情失败');
        }
    };

    // 搜索
    const handleSearch = () => {
        pagination.current = 1;
        fetchOrderList();
    };

    // 表格变化
    const handleTableChange = (pag) => {
        pagination.current = pag.current;
        pagination.pageSize = pag.pageSize;
        fetchOrderList();
    };

    // 显示订单详情
    const showOrderDetail = async (record) => {
        await fetchOrderDetail(record.id);
        detailVisible.value = true;
    };

    // 更新订单状态
    const handleStatusUpdate = async (record, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/admin/orders/${record.id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            message.success('状态更新成功');
            fetchOrderList();
            if (currentOrder.value?.id === record.id) {
                fetchOrderDetail(record.id);
            }
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    // 删除订单
    const handleDelete = async (record) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/admin/orders/${record.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('删除成功');
            fetchOrderList();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 工具函数
    const getStatusColor = (status) => statusConfig[status]?.color || 'default';
    const getStatusText = (status) => statusConfig[status]?.text || status;
    const formatDate = (date) => (date ? new Date(date).toLocaleString() : '-');
    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
    };

    // 初始化
    fetchOrderList();
</script>

<style scoped>
    .order-list {
        padding: 24px;
    }
    .action-bar {
        margin-bottom: 16px;
    }
    .search-area {
        display: flex;
        gap: 16px;
    }
    .danger {
        color: #ff4d4f;
    }
    .order-items {
        margin-top: 16px;
    }
    .product-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .product-info img {
        width: 50px;
        height: 50px;
        object-fit: cover;
    }
    .order-total {
        margin-top: 16px;
        text-align: right;
        font-size: 16px;
    }
    .total-amount {
        color: #ff4d4f;
        font-weight: bold;
        margin-left: 8px;
    }
    :deep(.ant-descriptions-item-label) {
        width: 100px;
    }
</style>
