# 农场商城后台管理系统 API 文档

## 基础说明

-   基础路径: `http://localhost:3000/api/admin`
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

## 权限说明

系统中有两种角色:

1. 管理员(admin): 拥有所有权限
2. 商户(merchant): 拥有商品管理等特定权限

管理员拥有商户的所有权限，可以执行所有商户可以执行的操作。

## 认证相关接口

### 1. 登录

-   请求路径：`/auth/login`
-   请求方法：POST
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明   |
    | -------- | ------ | -------- | ------ |
    | username | string | 是       | 用户名 |
    | password | string | 是       | 密码   |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "登录成功",
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "uuid",
                "username": "admin",
                "role": "admin",
                "email": "admin@example.com",
                "phone": "13800138000"
            }
        }
    }
    ```

### 2. 注册

-   请求路径：`/auth/register`
-   请求方法：POST
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明                     |
    | -------- | ------ | -------- | ------------------------ |
    | username | string | 是       | 用户名                   |
    | password | string | 是       | 密码                     |
    | role     | string | 是       | 角色类型(admin/merchant) |
    | email    | string | 否       | 邮箱                     |
    | phone    | string | 否       | 手机号                   |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "注册成功"
    }
    ```

### 3. 获取当前用户信息

-   请求路径：`/auth/profile`
-   请求方法：GET
-   请求头：需要携带 token
-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "id": "uuid",
            "username": "admin",
            "role": "admin",
            "status": "active",
            "email": "admin@example.com",
            "phone": "13800138000",
            "lastLoginTime": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 4. 修改密码

-   请求路径：`/auth/change-password`
-   请求方法：POST
-   请求头：需要携带 token
-   请求参数：

    | 参数名      | 类型   | 是否必须 | 说明   |
    | ----------- | ------ | -------- | ------ |
    | oldPassword | string | 是       | 原密码 |
    | newPassword | string | 是       | 新密码 |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "密码修改成功"
    }
    ```

### 5. 退出登录

-   请求路径：`/auth/logout`
-   请求方法：POST
-   请求头：需要携带 token
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "退出成功"
    }
    ```

## 用户管理接口

### 1. 获取管理员列表

-   请求路径：`/users`
-   请求方法：GET
-   权限：仅管理员
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明                           |
    | -------- | ------ | -------- | ------------------------------ |
    | page     | number | 否       | 页码，默认 1                   |
    | pageSize | number | 否       | 每页条数，默认 10              |
    | search   | string | 否       | 搜索关键词(用户名/邮箱/手机号) |
    | role     | string | 否       | 角色筛选(admin/merchant)       |
    | status   | string | 否       | 状态筛选(active/disabled)      |

-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "total": 100,
            "items": [
                {
                    "id": "uuid",
                    "username": "admin",
                    "role": "admin",
                    "status": "active",
                    "email": "admin@example.com",
                    "phone": "13800138000",
                    "lastLoginTime": "2024-01-03T12:00:00.000Z",
                    "createdAt": "2024-01-03T12:00:00.000Z",
                    "updatedAt": "2024-01-03T12:00:00.000Z"
                }
            ]
        }
    }
    ```

### 2. 创建管理员

-   请求路径：`/users`
-   请求方法：POST
-   权限：仅管理员
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明                     |
    | -------- | ------ | -------- | ------------------------ |
    | username | string | 是       | 用户名                   |
    | password | string | 是       | 密码                     |
    | role     | string | 是       | 角色类型(admin/merchant) |
    | email    | string | 否       | 邮箱                     |
    | phone    | string | 否       | 手机号                   |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "创建成功",
        "data": {
            "id": "uuid",
            "username": "merchant1",
            "role": "merchant",
            "status": "active",
            "email": "merchant@example.com",
            "phone": "13800138000",
            "lastLoginTime": null,
            "createdAt": "2024-01-03T12:00:00.000Z",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 3. 更新管理员信息

-   请求路径：`/users/:id`
-   请求方法：PUT
-   权限：仅管理员
-   请求参数：

    | 参数名 | 类型   | 是否必须 | 说明                      |
    | ------ | ------ | -------- | ------------------------- |
    | email  | string | 否       | 邮箱                      |
    | phone  | string | 否       | 手机号                    |
    | role   | string | 否       | 角色类型(admin/merchant)  |
    | status | string | 否       | 账号状态(active/disabled) |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "更新成功",
        "data": {
            "id": "uuid",
            "username": "merchant1",
            "role": "merchant",
            "status": "active",
            "email": "new_email@example.com",
            "phone": "13800138001"
        }
    }
    ```

