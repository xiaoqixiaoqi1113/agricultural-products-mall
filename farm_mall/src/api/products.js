import request from '@/utils/request';

export const getProducts = (params) => {
    return request.get('/products', { params });
};

export const getProductDetail = (id) => {
    return request.get(`/products/${id}`);
};

export const getCategories = () => {
    return request.get('/categories');
};

export const getRecommendCategories = () => {
    return request.get('/categories/recommend');
};

export const searchProducts = (params) => {
    return request.get('/products/search', { params });
};
