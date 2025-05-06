<template>
    <el-card class="product-card" shadow="hover" :class="{ 'out-of-stock': !product.stock }" @click="handleCardClick">
        <div class="product-image-container">
            <img :src="product.image" class="product-image" alt="商品图片" />
            <div class="product-tags" v-if="product.tags">
                <el-tag v-for="tag in product.tags" :key="tag" size="small" effect="dark">
                    {{ tag }}
                </el-tag>
            </div>
            <div class="favorite-btn" @click.stop="toggleFavorite(product)">
                <el-icon :class="{ 'is-favorite': product.isFavorite }">
                    <Star />
                </el-icon>
            </div>
            <div class="stock-overlay" v-if="!product.stock">
                <span>暂时缺货</span>
            </div>
        </div>
        <h3>{{ product.name }}</h3>
        <div class="product-info">
            <div class="price">¥{{ Number(product.price).toFixed(2) }}</div>
            <div class="sales" :class="{ 'out-of-stock-text': !product.stock }">库存: {{ product.stock || 0 }}</div>
        </div>
        <div class="product-footer">
            <el-button type="primary" :icon="ShoppingCart" @click.stop="addToCart(product)" :disabled="!product.stock" block>
                {{ product.stock ? '加入购物车' : '暂时缺货' }}
            </el-button>
        </div>
    </el-card>
</template>

<script setup>
    import { ShoppingCart, Star } from '@element-plus/icons-vue';
    import { useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { addFavorite, removeFavorite } from '@/api/favorites';
    import { addToCart as addToCartApi } from '@/api/cart';

    const router = useRouter();

    const props = defineProps({
        product: {
            type: Object,
            required: true,
        },
    });

    const checkLogin = () => {
        const tokenData = localStorage.getItem('tokenData');
        if (!tokenData) {
            ElMessage.warning('请先登录');
            router.push('/auth/login');
            return false;
        }
        const { expires } = JSON.parse(tokenData);
        if (expires <= Date.now()) {
            ElMessage.warning('登录已过期，请重新登录');
            router.push('/auth/login');
            return false;
        }
        return true;
    };

    const handleCardClick = () => {
        if (!props.product.stock) {
            ElMessage.warning('该商品暂时缺货');
            return;
        }
        goToDetail(props.product.id);
    };

    const goToDetail = (productId) => {
        router.push(`/product/detail/${productId}`);
    };

    const addToCart = async (product) => {
        if (!product.stock) {
            ElMessage.warning('该商品暂时缺货');
            return;
        }

        if (!checkLogin()) return;

        try {
            await addToCartApi({
                productId: product.id,
                quantity: 1,
            });
            ElMessage.success('已添加到购物车');
        } catch (error) {
            if (error.response?.status === 401) {
                router.push('/auth/login');
            } else {
                ElMessage.error(error.message || '添加到购物车失败');
            }
        }
    };

    const toggleFavorite = async (product) => {
        if (!checkLogin()) return;

        try {
            if (product.isFavorite) {
                await removeFavorite(product.id);
                product.isFavorite = false;
                ElMessage.success('已取消收藏');
            } else {
                await addFavorite({ productId: product.id });
                product.isFavorite = true;
                ElMessage.success('已收藏');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                router.push('/auth/login');
            } else {
                ElMessage.error(error.message || '操作收藏失败');
            }
        }
    };
</script>

<style scoped lang="scss">
    .product-card {
        margin-bottom: 20px;
        transition: transform 0.3s;
        cursor: pointer;

        &.out-of-stock {
            cursor: not-allowed;
            opacity: 0.8;

            &:hover {
                transform: none;
            }
        }

        &:hover {
            transform: translateY(-5px);
            .favorite-btn {
                opacity: 1;
            }
        }

        .product-image-container {
            position: relative;
            width: 100%;
            height: 200px;
            background-color: #f5f7fa;
            border-radius: 4px;
            overflow: hidden;

            .stock-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 18px;
                font-weight: bold;
            }

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

            .favorite-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 2;

                &:hover {
                    background: #fff;
                    transform: scale(1.1);
                }

                .el-icon {
                    font-size: 20px;
                    color: #909399;
                    transition: all 0.3s ease;

                    &.is-favorite {
                        color: #f56c6c;
                        animation: favorite-animation 0.3s ease;
                    }
                }
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
            margin-bottom: 15px;
            .price {
                color: #f56c6c;
                font-size: 20px;
                font-weight: bold;
            }
            .sales {
                color: #909399;
                font-size: 13px;

                &.out-of-stock-text {
                    color: #f56c6c;
                }
            }
        }

        .product-footer {
            display: flex;
            gap: 8px;
            .el-button {
                flex: 1;
            }
        }
    }

    @keyframes favorite-animation {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.3);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