### 4. 重置管理员密码

-   请求路径：`/users/:id/reset-password`
-   请求方法：POST
-   权限：仅管理员
-   请求参数：

    | 参数名      | 类型   | 是否必须 | 说明   |
    | ----------- | ------ | -------- | ------ |
    | newPassword | string | 是       | 新密码 |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "密码重置成功"
    }
    ```

### 5. 删除管理员

-   请求路径：`/users/:id`
-   请求方法：DELETE
-   权限：仅管理员
-   请求参数：无
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "删除成功"
    }
    ```

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

1. 参数错误

```json
{
    "code": 400,
    "message": "用户名已存在"
}
```

2. 认证失败

```json
{
    "code": 401,
    "message": "未登录"
}
```

3. 权限不足

```json
{
    "code": 403,
    "message": "需要管理员权限"
}
```

4. 资源不存在

```json
{
    "code": 404,
    "message": "用户不存在"
}
```

5. 服务器错误

```json
{
    "code": 500,
    "message": "服务器错误"
}
```

## 商品管理接口

### 1. 获取商品列表

-   请求路径：`/products`
-   请求方法：GET
-   权限：管理员/商户
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明                    |
    | -------- | ------ | -------- | ----------------------- |
    | page     | number | 否       | 页码，默认 1            |
    | pageSize | number | 否       | 每页条数，默认 10       |
    | search   | string | 否       | 搜索关键词(商品名/描述) |
    | category | string | 否       | 分类 ID                 |

-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "total": 100,
            "items": [
                {
                    "id": "uuid",
                    "name": "有机蔬菜",
                    "price": 9.9,
                    "description": "新鲜有机蔬菜",
                    "image": "http://example.com/image.jpg",
                    "images": ["http://example.com/image1.jpg"],
                    "sales": 0,
                    "tags": ["有机", "新鲜"],
                    "specifications": [
                        {
                            "name": "重量",
                            "value": "500g"
                        }
                    ],
                    "category": {
                        "id": "uuid",
                        "value": "vegetables",
                        "label": "蔬菜"
                    },
                    "createdAt": "2024-01-03T12:00:00.000Z",
                    "updatedAt": "2024-01-03T12:00:00.000Z"
                }
            ]
        }
    }
    ```

### 2. 获取商品详情

-   请求路径：`/products/:id`
-   请求方法：GET
-   权限：管理员/商户
-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "id": "uuid",
            "name": "有机蔬菜",
            "price": 9.9,
            "description": "新鲜有机蔬菜",
            "image": "http://example.com/image.jpg",
            "images": ["http://example.com/image1.jpg"],
            "sales": 0,
            "tags": ["有机", "新鲜"],
            "specifications": [
                {
                    "name": "重量",
                    "value": "500g"
                }
            ],
            "category": {
                "id": "uuid",
                "value": "vegetables",
                "label": "蔬菜"
            },
            "createdAt": "2024-01-03T12:00:00.000Z",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 3. 创建商品

-   请求路径：`/products`
-   请求方法：POST
-   权限：管理员/商户
-   请求参数：

    | 参数名         | 类型     | 是否必须 | 说明         |
    | -------------- | -------- | -------- | ------------ |
    | name           | string   | 是       | 商品名称     |
    | price          | number   | 是       | 商品价格     |
    | description    | string   | 是       | 商品描述     |
    | image          | string   | 是       | 商品主图     |
    | images         | string[] | 否       | 商品图片列表 |
    | categoryId     | string   | 是       | 分类 ID      |
    | tags           | string[] | 否       | 商品标签     |
    | specifications | object[] | 否       | 商品规格     |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "创建成功",
        "data": {
            "id": "uuid",
            "name": "有机蔬菜",
            "price": 9.9,
            "description": "新鲜有机蔬菜",
            "image": "http://example.com/image.jpg",
            "images": ["http://example.com/image1.jpg"],
            "sales": 0,
            "tags": ["有机", "新鲜"],
            "specifications": [
                {
                    "name": "重量",
                    "value": "500g"
                }
            ],
            "categoryId": "uuid",
            "createdAt": "2024-01-03T12:00:00.000Z",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 4. 更新商品

-   请求路径：`/products/:id`
-   请求方法：PUT
-   权限：管理员/商户
-   请求参数：

    | 参数名         | 类型     | 是否必须 | 说明         |
    | -------------- | -------- | -------- | ------------ |
    | name           | string   | 否       | 商品名称     |
    | price          | number   | 否       | 商品价格     |
    | description    | string   | 否       | 商品描述     |
    | image          | string   | 否       | 商品主图     |
    | images         | string[] | 否       | 商品图片列表 |
    | categoryId     | string   | 否       | 分类 ID      |
    | tags           | string[] | 否       | 商品标签     |
    | specifications | object[] | 否       | 商品规格     |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "更新成功",
        "data": {
            "id": "uuid",
            "name": "有机蔬菜",
            "price": 9.9,
            "description": "新鲜有机蔬菜",
            "image": "http://example.com/image.jpg",
            "images": ["http://example.com/image1.jpg"],
            "sales": 0,
            "tags": ["有机", "新鲜"],
            "specifications": [
                {
                    "name": "重量",
                    "value": "500g"
                }
            ],
            "categoryId": "uuid",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 5. 删除商品

-   请求路径：`/products/:id`
-   请求方法：DELETE
-   权限：管理员/商户
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "删除成功"
    }
    ```

