# 09-API设计规范

## 概述

RESTful API设计规范确保接口的一致性、易用性和可维护性。

## URL设计

### 资源命名

```
# ✅ 使用名词复数
GET    /users              # 获取用户列表
GET    /users/{id}         # 获取单个用户
POST   /users              # 创建用户
PUT    /users/{id}         # 更新用户
DELETE /users/{id}         # 删除用户

# ✅ 嵌套资源
GET    /users/{id}/orders  # 获取用户的订单列表
POST   /users/{id}/orders  # 为用户创建订单

# ❌ 避免使用动词
GET    /getUsers
POST   /createUser
POST   /deleteUser
```

### URL规范

```
# ✅ 使用小写字母和连字符
/api/user-roles
/api/order-items

# ❌ 避免大写和下划线
/api/userRoles
/api/order_items

# ✅ 使用查询参数过滤
GET /users?status=active&role=admin

# ✅ 分页参数
GET /users?pageNo=1&pageSize=10
```

## HTTP方法

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 全量更新 | 是 | 否 |
| PATCH | 部分更新 | 是 | 否 |
| DELETE | 删除资源 | 是 | 否 |

## 请求规范

### 请求体格式

```java
// ✅ 创建命令对象
@Data
public class UserCreateCmd {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度2-50字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码长度8-20字符")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String mobile;
}

// ✅ 更新命令对象
@Data
public class UserUpdateCmd {

    @NotNull(message = "ID不能为空")
    private Long id;

    @Size(min = 2, max = 50, message = "用户名长度2-50字符")
    private String username;

    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

### 分页查询对象

```java
@Data
public class UserPageQuery extends PageParam {

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "创建开始时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime beginTime;

    @Schema(description = "创建结束时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
}

@Data
public class PageParam {

    @Schema(description = "页码", defaultValue = "1")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNo = 1;

    @Schema(description = "每页条数", defaultValue = "10")
    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 100, message = "每页条数最大为100")
    private Integer pageSize = 10;
}
```

## 响应规范

### 统一响应格式

```java
@Data
public class CommonResult<T> {

    @Schema(description = "状态码，0表示成功")
    private Integer code;

    @Schema(description = "提示信息")
    private String message;

    @Schema(description = "返回数据")
    private T data;

    public static <T> CommonResult<T> success(T data) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(0);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> CommonResult<T> error(Integer code, String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

### 分页响应格式

```java
@Data
public class PageResult<T> {

    @Schema(description = "数据列表")
    private List<T> list;

    @Schema(description = "总条数")
    private Long total;

    @Schema(description = "总页数")
    private Long pages;

    public PageResult(List<T> list, Long total) {
        this.list = list;
        this.total = total;
    }
}
```

### 响应示例

```json
// 成功响应
{
    "code": 0,
    "message": "success",
    "data": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com"
    }
}

// 分页响应
{
    "code": 0,
    "message": "success",
    "data": {
        "list": [
            {"id": 1, "username": "admin"},
            {"id": 2, "username": "user"}
        ],
        "total": 100
    }
}

// 错误响应
{
    "code": 400,
    "message": "用户名不能为空",
    "data": null
}
```

## 错误码设计

### 错误码分类

| 范围 | 类型 | 说明 |
|------|------|------|
| 0 | 成功 | 操作成功 |
| 400-499 | 客户端错误 | 参数错误、权限不足等 |
| 500-599 | 服务端错误 | 系统异常 |
| 1000-1999 | 业务错误 | 业务逻辑错误 |

### 常用错误码

```java
public interface ErrorCode {

    // 成功
    int SUCCESS = 0;

    // 客户端错误
    int BAD_REQUEST = 400;
    int UNAUTHORIZED = 401;
    int FORBIDDEN = 403;
    int NOT_FOUND = 404;

    // 服务端错误
    int INTERNAL_ERROR = 500;

    // 业务错误
    int USER_NOT_FOUND = 1001;
    int USER_DISABLED = 1002;
    int USERNAME_DUPLICATE = 1003;
    int PASSWORD_ERROR = 1004;
}
```

## 接口版本

### URL版本控制

```
# ✅ 推荐：URL路径版本
/api/v1/users
/api/v2/users

# 也可以：Header版本
Accept: application/vnd.lcyf.v1+json
```

## 安全规范

### 认证

```java
// ✅ 使用Bearer Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Controller中获取当前用户
Long userId = SecurityUtils.getCurrentUserId();
```

### 权限控制

```java
@PreAuthorize("@ss.hasPermission('system:user:create')")
@PostMapping
public CommonResult<Long> create(@RequestBody UserCreateCmd cmd) {
    return success(userService.create(cmd));
}
```

### 敏感数据脱敏

```java
// ✅ 响应脱敏
@Data
public class UserDTO {
    private Long id;
    private String username;

    @JsonSerialize(using = MobileSerializer.class)
    private String mobile;  // 输出: 138****1234

    @JsonSerialize(using = EmailSerializer.class)
    private String email;   // 输出: a***@example.com
}
```

## 接口文档

### Swagger注解

```java
@Tag(name = "用户管理", description = "用户增删改查接口")
@RestController
@RequestMapping("/system/user")
public class UserController {

    @Operation(summary = "创建用户", description = "创建新用户，用户名不能重复")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "参数错误"),
        @ApiResponse(responseCode = "1003", description = "用户名已存在")
    })
    @PostMapping
    public CommonResult<Long> create(
            @Parameter(description = "用户信息", required = true)
            @Valid @RequestBody UserCreateCmd cmd) {
        return success(userService.create(cmd));
    }
}
```

## 关联Agent

- 03-Java开发专家.md：API实现
- 05-代码审查专家.md：API审查
