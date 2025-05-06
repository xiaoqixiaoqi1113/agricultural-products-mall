<template>
    <div class="category-page">
        <!-- 分类导航 -->
        <el-card class="category-nav">
            <el-menu :default-active="activeCategory" class="category-menu" @select="handleCategorySelect">
                <el-menu-item v-for="category in categories" :key="category.value" :index="category.value">
                    <span>{{ category.label }}</span>
                    <span class="category-count">({{ category.count || 0 }})</span>
                </el-menu-item>
            </el-menu>
        </el-card>

        <!-- 分类内容 -->
        <el-card class="category-content">
            <!-- 商品列表 -->
            <template v-if="filteredProducts.length > 0">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="product in filteredProducts" :key="product.id">
                        <ProductCard :product="product" />
                    </el-col>
                </el-row>
            </template>
            <template v-else>
                <div class="empty-state">
                    <el-empty :image-size="200">
                        <template #image>
                            <el-icon :size="80" class="empty-icon">
                                <Shop />
                            </el-icon>
                        </template>
                        <template #description>
                            <p>当前分类暂无相关商品</p>
                            <p class="sub-text">您可以尝试切换其他分类</p>
                        </template>
                    </el-empty>
                </div>
            </template>

            <!-- 分页 -->
            <div class="pagination" v-if="total > pageSize">
                <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model="currentPage" @current-change="handlePageChange" />
            </div>
        </el-card>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { Shop } from '@element-plus/icons-vue';
    import ProductCard from '@/components/product/ProductCard.vue';
    import { getCategories, getProducts } from '@/api/products';

    const router = useRouter();

    // 分类数据
    const categories = ref([]);
    const products = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(12);
    const total = ref(0);

    // 状态管理
    const activeCategory = ref('');

    // 根据分类过滤商品
    const filteredProducts = computed(() => {
        return products.value;
    });

    // 处理分类选择
    const handleCategorySelect = (index) => {
        activeCategory.value = index;
        currentPage.value = 1;
        loadProducts();
    };

    // 处理分页
    const handlePageChange = (page) => {
        currentPage.value = page;
        loadProducts();
    };

    // 跳转到商品详情
    const goToDetail = (productId) => {
        router.push(`/product/detail/${productId}`);
    };

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            categories.value = data;
            // 设置默认选中的分类
            if (data.length > 0 && !activeCategory.value) {
                activeCategory.value = data[0].value;
                loadProducts();
            }
        } catch (error) {
            console.error('获取分类列表失败:', error);
        }
    };

    const loadProducts = async () => {
        if (!activeCategory.value) return;

        loading.value = true;
        try {
            const data = await getProducts({
                page: currentPage.value,
                pageSize: pageSize.value,
                category: activeCategory.value,
            });
            products.value = data.items;
            total.value = data.total;
        } catch (error) {
            console.error('获取商品列表失败:', error);
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        loadCategories();
    });
</script>

<style scoped lang="scss">
    .category-page {
        padding: 20px;
        display: flex;
        gap: 20px;
        background-color: #f5f7fa;
        min-height: 100vh;
    }

    .category-nav {
        width: 200px;
        .category-menu {
            border-right: none;
        }
        .category-count {
            color: #909399;
            font-size: 12px;
            margin-left: 4px;
        }
    }

    .category-content {
        flex: 1;
    }

    .product-card {
        margin-bottom: 20px;
        transition: transform 0.3s;
        cursor: pointer;

        &:hover {
            transform: translateY(-5px);
        }

        .product-image-container {
            position: relative;
            width: 100%;
            height: 200px;
            background-color: #f5f7fa;
            border-radius: 4px;
            overflow: hidden;

            .product-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;

                &:not([src]),
                &[src=''],
                &[src*='error'],
                &[src$='undefined'],
                &[src$='null'] {
                    opacity: 0;
                }

                transition: opacity 0.3s ease;
            }

            .product-tags {
                position: absolute;
                top: 10px;
                left: 10px;
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                z-index: 1;
            }
        }

        h3 {
            margin: 15px 0 10px;
            font-size: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .product-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .price {
                color: #f56c6c;
                font-size: 20px;
                font-weight: bold;
            }
            .sales {
                color: #909399;
                font-size: 13px;
            }
        }
    }

    .pagination {
        margin-top: 30px;
        text-align: center;
    }

    .empty-state {
        padding: 60px 0;
        text-align: center;

        .empty-icon {
            color: var(--el-text-color-secondary);
        }

        .sub-text {
            color: #909399;
            font-size: 14px;
            margin-top: 8px;
        }
    }
</style>