### 6. 批量删除商品

-   请求路径：`/products/batch/delete`
-   请求方法：POST
-   权限：管理员/商户
-   请求参数：

    | 参数名 | 类型     | 是否必须 | 说明         |
    | ------ | -------- | -------- | ------------ |
    | ids    | string[] | 是       | 商品 ID 数组 |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "删除成功"
    }
    ```

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

1. 参数错误

```json
{
    "code": 400,
    "message": "分类不存在"
}
```

2. 认证失败

```json
{
    "code": 401,
    "message": "未登录"
}
```

3. 权限不足

```json
{
    "code": 403,
    "message": "需要商户权限"
}
```

4. 资源不存在

```json
{
    "code": 404,
    "message": "商品不存在"
}
```

5. 服务器错误

```json
{
    "code": 500,
    "message": "服务器错误"
}
```

## 分类管理接口

### 1. 获取分类列表

-   请求路径：`/categories`
-   请求方法：GET
-   权限：管理员/商户
-   响应示例：
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": "uuid",
                "value": "vegetables",
                "label": "蔬菜",
                "image": "http://example.com/vegetables.jpg",
                "count": 10
            },
            {
                "id": "uuid",
                "value": "fruits",
                "label": "水果",
                "image": "http://example.com/fruits.jpg",
                "count": 15
            }
        ]
    }
    ```

### 2. 创建分类

-   请求路径：`/categories`
-   请求方法：POST
-   权限：仅管理员
-   请求参数：

    | 参数名 | 类型   | 是否必须 | 说明                         |
    | ------ | ------ | -------- | ---------------------------- |
    | value  | string | 是       | 分类标识(英文，用于程序内部) |
    | label  | string | 是       | 分类名称(显示给用户)         |
    | image  | string | 是       | 分类图片                     |

-   响应示例：
    ```json
    {
        "code": 200,
        "message": "创建成功",
        "data": {
            "id": "uuid",
            "value": "vegetables",
            "label": "蔬菜",
            "image": "http://example.com/vegetables.jpg",
            "count": 0
        }
    }
    ```

### 3. 更新分类

