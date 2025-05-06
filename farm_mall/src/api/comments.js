import request from '@/utils/request';

// 获取商品评论列表
export function getComments(productId, params) {
    return request({
        url: `/products/${productId}/comments`,
        method: 'get',
        params,
    });
}

// 添加商品评论
export function addComment(productId, data) {
    return request({
        url: `/products/${productId}/comments`,
        method: 'post',
        data,
    });
}
