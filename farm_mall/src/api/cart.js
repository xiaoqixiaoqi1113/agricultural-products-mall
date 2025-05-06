import request from '@/utils/request';

// 添加商品到购物车
export function addToCart(data) {
    return request({
        url: '/cart',
        method: 'post',
        data,
    });
}

// 获取购物车列表
export function getCartList() {
    return request({
        url: '/cart',
        method: 'get',
    });
}

// 更新购物车商品数量
export function updateCartItem(id, data) {
    return request({
        url: `/cart/${id}`,
        method: 'put',
        data,
    });
}

// 删除购物车商品
export function removeCartItem(id) {
    return request({
        url: `/cart/${id}`,
        method: 'delete',
    });
}

// 清空购物车
export function clearCart() {
    return request({
        url: '/cart/clear',
        method: 'delete',
    });
}
