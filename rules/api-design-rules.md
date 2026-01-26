# API 设计规范

lcyf 项目中必须遵守的 RESTful API 设计规范。

## RESTful 原则

- 使用名词表示资源，不使用动词
- 使用复数名词：`/users`、`/orders`
- 正确使用 HTTP 方法：
  - GET：查询
  - POST：创建
  - PUT：替换
  - PATCH：修改
  - DELETE：删除

## URL 结构

✅ **正确的设计**
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

❌ **错误的设计**
```
GET /api/v1/getAllUsers
POST /api/v1/createUser
POST /api/v1/deleteUser/{id}
```

## 响应结构

必须使用统一的 Result 包装器：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

## HTTP 状态码

- **200**: 成功（GET、PUT、PATCH）
- **201**: 已创建（POST）
- **204**: 无内容（DELETE）
- **400**: 请求错误
- **401**: 未授权
- **403**: 禁止访问
- **404**: 未找到
- **500**: 服务器内部错误

## 输入验证

- 使用 Bean Validation 注解
- 验证所有公共端点
- 返回清晰的错误消息

## API 版本控制

- 必须对 API 进行版本管理：`/api/v1/...`
- 在 URL 中使用主版本号
- 记录破坏性变更

## 文档

- 使用 OpenAPI/Swagger 注解
- 记录所有端点
- 提供请求/响应示例
- 记录错误响应

---

遵循 RESTful API 设计规范确保 API 的一致性和易用性。