-   请求路径：`/categories/:id`
-   请求方法：PUT
-   权限：仅管理员
-   请求参数：

    | 参数名 | 类型   | 是否必须 | 说明     |
    | ------ | ------ | -------- | -------- |
    | label  | string | 是       | 分类名称 |
    | image  | string | 是       | 分类图片 |

-   说明：不允许更新 value，因为它可能与其他数据关联
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "更新成功",
        "data": {
            "id": "uuid",
            "value": "vegetables",
            "label": "有机蔬菜",
            "image": "http://example.com/vegetables-new.jpg",
            "count": 10
        }
    }
    ```

### 4. 删除分类

-   请求路径：`/categories/:id`
-   请求方法：DELETE
-   权限：仅管理员
-   说明：只能删除没有关联商品的分类(count 为 0)
-   响应示例：

    ```json
    {
        "code": 200,
        "message": "删除成功"
    }
    ```

-   错误响应示例：
    ```json
    {
        "code": 400,
        "message": "该分类下还有商品，无法删除"
    }
    ```

## 订单管理接口

### 1. 获取订单列表

-   请求路径：`/orders`
-   请求方法：GET
-   权限：管理员/商户
-   请求参数：

    | 参数名   | 类型   | 是否必须 | 说明                             |
    | -------- | ------ | -------- | -------------------------------- |
    | page     | number | 否       | 页码，默认 1                     |
    | pageSize | number | 否       | 每页条数，默认 10                |
    | search   | string | 否       | 搜索关键词(订单号/用户名/手机号) |
    | status   | string | 否       | 订单状态筛选                     |

-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "total": 100,
            "items": [
                {
                    "id": "uuid",
                    "orderNumber": "202401030001",
                    "status": "pending",
                    "totalAmount": 99.9,
                    "user": {
                        "id": "uuid",
                        "username": "user1",
                        "phone": "13800138000"
                    },
                    "orderItems": [
                        {
                            "id": "uuid",
                            "quantity": 2,
                            "price": 49.95,
                            "product": {
                                "id": "uuid",
                                "name": "有机蔬菜",
                                "image": "http://example.com/image.jpg"
                            }
                        }
                    ],
                    "createdAt": "2024-01-03T12:00:00.000Z",
                    "updatedAt": "2024-01-03T12:00:00.000Z"
                }
            ]
        }
    }
    ```

### 2. 获取订单详情

-   请求路径：`/orders/:id`
-   请求方法：GET
-   权限：管理员/商户
-   响应示例：
    ```json
    {
        "code": 200,
        "data": {
            "id": "uuid",
            "orderNumber": "202401030001",
            "status": "pending",
            "totalAmount": 99.9,
            "user": {
                "id": "uuid",
                "username": "user1",
                "phone": "13800138000"
            },
            "orderItems": [
                {
                    "id": "uuid",
                    "quantity": 2,
                    "price": 49.95,
                    "product": {
                        "id": "uuid",
                        "name": "有机蔬菜",
                        "image": "http://example.com/image.jpg",
                        "price": 49.95
                    }
                }
            ],
            "createdAt": "2024-01-03T12:00:00.000Z",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 3. 更新订单状态

-   请求路径：`/orders/:id/status`
-   请求方法：PUT
-   权限：管理员/商户
-   请求参数：

    | 参数名 | 类型   | 是否必须 | 说明     |
    | ------ | ------ | -------- | -------- |
    | status | string | 是       | 订单状态 |

-   说明：status 可选值为 pending(待处理)、processing(处理中)、shipped(已发货)、delivered(已送达)、cancelled(已取消)
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "更新成功",
        "data": {
            "id": "uuid",
            "orderNumber": "202401030001",
            "status": "processing",
            "updatedAt": "2024-01-03T12:00:00.000Z"
        }
    }
    ```

### 4. 删除订单

-   请求路径：`/orders/:id`
-   请求方法：DELETE
-   权限：管理员/商户
-   响应示例：
    ```json
    {
        "code": 200,
        "message": "删除成功"
    }
    ```
