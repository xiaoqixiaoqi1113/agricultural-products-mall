<template>
    <div class="product-detail" v-loading="loading">
        <el-card v-if="product">
            <div class="product-content">
                <!-- 商品图片展示 -->
                <div class="product-gallery">
                    <img style="width: 100%; height: 100%" :src="product.image" mode="scaleToFill" />
                </div>

                <!-- 商品信息 -->
                <div class="product-info">
                    <h1>{{ product.name }}</h1>
                    <div class="tags" v-if="product.tags && product.tags.length > 0">
                        <el-tag v-for="tag in product.tags" :key="tag" size="small" effect="dark">{{ tag }}</el-tag>
                    </div>
                    <div class="price">¥{{ Number(product.price).toFixed(2) }}</div>
                    <div class="stock">库存: {{ product.stock || 0 }}</div>
                    <div class="description">{{ product.description }}</div>

                    <!-- 规格选择 -->
                    <div class="specifications" v-if="product.specifications && product.specifications.length > 0">
                        <h3>规格</h3>
                        <div class="spec-list">
                            <div v-for="spec in product.specifications" :key="spec.name" class="spec-item">
                                <span class="spec-name">{{ spec.name }}:</span>
                                <span class="spec-value">{{ spec.value }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 购买数量 -->
                    <div class="quantity">
                        <h3>数量</h3>
                        <el-input-number v-model="quantity" :min="1" :max="product.stock" />
                    </div>

                    <!-- 操作按钮 -->
                    <div class="actions">
                        <el-button type="primary" size="large" :icon="ShoppingCart" @click="handleAddToCart" :disabled="product.stock <= 0">加入购物车</el-button>
                        <el-button size="large" :icon="Star" :type="product.isFavorite ? 'danger' : ''" @click="handleToggleFavorite">
                            {{ product.isFavorite ? '取消收藏' : '收藏' }}
                        </el-button>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 评论区域 -->
        <el-card class="comment-section" style="margin-top: 20px">
            <template #header>
                <div class="comment-header">
                    <span>商品评论</span>
                    <el-button type="primary" @click="showCommentForm = true" v-if="checkLogin()">写评论</el-button>
                </div>
            </template>

            <!-- 评论列表 -->
            <div v-loading="commentsLoading">
                <div v-if="comments.length === 0" class="no-comments">暂无评论</div>
                <div v-else class="comment-list">
                    <div v-for="comment in comments" :key="comment.id" class="comment-item">
                        <div class="comment-user">
                            <span class="username">{{ comment.username }}</span>
                            <el-rate v-model="comment.rating" disabled show-score />
                        </div>
                        <div class="comment-content">{{ comment.content }}</div>
                        <div class="comment-time">{{ new Date(comment.createTime).toLocaleString() }}</div>
                    </div>
                </div>
                <!-- 评论分页 -->
                <div class="comment-pagination" v-if="total > pageSize">
                    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="currentPage" @current-change="loadComments" />
                </div>
            </div>
        </el-card>

        <!-- 评论表单对话框 -->
        <el-dialog v-model="showCommentForm" title="写评论" width="500px">
            <el-form :model="commentForm" ref="commentFormRef" :rules="commentRules" label-width="80px">
                <el-form-item label="评分" prop="rating">
                    <el-rate v-model="commentForm.rating" show-score />
                </el-form-item>
                <el-form-item label="评论内容" prop="content">
                    <el-input v-model="commentForm.content" type="textarea" :rows="4" placeholder="请输入您的评论" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showCommentForm = false">取消</el-button>
                <el-button type="primary" @click="submitComment">提交评论</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { ShoppingCart, Star } from '@element-plus/icons-vue';
    import { getProductDetail } from '@/api/products';
    import { addToCart } from '@/api/cart';
    import { addFavorite, removeFavoriteByProductId } from '@/api/favorites';
    import { getComments, addComment } from '@/api/comments';

    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const product = ref(null);
    const quantity = ref(1);

    // 评论相关
    const comments = ref([]);
    const commentsLoading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const showCommentForm = ref(false);
    const commentFormRef = ref(null);

    const commentForm = reactive({
        rating: 5,
        content: '',
    });

    const commentRules = {
        rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
        content: [
            { required: true, message: '请输入评论内容', trigger: 'blur' },
            { min: 5, max: 200, message: '评论内容长度在 5 到 200 个字符', trigger: 'blur' },
        ],
    };

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

    // 加载商品详情
    const loadProductDetail = async () => {
        loading.value = true;
        try {
            const data = await getProductDetail(route.params.id);
            product.value = data;
        } catch (error) {
            console.error('获取商品详情失败:', error);
            ElMessage.error('获取商品详情失败');
        } finally {
            loading.value = false;
        }
    };

    // 添加到购物车
    const handleAddToCart = async () => {
        if (!checkLogin()) return;

        try {
            await addToCart({
                productId: product.value.id,
                quantity: quantity.value,
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
            if (product.value.isFavorite) {
                await removeFavoriteByProductId(product.value.id);
                product.value.isFavorite = false;
                ElMessage.success('已取消收藏');
            } else {
                await addFavorite({ productId: product.value.id });
                product.value.isFavorite = true;
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

    // 加载评论列表
    const loadComments = async () => {
        commentsLoading.value = true;
        try {
            const data = await getComments(route.params.id, {
                page: currentPage.value,
                pageSize: pageSize.value,
            });
            comments.value = data.items;
            total.value = data.total;
        } catch (error) {
            console.error('获取评论失败:', error);
            ElMessage.error('获取评论失败');
        } finally {
            commentsLoading.value = false;
        }
    };

    // 提交评论
    const submitComment = async () => {
        if (!commentFormRef.value) return;

        try {
            await commentFormRef.value.validate();
            await addComment(route.params.id, commentForm);
            ElMessage.success('评论成功');
            showCommentForm.value = false;
            commentForm.rating = 5;
            commentForm.content = '';
            await loadComments();
        } catch (error) {
            console.error('提交评论失败:', error);
            ElMessage.error(error.response?.data?.message || '提交评论失败');
        }
    };

    onMounted(() => {
        loadProductDetail();
        loadComments();
    });
</script>

<style scoped lang="scss">
    .product-detail {
        padding: 20px;
        background-color: #f5f7fa;
        min-height: 100vh;

        .product-content {
            display: flex;
            gap: 40px;

            .product-gallery {
                flex: 1;
                .el-image {
                    width: 100%;
                    height: 100%;
                }
            }

            .product-info {
                flex: 1;
                padding: 20px;

                h1 {
                    margin: 0 0 20px;
                    font-size: 24px;
                    font-weight: 500;
                }

                .tags {
                    margin-bottom: 20px;
                    .el-tag {
                        margin-right: 8px;
                    }
                }

                .price {
                    font-size: 28px;
                    color: #f56c6c;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .stock {
                    color: #909399;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .description {
                    color: #606266;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }

                .specifications {
                    margin-bottom: 30px;

                    h3 {
                        margin: 0 0 10px;
                        font-size: 16px;
                    }

                    .spec-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;

                        .spec-item {
                            background: #f5f7fa;
                            padding: 8px 12px;
                            border-radius: 4px;

                            .spec-name {
                                color: #909399;
                                margin-right: 5px;
                            }

                            .spec-value {
                                color: #606266;
                            }
                        }
                    }
                }

                .quantity {
                    margin-bottom: 30px;

                    h3 {
                        margin: 0 0 10px;
                        font-size: 16px;
                    }
                }

                .actions {
                    display: flex;
                    gap: 16px;

                    .el-button {
                        flex: 1;
                    }
                }
            }
        }
    }

    .comment-section {
        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .no-comments {
            text-align: center;
            color: #909399;
            padding: 40px 0;
        }

        .comment-list {
            .comment-item {
                padding: 16px 0;
                border-bottom: 1px solid #ebeef5;

                &:last-child {
                    border-bottom: none;
                }

                .comment-user {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;

                    .username {
                        font-weight: 500;
                        margin-right: 16px;
                    }
                }

                .comment-content {
                    color: #303133;
                    line-height: 1.6;
                    margin: 8px 0;
                }

                .comment-time {
                    color: #909399;
                    font-size: 12px;
                }
            }
        }

        .comment-pagination {
            margin-top: 20px;
            text-align: center;
        }
    }
</style>
