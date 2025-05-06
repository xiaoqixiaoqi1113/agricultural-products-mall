<template>
    <el-card v-loading="loading">
        <template #header>
            <div class="card-header">
                <span>购物车</span>
                <div class="header-actions">
                    <el-button type="primary" @click="handleCheckout" :disabled="!cartItems.length"> 结算 (¥{{ totalAmount.toFixed(2) }}) </el-button>
                </div>
            </div>
        </template>

        <!-- 空状态 -->
        <el-empty v-if="!loading && (!cartItems || cartItems.length === 0)" description="购物车是空的">
            <el-button type="primary" @click="$router.push('/product/list')">去选购</el-button>
        </el-empty>

        <!-- 购物车列表 -->
        <template v-else>
            <el-table :data="cartItems">
                <el-table-column label="商品" min-width="400">
                    <template #default="{ row }">
                        <div class="product-info">
                            <el-image :src="row.image" :alt="row.name" style="width: 80px; height: 80px" fit="cover" />
                            <div class="product-detail">
                                <div class="product-name" @click="$router.push(`/product/detail/${row.id}`)">
                                    {{ row.name }}
                                </div>
                                <div class="product-specs" v-if="row.specifications">
                                    <el-tag size="small" v-for="(spec, index) in row.specifications" :key="index"> {{ spec.name }}: {{ spec.value }} </el-tag>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="单价" width="120">
                    <template #default="{ row }">
                        <span class="price">¥{{ Number(row.price).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="数量" width="150">
                    <template #default="{ row }">
                        <el-input-number v-model="row.quantity" :min="1" :max="99" @change="(value) => handleQuantityChange(row, value)" />
                    </template>
                </el-table-column>
                <el-table-column label="小计" width="120">
                    <template #default="{ row }">
                        <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                        <el-button type="danger" text @click="handleRemove(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <!-- 收货地址对话框 -->
        <el-dialog v-model="addressDialogVisible" title="填写收货地址" width="500px">
            <el-form :model="addressForm" ref="addressFormRef" label-width="100px" :rules="addressRules">
                <el-form-item label="收货人" prop="name">
                    <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="省份" prop="province">
                    <el-input v-model="addressForm.province" placeholder="请输入省份" />
                </el-form-item>
                <el-form-item label="城市" prop="city">
                    <el-input v-model="addressForm.city" placeholder="请输入城市" />
                </el-form-item>
                <el-form-item label="区/县" prop="district">
                    <el-input v-model="addressForm.district" placeholder="请输入区/县" />
                </el-form-item>
                <el-form-item label="详细地址" prop="detail">
                    <el-input v-model="addressForm.detail" type="textarea" placeholder="请输入详细地址，如街道、门牌号等" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="addressDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmOrder">确认下单</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup>
    import { ref, computed, onMounted, reactive } from 'vue';
    import { getCartList, updateCartItem, removeCartItem } from '@/api/cart.js';
    import { createOrder } from '@/api/orders';
    import { useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';

    const cartItems = ref([]);
    const loading = ref(false);
    const router = useRouter();
    const addressFormRef = ref(null);

    const addressDialogVisible = ref(false);
    const addressForm = reactive({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
    });

    const addressRules = {
        name: [
            { required: true, message: '请输入收货人姓名', trigger: 'blur' },
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        phone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
        ],
        province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
        city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
        district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
        detail: [
            { required: true, message: '请输入详细地址', trigger: 'blur' },
            { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' },
        ],
    };

    const loadCartList = async () => {
        loading.value = true;
        try {
            const data = await getCartList();
            cartItems.value = data.map((item) => ({
                ...item,
                selected: true,
            }));
        } catch (error) {
            console.error('获取购物车列表失败:', error);
            ElMessage.error('获取购物车列表失败');
        } finally {
            loading.value = false;
        }
    };

    const handleQuantityChange = async (item, quantity) => {
        try {
            await updateCartItem(item.id, { quantity });
            await loadCartList();
        } catch (error) {
            console.error('更新商品数量失败:', error);
            ElMessage.error('更新商品数量失败');
        }
    };

    const handleRemove = async (item) => {
        try {
            await removeCartItem(item.id);
            await loadCartList();
            ElMessage.success('商品已移除');
        } catch (error) {
            console.error('移除商品失败:', error);
            ElMessage.error('移除商品失败');
        }
    };

    const totalAmount = computed(() => {
        return cartItems.value.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    });

    const handleCheckout = () => {
        if (cartItems.value.length === 0) {
            ElMessage.warning('购物车是空的');
            return;
        }
        addressDialogVisible.value = true;
    };

    const confirmOrder = async () => {
        if (!addressFormRef.value) return;

        try {
            await addressFormRef.value.validate();
            await createOrder({
                products: cartItems.value.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                address: addressForm,
            });

            ElMessage.success('下单成功');
            addressDialogVisible.value = false;
            router.push('/orders');
        } catch (error) {
            console.error('下单失败:', error);
            ElMessage.error('下单失败');
        }
    };

    onMounted(() => {
        loadCartList();
    });
</script>

<style scoped lang="scss">
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
            display: flex;
            gap: 16px;
        }
    }

    .product-info {
        display: flex;
        gap: 16px;
        align-items: center;

        .product-detail {
            flex: 1;
            min-width: 0;

            .product-name {
                font-size: 14px;
                margin-bottom: 8px;
                color: #303133;
                cursor: pointer;

                &:hover {
                    color: #409eff;
                }
            }

            .product-specs {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
        }
    }

    .price,
    .subtotal {
        color: #f56c6c;
        font-weight: 500;
    }

    .subtotal {
        font-size: 16px;
    }
</style>
