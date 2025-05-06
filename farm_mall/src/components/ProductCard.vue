<template>
    <el-card class="product-card" :body-style="{ padding: '0px' }" @click="goToDetail">
        <div class="product-image">
            <el-image :src="product.image" fit="cover" />
        </div>
        <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-tags" v-if="product.tags && product.tags.length > 0">
                <el-tag v-for="tag in product.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
            <div class="product-price">¥{{ Number(product.price).toFixed(2) }}</div>
            <div class="product-actions">
                <el-button type="primary" :icon="ShoppingCart" circle @click.stop="handleAddToCart" />
                <el-button :icon="Star" :type="product.isFavorite ? 'danger' : ''" circle @click.stop="handleToggleFavorite" />
            </div>
        </div>
    </el-card>
</template>

<script setup>
    import { ShoppingCart, Star } from '@element-plus/icons-vue';
    import { useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { addToCart } from '@/api/cart';
    import { addFavorite, removeFavorite } from '@/api/favorites';

    const props = defineProps({
        product: {
            type: Object,
            required: true,
        },
    });

    const router = useRouter();

    // 检查登录状态
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

    // 跳转到商品详情页
    const goToDetail = () => {
        router.push(`/products/${props.product.id}`);
    };

    // 添加到购物车
    const handleAddToCart = async () => {
        if (!checkLogin()) return;

        try {
            await addToCart({
                productId: props.product.id,
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

    // 切换收藏状态
    const handleToggleFavorite = async () => {
        if (!checkLogin()) return;

        try {
            if (props.product.isFavorite) {
                await removeFavorite(props.product.id);
                props.product.isFavorite = false;
                ElMessage.success('已取消收藏');
            } else {
                await addFavorite({ productId: props.product.id });
                props.product.isFavorite = true;
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
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .product-image {
            height: 200px;
            overflow: hidden;

            .el-image {
                width: 100%;
                height: 100%;
                transition: transform 0.3s;

                &:hover {
                    transform: scale(1.05);
                }
            }
        }

        .product-info {
            padding: 14px;

            .product-name {
                margin: 0 0 10px;
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .product-tags {
                margin-bottom: 10px;
                .el-tag {
                    margin-right: 5px;
                    margin-bottom: 5px;
                }
            }

            .product-price {
                color: #f56c6c;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .product-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
        }
    }
</style>
