# 农场商城前台 API 文档

## 基础说明

-   基础路径: `http://localhost:3000/api`
-   请求头: 需要认证的接口必须在请求头中携带 token
    ```
    Authorization: Bearer your_token_here
    ```
-   响应格式:
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {}
    }
    ```

## 分类相关接口

### 获取推荐分类

-   请求方式: GET
-   接口路径: `/categories/recommend`
-   响应数据:
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": "uuid",
                "value": "vegetables",
                "label": "蔬菜",
                "image": "http://example.com/vegetables.jpg",
                "products": [
                    {
                        "id": "uuid",
                        "name": "有机胡萝卜",
                        "price": 5.9,
                        "image": "http://example.com/carrot.jpg",
                        "sales": 100,
                        "tags": ["有机", "新鲜"],
                        "description": "新鲜采摘的有机胡萝卜"
                    }
                ]
            }
        ]
    }
    ```
-   说明：
    -   返回销量最高的 5 个分类
    -   每个分类包含该分类下销量最高的 3 个商品
    -   products 数组包含每个商品的基本信息

## 错误码说明

| 错误码 | 说明                |
| ------ | ------------------- |
| 200    | 成功                |
| 400    | 请求参数错误        |
| 401    | 未登录或 token 失效 |
| 403    | 无权限访问          |
| 404    | 资源不存在          |
| 500    | 服务器错误          |

## 错误响应示例

```json
{
    "code": 500,
    "message": "服务器错误"
}
```
