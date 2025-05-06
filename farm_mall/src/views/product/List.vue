<template>
    <div class="product-list">
        <!-- 轮播图区域 -->
        <el-card class="banner-card">
            <el-carousel height="400px" :interval="4000" type="card">
                <el-carousel-item v-for="banner in banners" :key="banner.id">
                    <div class="banner-content" :style="{ backgroundImage: 'url(' + banner.image + ')' }">
                        <div class="banner-info">
                            <h2>{{ banner.title }}</h2>
                            <p>{{ banner.description }}</p>
                            <el-button type="primary" size="large" class="banner-btn">{{ banner.buttonText }}</el-button>
                        </div>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </el-card>

        <!-- 推荐分类 -->
        <el-card class="category-card">
            <div class="category-list">
                <div v-for="cat in recommendCategories" :key="cat.id" class="category-item" @click="selectedCategory = cat.value">
                    <el-image :src="cat.image" fit="cover" />
                    <span>{{ cat.label }}</span>
                </div>
            </div>
        </el-card>

        <!-- 主要内容区 -->
        <el-row class="main-content">
            <el-card class="product-container" v-loading="loading">
                <template #header>
                    <div class="card-header">
                        <div class="search-box">
                            <el-input v-model="searchQuery" placeholder="搜索农产品" :prefix-icon="Search" clearable @clear="handleRefresh">
                                <template #append>
                                    <el-button :icon="Search" @click="handleSearch"> 搜索 </el-button>
                                </template>
                            </el-input>
                        </div>
                    </div>
                </template>

                <!-- 空状态 -->
                <el-empty v-if="!loading && (!products || products.length === 0)" description="暂无商品" :image-size="200">
                    <template #image>
                        <el-icon :size="80" style="margin-bottom: 20px; color: #909399">
                            <ShoppingCart />
                        </el-icon>
                    </template>
                    <el-button type="primary" @click="handleRefresh">刷新</el-button>
                </el-empty>

                <!-- 商品列表 -->
                <template v-else>
                    <el-row :gutter="20">
                        <el-col :span="6" v-for="product in products" :key="product.id">
                            <ProductCard :product="product" />
                        </el-col>
                    </el-row>

                    <div class="pagination" v-if="total > 0">
                        <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model="currentPage" />
                    </div>
                </template>
            </el-card>
        </el-row>
    </div>
</template>

<script setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import { Search, ShoppingCart, Star } from '@element-plus/icons-vue';
    import { ElMessage } from 'element-plus';
    import { useRouter } from 'vue-router';
    import ProductCard from '@/components/product/ProductCard.vue';
    import { getProducts, getRecommendCategories, searchProducts } from '@/api/products';
    import { debounce } from 'lodash-es';

    const router = useRouter();

    // 轮播图数据
    const banners = [
        {
            id: 1,
            title: '新鲜有机蔬果',
            description: '精选当季有机农产品，为您的健康保驾护航',
            buttonText: '立即选购',
            image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1500&auto=format',
        },
        {
            id: 2,
            title: '产地直采',
            description: '从农场到餐桌，保证新鲜直达',
            buttonText: '了解更多',
            image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1500&auto=format',
        },
        {
            id: 3,
            title: '限时特惠',
            description: '精选商品限时折扣，错过等一年',
            buttonText: '马上抢购',
            image: 'https://images.unsplash.com/photo-1594056113573-f8faae5ac78e?w=1500&auto=format',
        },
    ];

    const total = ref(0);
    const loading = ref(false);
    const pageSize = ref(12);
    const currentPage = ref(1);
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const products = ref([]);
    const recommendCategories = ref([]);
    const selectedCategory = ref('');

    // 刷新商品列表
    const handleRefresh = () => {
        currentPage.value = 1;
        searchQuery.value = '';
        selectedCategory.value = '';
        loadProducts();
    };

    // 加载商品列表
    const loadProducts = async () => {
        loading.value = true;
        try {
            const data = await getProducts({
                page: currentPage.value,
                pageSize: pageSize.value,
                category: selectedCategory.value,
                search: searchQuery.value,
            });
            products.value = data.items;
            total.value = data.total;
        } catch (error) {
            console.error('获取商品列表失败:', error);
            ElMessage.error('获取商品列表失败');
        } finally {
            loading.value = false;
        }
    };

    // 加载推荐分类
    const loadRecommendCategories = async () => {
        try {
            const data = await getRecommendCategories();
            recommendCategories.value = data;
        } catch (error) {
            console.error('获取推荐分类失败:', error);
        }
    };

    // 防抖处理的搜索方法
    const handleSearch = debounce(async () => {
        if (!searchQuery.value.trim()) {
            handleRefresh();
            return;
        }

        loading.value = true;
        try {
            const data = await searchProducts({ keyword: searchQuery.value });
            products.value = data;
            total.value = data.length;
            currentPage.value = 1;
        } catch (error) {
            console.error('搜索商品失败:', error);
            ElMessage.error('搜索商品失败');
        } finally {
            loading.value = false;
        }
    }, 300);

    // 监听搜索输入
    watch(searchQuery, () => {
        if (searchQuery.value) {
            handleSearch();
        }
    });

    // 监听分页和分类变化
    watch([currentPage, selectedCategory], () => {
        loadProducts();
    });

    // 处理商品点击
    const handleProductClick = (product) => {
        router.push(`/product/detail/${product.id}`);
    };

    onMounted(() => {
        loadProducts();
        loadRecommendCategories();
    });
</script>

<style scoped lang="scss">
    .product-list {
        padding: 20px;
        background-color: #f5f7fa;
        min-height: 100vh;
    }

    .banner-card {
        margin-bottom: 20px;
        .banner-content {
            height: 100%;
            background-size: cover;
            background-position: center;
            border-radius: 6px;
            position: relative;
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
                border-radius: 6px;
            }
        }
        .banner-info {
            position: absolute;
            left: 50px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            z-index: 1;
            h2 {
                font-size: 2.5em;
                margin: 0 0 20px 0;
                font-weight: 600;
            }
            p {
                font-size: 1.2em;
                margin: 0 0 30px 0;
                max-width: 400px;
            }
            .banner-btn {
                padding: 12px 30px;
                font-size: 1.1em;
            }
        }
    }

    .category-card {
        margin-bottom: 20px;
        .category-list {
            display: flex;
            justify-content: space-between;
            padding: 20px;
        }
        .category-item {
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s;
            &:hover {
                transform: translateY(-5px);
            }
            .el-image {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin-bottom: 10px;
            }
            span {
                display: block;
                color: #606266;
            }
        }
    }

    .main-content {
        margin-top: 20px;

        .product-container {
            width: 100%;
        }
    }

    .card-header {
        display: flex;
        align-items: center;
        .search-box {
            position: relative;
            width: 300px;
        }
    }

    .pagination {
        margin-top: 30px;
        text-align: center;
    }

    :deep(.el-carousel__item) {
        border-radius: 6px;
    }

    // 添加图片预览相关样式
    :deep(.el-image-viewer__wrapper) {
        .el-image-viewer__close {
            color: #fff;
        }
        .el-image-viewer__actions {
            opacity: 1;
            background: rgba(0, 0, 0, 0.7);
        }
        .el-image-viewer__prev,
        .el-image-viewer__next {
            width: 44px;
            height: 44px;
            font-size: 24px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            &:hover {
                background-color: rgba(0, 0, 0, 0.5);
            }
        }
    }

    .product-image {
        cursor: zoom-in;
    }
</style>
