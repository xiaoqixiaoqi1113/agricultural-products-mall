import request from '@/utils/request';

// 添加收藏
export function addFavorite(data) {
    return request({
        url: '/favorites',
        method: 'post',
        data,
    });
}

// 获取收藏列表
export function getFavorites() {
    return request({
        url: '/favorites',
        method: 'get',
    });
}

// 删除收藏（通过收藏记录ID）
export function removeFavorite(id) {
    return request({
        url: `/favorites/${id}`,
        method: 'delete',
    });
}

// 删除收藏（通过商品ID）
export function removeFavoriteByProductId(productId) {
    return request({
        url: `/favorites/product/${productId}`,
        method: 'delete',
    });
}

// 检查是否已收藏
export function checkFavorite(id) {
    return request({
        url: `/favorites/${id}/check`,
        method: 'get',
    });
}
