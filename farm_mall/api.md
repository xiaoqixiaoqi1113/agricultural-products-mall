# API 文档

## 用户认证相关

### 登录

-   请求方式: POST
-   接口路径: `/api/auth/login`
-   请求参数:
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```
-   响应数据:
    ```json
    {
        "code": 200,
        "data": {
            "token": "string",
            "username": "string"
        },
        "message": "登录成功"
    }
    ```

### 注册

-   请求方式: POST
-   接口路径: `/api/auth/register`
-   请求参数:
    ```json
    {
        "username": "string",
        "password": "string",
        "email": "string"
    }
    ```
-   响应数据:
    ```json
    {
        "code": 200,
        "message": "注册成功"
    }
    ```

## 商品相关

### 获取商品列表

-   请求方式: GET
-   接口路径: `/api/products`
-   请求参数:
    ```js
    {
      page: number,
      pageSize: number,
      category?: string,
      search?: string
    }
    ```
-   响应数据:
    ```json
    {
      "code": 200,
      "data": {
        "total": number,
        "items": [
          {
            "id": "string",
            "name": "string",
            "price": number,
            "image": "string",
            "sales": number,
            "tags": ["string"],
            "category": "string",
            "isFavorite": boolean
          }
        ]
      }
    }
    ```

### 获取商品详情

-   请求方式: GET
-   接口路径: `/api/products/:id`
-   响应数据:
    ```json
    {
      "code": 200,
      "data": {
        "id": "string",
        "name": "string",
        "price": number,
        "description": "string",
        "images": ["string"],
        "sales": number,
        "tags": ["string"],
        "category": "string",
        "isFavorite": boolean,
        "specifications": ["string"]
      }
    }
    ```

### 获取分类列表

-   请求方式: GET
-   接口路径: `/api/categories`
-   响应数据:
    ```json
    {
      "code": 200,
      "data": [
        {
          "value": "string",
          "label": "string",
          "count": number,
          "image": "string"
        }
      ]
    }
    ```

### 搜索商品

-   请求方式: GET
-   接口路径: `/api/products/search`
-   请求参数:
    ```js
    {
        keyword: string;
    }
    ```
-   响应数据:
    ```json
    {
      "code": 200,
      "data": [
        {
          "id": "string",
          "name": "string",
          "price": number,
          "image": "string"
        }
      ]
    }
    ```

### 获取推荐分类

-   请求方式: GET
-   接口路径: `/api/categories/recommend`
-   响应数据:
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": "string",
                "label": "string",
                "value": "string",
                "image": "string"
            }
        ]
    }
    ```

## 购物车相关

### 获取购物车列表

-   请求方式: GET
-   接口路径: `/api/cart`
-   响应数据:
    ```json
    {
      "code": 200,
      "data": [
        {
          "id": "string",
          "productId": "string",
          "name": "string",
          "price": number,
          "image": "string",
          "quantity": number,
          "selected": boolean
        }
      ]
    }
    ```

### 添加到购物车

-   请求方式: POST
-   接口路径: `/api/cart`
-   请求参数:
    ```json
    {
      "productId": "string",
      "quantity": number
    }
    ```

### 更新购物车商品数量

-   请求方式: PUT
-   接口路径: `/api/cart/:id`
-   请求参数:
    ```json
    {
      "quantity": number
    }
    ```

### 删除购物车商品

-   请求方式: DELETE
-   接口路径: `/api/cart/:id`

### 更新购物车商品选中状态

-   请求方式: PUT
-   接口路径: `/api/cart/selected`
-   请求参数:
    ```json
    {
      "ids": ["string"],
      "selected": boolean
    }
    ```

### 全选/取消全选购物车商品

-   请求方式: PUT
-   接口路径: `/api/cart/selected/all`
-   请求参数:
    ```json
    {
      "selected": boolean
    }
    ```

## 订单相关

### 获取订单列表

-   请求方式: GET
-   接口路径: `/api/orders`
-   请求参数:
    ```js
    {
      page: number,
      pageSize: number,
      status?: string
    }
    ```
-   响应数据:
    ```json
    {
      "code": 200,
      "data": {
        "total": number,
        "items": [
          {
            "id": "string",
            "orderNo": "string",
            "createTime": "string",
            "status": "string",
            "totalAmount": number,
            "products": [
              {
                "id": "string",
                "name": "string",
                "price": number,
                "image": "string",
                "quantity": number
              }
            ]
          }
        ]
      }
    }
    ```

### 创建订单

-   请求方式: POST
-   接口路径: `/api/orders`
-   请求参数:
    ```json
    {
      "products": [
        {
          "productId": "string",
          "quantity": number
        }
      ],
      "address": {
        "name": "string",
        "phone": "string",
        "province": "string",
        "city": "string",
        "district": "string",
        "detail": "string"
      }
    }
    ```

### 取消订单

-   请求方式: PUT
-   接口路径: `/api/orders/:id/cancel`

### 确认收货

-   请求方式: PUT
-   接口路径: `/api/orders/:id/confirm`

### 删除订单

-   请求方式: DELETE
-   接口路径: `/api/orders/:id`

## 收藏相关

### 获取收藏列表

-   请求方式: GET
-   接口路径: `/api/favorites`
-   请求参数:
    ```js
    {
      page: number,
      pageSize: number
    }
    ```
-   响应数据:
    ```json
    {
      "code": 200,
      "data": {
        "total": number,
        "items": [
          {
            "id": "string",
            "productId": "string",
            "name": "string",
            "price": number,
            "image": "string"
          }
        ]
      }
    }
    ```

### 添加收藏

-   请求方式: POST
-   接口路径: `/api/favorites`
-   请求参数:
    ```json
    {
        "productId": "string"
    }
    ```

### 取消收藏

-   请求方式: DELETE
-   接口路径: `/api/favorites/:id`

## 评论相关

### 获取商品评论

-   请求方式: GET
-   接口路径: `/api/products/:id/comments`
-   请求参数:
    ```js
    {
      page: number,
      pageSize: number
    }
    ```
-   响应数据:
    ```json
    {
      "code": 200,
      "data": {
        "total": number,
        "items": [
          {
            "id": "string",
            "username": "string",
            "userAvatar": "string",
            "rating": number,
            "content": "string",
            "createTime": "string"
          }
        ]
      }
    }
    ```

### 提交商品评论

-   请求方式: POST
-   接口路径: `/api/products/:id/comments`
-   请求参数:
    ```json
    {
      "rating": number,
      "content": "string"
    }
    ```

## 通用响应格式

```json
{
  "code": number,    // 状态码：200成功，其他表示失败
  "message": string, // 提示信息
  "data": any       // 响应数据
}
```
