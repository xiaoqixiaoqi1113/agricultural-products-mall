import request from '@/utils/request';

// 获取订单列表
export function getOrders(params) {
    return request({
        url: '/orders',
        method: 'get',
        params,
    });
}

// 创建订单
export function createOrder(data) {
    return request({
        url: '/orders',
        method: 'post',
        data,
    });
}

// 取消订单
export function cancelOrder(id) {
    return request({
        url: `/orders/${id}/cancel`,
        method: 'post',
    });
}

// 确认收货
export function confirmOrder(id) {
    return request({
        url: `/orders/${id}/confirm`,
        method: 'post',
    });
}

// 删除订单
export function deleteOrder(id) {
    return request({
        url: `/orders/${id}`,
        method: 'delete',
    });
}

// 支付订单
export function payOrder(id) {
    return request({
        url: `/orders/${id}/pay`,
        method: 'post',
    });
}

// 获取订单详情
export function getOrderDetail(orderId) {
    return request({
        url: `/orders/${orderId}`,
        method: 'get',
    });
}
