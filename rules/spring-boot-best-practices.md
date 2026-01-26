# Spring Boot 最佳实践

Spring Boot 开发中必须遵守的最佳实践规范。

## 依赖注入

✅ **正确：构造函数注入**
```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

❌ **错误：字段注入**
```java
@Autowired
private UserMapper userMapper;
```

## 事务管理

- 🔹 在 service 方法上使用 @Transactional，不要在 controller 中使用
- 🔹 必须指定 `rollbackFor = Exception.class`
- 🔹 使用适当的传播级别
- 🔹 保持事务短小精悍

## 异常处理

- 全局使用 @ControllerAdvice 进行异常处理
- 自定义业务异常应继承 RuntimeException
- 返回适当的 HTTP 状态码
- 绝不向客户端暴露堆栈跟踪信息

## 配置管理

- 使用 @ConfigurationProperties 进行类型化配置
- 将配置外部化到 application.yml
- 为不同环境使用 profiles
- 绝不硬编码凭证信息

## REST 控制器

- 使用 @RestController，不要用 @Controller + @ResponseBody
- 使用 @PathVariable 用于资源 ID
- 使用 @RequestParam 用于查询参数
- 使用 @Valid 进行请求体验证

---

遵循 Spring Boot 最佳实践以确保代码质量和可维护性。
