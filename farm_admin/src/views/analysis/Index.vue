<template>
    <div class="analysis-container">
        <!-- 顶部数据卡片 -->
        <a-row :gutter="[16, 16]">
            <a-col :span="8">
                <a-card>
                    <template #title>
                        <span>总销售额</span>
                        <a-tooltip title="指标说明">
                            <question-circle-outlined />
                        </a-tooltip>
                    </template>
                    <div class="card-content">
                        <div class="main-value">¥ {{ statistics.totalSales?.toFixed(2) || '0.00' }}</div>
                    </div>
                    <template #extra>
                        <a-divider style="margin: 8px 0" />
                        <span>日销售额 ¥{{ statistics.todaySales?.toFixed(2) || '0.00' }}</span>
                    </template>
                </a-card>
            </a-col>

            <a-col :span="8">
                <a-card>
                    <template #title>
                        <span>订单量</span>
                        <a-tooltip title="指标说明">
                            <question-circle-outlined />
                        </a-tooltip>
                    </template>
                    <div class="card-content">
                        <div class="main-value">{{ statistics.totalOrders || 0 }}</div>
                    </div>
                    <template #extra>
                        <a-divider style="margin: 8px 0" />
                        <span>日订单量 {{ statistics.todayOrders || 0 }}</span>
                    </template>
                </a-card>
            </a-col>

            <a-col :span="8">
                <a-card>
                    <template #title>
                        <span>新增用户</span>
                        <a-tooltip title="指标说明">
                            <question-circle-outlined />
                        </a-tooltip>
                    </template>
                    <div class="card-content">
                        <div class="main-value">{{ statistics.totalUsers || 0 }}</div>
                    </div>
                    <template #extra>
                        <a-divider style="margin: 8px 0" />
                        <span>日新增 {{ statistics.todayUsers || 0 }}</span>
                    </template>
                </a-card>
            </a-col>
        </a-row>

        <!-- 销售趋势图表 -->
        <a-card style="margin-top: 16px">
            <template #title>今日销售趋势</template>
            <div ref="saleChartRef" style="height: 400px"></div>
        </a-card>

        <!-- 热销商品 -->
        <a-card style="margin-top: 16px" title="热销商品TOP10">
            <a-table :columns="hotProductColumns" :data-source="hotProductData" :pagination="false">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'index'">
                        <a-tag :color="record.index <= 3 ? 'red' : 'default'">{{ record.index }}</a-tag>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import { QuestionCircleOutlined } from '@ant-design/icons-vue';
    import * as echarts from 'echarts';
    import { message } from 'ant-design-vue';
    import axios from 'axios';

    const BASE_URL = 'http://localhost:3000/api/admin';
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const saleChartRef = ref(null);
    let saleChart = null;

    // 统计数据
    const statistics = ref({
        totalSales: 0,
        todaySales: 0,
        totalOrders: 0,
        todayOrders: 0,
        totalUsers: 0,
        todayUsers: 0,
    });

    // 热销商品数据
    const hotProductData = ref([]);

    // 热销商品表格配置
    const hotProductColumns = [
        {
            title: '排名',
            dataIndex: 'index',
            key: 'index',
            width: 80,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '销量',
            dataIndex: 'sales',
            key: 'sales',
            width: 120,
        },
        {
            title: '销售额',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
        },
    ];

    // 加载统计数据
    const loadStatistics = async () => {
        try {
            const { data: res } = await axios.get(`${BASE_URL}/analysis/statistics`, { headers });
            if (res.code === 200) {
                statistics.value = res.data;
            } else {
                message.error(res.message || '获取统计数据失败');
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            message.error('获取统计数据失败');
        }
    };

    // 加载热销商品数据
    const loadHotProducts = async () => {
        try {
            const { data: res } = await axios.get(`${BASE_URL}/analysis/hot-products`, { headers });
            if (res.code === 200) {
                hotProductData.value = res.data;
            } else {
                message.error(res.message || '获取热销商品失败');
            }
        } catch (error) {
            console.error('获取热销商品失败:', error);
            message.error('获取热销商品失败');
        }
    };

    // 初始化销售趋势图表
    const initSaleChart = async () => {
        if (!saleChartRef.value) return;

        try {
            const { data: res } = await axios.get(`${BASE_URL}/analysis/sales-trend`, { headers });
            if (res.code !== 200) {
                message.error(res.message || '获取销售趋势失败');
                return;
            }

            saleChart = echarts.init(saleChartRef.value);
            const option = {
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    data: ['销售额', '订单量'],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: res.data.map((item) => item.time),
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '销售额',
                        axisLabel: {
                            formatter: '{value} 元',
                        },
                    },
                    {
                        type: 'value',
                        name: '订单量',
                        axisLabel: {
                            formatter: '{value} 单',
                        },
                    },
                ],
                series: [
                    {
                        name: '销售额',
                        type: 'line',
                        smooth: true,
                        data: res.data.map((item) => item.sales),
                    },
                    {
                        name: '订单量',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 1,
                        data: res.data.map((item) => item.orders),
                    },
                ],
            };
            saleChart.setOption(option);
        } catch (error) {
            console.error('获取销售趋势失败:', error);
            message.error('获取销售趋势失败');
        }
    };

    // 监听窗口大小变化，重绘图表
    const handleResize = () => {
        saleChart?.resize();
    };

    onMounted(async () => {
        await Promise.all([loadStatistics(), loadHotProducts(), initSaleChart()]);
        window.addEventListener('resize', handleResize);
    });

    // 组件卸载时移除事件监听
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        saleChart?.dispose();
    });
</script>

<style scoped lang="scss">
    .analysis-container {
        padding: 24px;
        background-color: #f0f2f5;

        :deep(.ant-card) {
            height: 100%;
        }

        .card-content {
            .main-value {
                font-size: 24px;
                font-weight: 500;
                margin: 16px 0;
            }
        }
    }
</style>
