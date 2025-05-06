<template>
    <el-card v-loading="loading">
        <template #header>
            <div class="card-header">
                <span>我的收藏</span>
            </div>
        </template>

        <!-- 空状态 -->
        <el-empty v-if="!loading && (!favorites || favorites.length === 0)" description="暂无收藏">
            <template #image>
                <el-icon :size="80" style="margin-bottom: 20px; color: #909399">
                    <Star />
                </el-icon>
            </template>
            <el-button type="primary" @click="$router.push('/product/list')">去选购</el-button>
        </el-empty>

        <!-- 收藏列表 -->
        <template v-else>
            <el-row :gutter="20">
                <el-col :span="6" v-for="item in favorites" :key="item.id">
                    <el-card class="favorite-card" shadow="hover">
                        <img :src="item.image || '/placeholder.png'" class="product-image" :alt="item.name" @click="handleProductClick(item.product)" />
                        <h3>{{ item.product?.name }}</h3>
                        <div class="price">¥{{ Number(item.price).toFixed(2) || '0.00' }}</div>
                        <div class="actions">
                            <el-button type="primary" size="small" @click="handleAddToCart(item.product)">加入购物车</el-button>
                            <el-button type="danger" size="small" @click="handleRemove(item)">取消收藏</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 分页 -->
            <div class="pagination" v-if="total > pageSize">
                <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model="currentPage" @current-change="handlePageChange" />
            </div>
        </template>
    </el-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { Star } from '@element-plus/icons-vue';
    import { getFavorites, removeFavorite } from '@/api/favorites';
    import { addToCart } from '@/api/cart';

    const router = useRouter();
    const favorites = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(12);
    const total = ref(0);

    const loadFavorites = async () => {
        loading.value = true;
        try {
            const data = await getFavorites({
                page: currentPage.value,
                pageSize: pageSize.value,
            });
            favorites.value = data.items;
            total.value = data.total;
        } catch (error) {
            console.error('获取收藏列表失败:', error);
            ElMessage.error('获取收藏列表失败');
        } finally {
            loading.value = false;
        }
    };

    const handleRemove = async (item) => {
        try {
            await removeFavorite(item.id);
            await loadFavorites();
            ElMessage.success('已取消收藏');
        } catch (error) {
            console.error('取消收藏失败:', error);
            ElMessage.error('取消收藏失败');
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await addToCart({
                productId: product.id,
                quantity: 1,
            });
            ElMessage.success('已添加到购物车');
        } catch (error) {
            console.error('添加到购物车失败:', error);
            ElMessage.error('添加到购物车失败');
        }
    };

    const handleProductClick = (product) => {
        router.push(`/product/detail/${product.id}`);
    };

    const handlePageChange = (page) => {
        currentPage.value = page;
        loadFavorites();
    };

    onMounted(() => {
        loadFavorites();
    });
</script>

<style scoped lang="scss">
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .favorite-card {
        margin-bottom: 20px;
        .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.3s;
            &:hover {
                opacity: 0.8;
            }
        }
        h3 {
            margin: 10px 0;
            font-size: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .price {
            color: #f56c6c;
            font-size: 20px;
            margin: 10px 0;
        }
        .actions {
            display: flex;
            gap: 10px;
        }
    }

    .pagination {
        margin-top: 30px;
        text-align: center;
    }
</style>
