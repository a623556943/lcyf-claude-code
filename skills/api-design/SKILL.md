# API 设计技能

---
name: api-design
description: lcyf 项目的 RESTful API 设计模式和文档标准
version: 1.0.0
---

## 概览

RESTful API 设计指导包括：
- RESTful 原则和规范
- 统一的响应结构
- OpenAPI/Swagger 文档
- 版本控制策略

## 核心模式

### 1. RESTful URL 设计
```
GET    /api/v1/users              # 列表查询
POST   /api/v1/users              # 创建资源
GET    /api/v1/users/{id}         # 获取单个资源
PUT    /api/v1/users/{id}         # 替换资源
PATCH  /api/v1/users/{id}         # 更新资源
DELETE /api/v1/users/{id}         # 删除资源
```

### 2. 统一响应结构
```java
public class Result<T> {
    private Boolean success;
    private T data;
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
}

// 成功响应
Result.ok(data);

// 错误响应
Result.error("USER_NOT_FOUND", "用户未找到");
```

### 3. 输入验证
```java
public class CreateUserDTO {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Email
    private String email;
}

@PostMapping
public Result create(@Valid @RequestBody CreateUserDTO dto) {
    // 实现
}
```

### 4. OpenAPI 文档
```java
@Operation(summary = "创建用户")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "用户已创建"),
    @ApiResponse(responseCode = "400", description = "输入错误")
})
@PostMapping
public Result<UserVO> createUser(@Valid @RequestBody CreateUserDTO dto) {
    // 实现
}
```

## 相关资源
- api-designer agent
- api-design-rules
- OpenAPI 规范
