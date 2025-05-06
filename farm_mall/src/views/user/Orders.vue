<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>我的订单</span>
            </div>
        </template>
        <el-table :data="orders" v-loading="loading">
            <el-table-column prop="id" label="订单号" width="220" />
            <el-table-column label="下单时间" width="180">
                <template #default="{ row }">
                    {{ new Date(row.createTime).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="订单金额" width="120">
                <template #default="{ row }"> ¥{{ Number(row.totalAmount).toFixed(2) }} </template>
            </el-table-column>
            <el-table-column label="订单状态" width="120">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button type="primary" link @click="handleView(row)">查看详情</el-button>
                    <el-button v-if="canCancel(row.status)" type="primary" link @click="handleCancel(row)">取消订单</el-button>
                    <el-button v-if="canConfirm(row.status)" type="success" link @click="handleConfirm(row)">确认收货</el-button>
                    <el-button v-if="canDelete(row.status)" type="danger" link @click="handleDelete(row)">删除订单</el-button>
                    <el-button v-if="canPay(row.status)" type="primary" link @click="handlePay(row)">支付</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination" v-if="total > pageSize">
            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" v-model="currentPage" @current-change="loadOrders" />
        </div>

        <!-- 订单详情弹窗 -->
        <el-dialog v-model="dialogVisible" title="订单详情" width="700px">
            <div v-if="currentOrder" class="order-detail">
                <div class="detail-section">
                    <h3>基本信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">订单编号：</span>
                            <span>{{ currentOrder.id }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">下单时间：</span>
                            <span>{{ new Date(currentOrder.createTime).toLocaleString() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">订单状态：</span>
                            <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
                        </div>
                        <div class="info-item">
                            <span class="label">订单金额：</span>
                            <span class="amount">¥{{ Number(currentOrder.totalAmount).toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>收货信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">收货人：</span>
                            <span>{{ currentOrder.address?.name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">联系电话：</span>
                            <span>{{ currentOrder.address?.phone }}</span>
                        </div>
                        <div class="info-item full-width">
                            <span class="label">收货地址：</span>
                            <span>{{ formatAddress(currentOrder.address) }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>商品信息</h3>
                    <el-table :data="currentOrder.products" border>
                        <el-table-column label="商品图片" width="100">
                            <template #default="{ row }">
                                <el-image :src="row.product.image" :alt="row.product.name" style="width: 60px; height: 60px" fit="cover" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="product.name" label="商品名称" />
                        <el-table-column prop="product.price" label="单价" width="120">
                            <template #default="{ row }"> ¥{{ Number(row.price).toFixed(2) }} </template>
                        </el-table-column>
                        <el-table-column prop="quantity" label="数量" width="100" />
                        <el-table-column label="小计" width="120">
                            <template #default="{ row }"> ¥{{ (row.price * row.quantity).toFixed(2) }} </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-dialog>
    </el-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { ElMessage, ElMessageBox } from 'element-plus';
    import { getOrders, cancelOrder, confirmOrder, deleteOrder, payOrder, getOrderDetail } from '@/api/orders';

    const orders = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const dialogVisible = ref(false);
    const currentOrder = ref(null);

    // 订单状态处理函数
    const getStatusText = (status) => {
        const statusMap = {
            pending: '待付款',
            paid: '待发货',
            shipped: '待收货',
            completed: '已完成',
            cancelled: '已取消',
        };
        return statusMap[status] || status;
    };

    const getStatusType = (status) => {
        const typeMap = {
            pending: 'warning',
            paid: 'info',
            shipped: 'primary',
            completed: 'success',
            cancelled: 'danger',
        };
        return typeMap[status] || '';
    };

    // 格式化地址
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.province} ${address.city} ${address.district} ${address.detail}`;
    };

    // 按钮显示控制
    const canCancel = (status) => ['pending', 'paid'].includes(status);
    const canConfirm = (status) => status === 'shipped';
    const canDelete = (status) => ['completed', 'cancelled'].includes(status);
    const canPay = (status) => status === 'pending';

    const loadOrders = async () => {
        loading.value = true;
        try {
            const data = await getOrders({
                page: currentPage.value,
                pageSize: pageSize.value,
            });
            orders.value = data.items;
            total.value = data.total;
        } catch (error) {
            console.error('获取订单列表失败:', error);
            ElMessage.error('获取订单列表失败');
        } finally {
            loading.value = false;
        }
    };

    const handleView = async (order) => {
        loading.value = true;
        try {
            const response = await getOrderDetail(order.id);
            currentOrder.value = response;
            dialogVisible.value = true;
        } catch (error) {
            console.error('获取订单详情失败:', error);
            ElMessage.error('获取订单详情失败');
        } finally {
            loading.value = false;
        }
    };

    const handleCancel = async (order) => {
        try {
            await cancelOrder(order.id);
            await loadOrders();
            ElMessage.success('订单已取消');
        } catch (error) {
            console.error('取消订单失败:', error);
            ElMessage.error('取消订单失败');
        }
    };

    const handleConfirm = async (order) => {
        try {
            await confirmOrder(order.id);
            await loadOrders();
            ElMessage.success('已确认收货');
        } catch (error) {
            console.error('确认收货失败:', error);
            ElMessage.error('确认收货失败');
        }
    };

    const handleDelete = async (order) => {
        try {
            await deleteOrder(order.id);
            await loadOrders();
            ElMessage.success('订单已删除');
        } catch (error) {
            console.error('删除订单失败:', error);
            ElMessage.error('删除订单失败');
        }
    };

    const handlePay = async (order) => {
        try {
            await ElMessageBox.confirm('确定要支付该订单吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            });

            await payOrder(order.id);
            ElMessage.success('支付成功');
            await loadOrders();
        } catch (error) {
            if (error !== 'cancel') {
                console.error('支付失败:', error);
                ElMessage.error('支付失败');
            }
        }
    };

    onMounted(() => {
        loadOrders();
    });
</script>

<style scoped lang="scss">
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pagination {
        margin-top: 20px;
        text-align: center;
    }

    .el-table {
        margin-bottom: 20px;
    }

    .order-detail {
        .detail-section {
            margin-bottom: 24px;

            h3 {
                margin: 0 0 16px;
                font-size: 16px;
                font-weight: bold;
                color: #303133;
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .info-item {
                display: flex;
                align-items: center;

                &.full-width {
                    grid-column: span 2;
                }

                .label {
                    color: #909399;
                    margin-right: 8px;
                    min-width: 80px;
                }

                .amount {
                    color: #f56c6c;
                    font-weight: bold;
                }
            }
        }

        :deep(.el-table) {
            margin-top: 16px;
        }
    }
</style>
