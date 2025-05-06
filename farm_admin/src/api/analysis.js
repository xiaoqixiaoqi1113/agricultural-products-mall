import request from '@/utils/request';

// 获取统计数据
export function getStatistics() {
    return request({
        url: '/admin/analysis/statistics',
        method: 'get',
    });
}

// 获取销售趋势
export function getSalesTrend() {
    return request({
        url: '/admin/analysis/sales-trend',
        method: 'get',
    });
}

// 获取热销商品
export function getHotProducts() {
    return request({
        url: '/admin/analysis/hot-products',
        method: 'get',
    });
}
