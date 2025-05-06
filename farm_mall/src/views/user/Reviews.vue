<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>我的评价</span>
            </div>
        </template>
        <el-tabs>
            <el-tab-pane label="待评价">
                <el-card v-for="n in 3" :key="n" class="review-card">
                    <div class="product-info">
                        <el-image style="width: 100px; height: 100px" src="https://via.placeholder.com/100" />
                        <div class="product-detail">
                            <h4>农产品名称</h4>
                            <p class="order-info">订单号：123456789</p>
                        </div>
                    </div>
                    <el-form>
                        <el-form-item label="评分">
                            <el-rate />
                        </el-form-item>
                        <el-form-item label="评价内容">
                            <el-input type="textarea" rows="3" placeholder="请输入您的评价" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary">提交评价</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-tab-pane>
            <el-tab-pane label="已评价">
                <el-card v-for="n in 2" :key="n" class="review-card">
                    <div class="product-info">
                        <el-image style="width: 100px; height: 100px" src="https://via.placeholder.com/100" />
                        <div class="product-detail">
                            <h4>农产品名称</h4>
                            <p class="order-info">订单号：123456789</p>
                            <el-rate :model-value="5" disabled />
                            <p class="review-content">商品很好，新鲜美味，包装完整，物流快速！</p>
                        </div>
                    </div>
                </el-card>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script setup></script>

<style scoped lang="scss">
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .review-card {
        margin-bottom: 20px;
    }

    .product-info {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .product-detail {
        flex-grow: 1;
        h4 {
            margin: 0 0 10px 0;
        }
    }

    .order-info {
        color: #999;
        margin: 5px 0;
    }

    .review-content {
        margin: 10px 0;
        color: #666;
    }
</style>
