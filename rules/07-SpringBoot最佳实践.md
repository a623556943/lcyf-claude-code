# 07-SpringBoot最佳实践

## 概述

Spring Boot最佳实践确保应用的可维护性、性能和安全性。

## 依赖注入

### 构造器注入（推荐）

```java
// ✅ 推荐：构造器注入
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;
    private final CacheService cacheService;
    private final EventPublisher eventPublisher;
}

// 或显式构造器
@Service
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

### 字段注入（仅测试）

```java
// ⚠️ 仅在测试中使用
@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;
}
```

### @Resource vs @Autowired

```java
// ✅ 使用@Resource（Jakarta标准）
@Resource
private UserMapper userMapper;

// ✅ 使用@Autowired（Spring特有）
@Autowired
private UserMapper userMapper;

// 项目统一使用一种，推荐@Resource
```

## Controller层

### RESTful API

```java
@Tag(name = "用户管理")
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @Operation(summary = "分页查询用户")
    @GetMapping("/page")
    public CommonResult<PageResult<UserDTO>> page(@Valid UserPageQuery query) {
        return success(userService.page(query));
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public CommonResult<UserDTO> get(@PathVariable Long id) {
        return success(userService.getById(id));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    public CommonResult<Long> create(@Valid @RequestBody UserCreateCmd cmd) {
        return success(userService.create(cmd));
    }

    @Operation(summary = "更新用户")
    @PutMapping
    public CommonResult<Boolean> update(@Valid @RequestBody UserUpdateCmd cmd) {
        userService.update(cmd);
        return success(true);
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public CommonResult<Boolean> delete(@PathVariable Long id) {
        userService.delete(id);
        return success(true);
    }
}
```

### 统一返回格式

```java
@Data
public class CommonResult<T> {
    private Integer code;
    private String message;
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

## Service层

### 事务管理

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    // ✅ 方法级事务
    @Transactional(rollbackFor = Exception.class)
    public Long create(OrderCreateCmd cmd) {
        // 创建订单
        Order order = buildOrder(cmd);
        orderMapper.insert(order);

        // 创建订单项
        List<OrderItem> items = buildOrderItems(cmd, order.getId());
        orderItemMapper.insertBatch(items);

        return order.getId();
    }

    // ✅ 只读事务
    @Transactional(readOnly = true)
    public OrderDTO getById(Long id) {
        return orderMapper.selectById(id);
    }

    // ❌ 避免事务内捕获异常
    @Transactional
    public void process() {
        try {
            // 操作
        } catch (Exception e) {
            log.error("错误", e);
            // 事务不会回滚！
        }
    }

    // ✅ 正确处理
    @Transactional(rollbackFor = Exception.class)
    public void process() {
        // 操作，异常自动回滚
    }
}
```

### 业务验证

```java
// ✅ 使用断言工具
public void update(UserUpdateCmd cmd) {
    User user = userMapper.selectById(cmd.getId());
    Assert.notNull(user, "用户不存在");

    // 业务校验
    if (!user.getStatus().equals(UserStatus.ACTIVE)) {
        throw new BusinessException("只能修改激活状态的用户");
    }

    // 更新
    BeanUtils.copyProperties(cmd, user);
    userMapper.updateById(user);
}
```

## 配置管理

### 配置文件

```yaml
# application.yml - 公共配置
spring:
  application:
    name: lcyf-system
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

# application-dev.yml - 开发环境
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lcyf_dev
    username: root
    password: ${DB_PASSWORD:root}

# application-prod.yml - 生产环境
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### 配置类

```java
// ✅ 使用@ConfigurationProperties
@Data
@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {
    private String path = "/data/upload";
    private Long maxSize = 10 * 1024 * 1024L; // 10MB
    private List<String> allowedTypes = List.of("jpg", "png", "pdf");
}

// 使用
@Resource
private UploadProperties uploadProperties;
```

## 异常处理

### 全局异常处理

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public CommonResult<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return CommonResult.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public CommonResult<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().stream()
            .map(ObjectError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return CommonResult.error(400, message);
    }

    @ExceptionHandler(Exception.class)
    public CommonResult<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return CommonResult.error(500, "系统繁忙，请稍后重试");
    }
}
```

## 接口文档

### Swagger配置

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("LCYF系统API")
                .version("1.0.0")
                .description("LCYF Cloud系统接口文档"));
    }
}
```

### 接口注解

```java
@Tag(name = "用户管理", description = "用户相关接口")
@RestController
@RequestMapping("/user")
public class UserController {

    @Operation(summary = "获取用户详情", description = "根据ID获取用户信息")
    @Parameter(name = "id", description = "用户ID", required = true)
    @GetMapping("/{id}")
    public CommonResult<UserDTO> get(@PathVariable Long id) {
        // ...
    }
}
```

## 健康检查

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Resource
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            return Health.up()
                .withDetail("database", "connected")
                .build();
        } catch (SQLException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## 关联Agent

- 03-Java开发专家.md：Spring Boot开发
- 02-架构专家.md：架构设计
