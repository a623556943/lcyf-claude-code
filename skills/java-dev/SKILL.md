# Java 开发技能

---
name: java-dev
description: lcyf 项目的 Java 和 Spring Boot 开发模式及最佳实践
version: 1.0.0
---

## 概览

为 lcyf 项目中的 Java 开发提供全面指导，重点包括：
- Spring Boot 3.5.x 的模式和最佳实践
- Mybatis-plus 使用和优化
- 异常处理策略
- 事务管理
- 常见的模式和反模式

## 何时使用

自动加载：
- 处理 Java 文件（`.java`）时
- 开发 Spring Boot 应用时
- 编写服务层代码时
- 使用 Mybatis-plus 实现数据库操作时

手动调用：
```
请使用 java-dev skill 帮我编写 Spring Boot Controller/Service/Mapper...
```

## 组件

### 1. Spring Boot 模式（`spring-boot-patterns.md`）

**关键主题：**
- Controller/Service/Repository 分层
- 依赖注入最佳实践（构造函数注入）
- 配置管理（@ConfigurationProperties）
- 异步处理和定时任务
- 使用 @Cacheable 进行缓存
- 使用 ApplicationEvent 的事件驱动架构

**快速参考：**
```java
// ✅ 好 - 构造函数注入
@Service
@Slf4j
public class UserService {
    private final UserMapper userMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    public UserService(UserMapper userMapper,
                       RedisTemplate<String, Object> redisTemplate) {
        this.userMapper = userMapper;
        this.redisTemplate = redisTemplate;
    }
}

// ❌ 不好 - 字段注入
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
}
```

### 2. Mybatis-plus 指南（`mybatis-plus-guide.md`）

**关键主题：**
- BaseMapper 使用
- QueryWrapper 和 LambdaQueryWrapper
- 分页配置
- 逻辑删除（@TableLogic）
- 乐观锁定（@Version）
- 自动填充字段（created_at、updated_at）

**快速参考：**
```java
// ✅ 好 - LambdaQueryWrapper
public List<User> findActiveUsers(String keyword) {
    return baseMapper.selectList(
        new LambdaQueryWrapper<User>()
            .eq(User::getStatus, 1)
            .like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
            .orderByDesc(User::getCreatedAt)
    );
}

// Pagination
public IPage<User> page(Integer pageNum, Integer pageSize) {
    return baseMapper.selectPage(
        new Page<>(pageNum, pageSize),
        new LambdaQueryWrapper<User>().eq(User::getIsDeleted, 0)
    );
}
```

### 3. Exception Handling (`exception-handling.md`)

**Key Topics:**
- Global exception handlers (@ControllerAdvice)
- Custom business exceptions
- Error code design
- Error response structure
- Logging best practices

**Quick Reference:**
```java
// Custom exception
public class BusinessException extends RuntimeException {
    private final String errorCode;

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}

// Global exception handler
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public Result handleBusinessException(BusinessException e) {
        log.warn("Business exception: {} - {}", e.getErrorCode(), e.getMessage());
        return Result.error(e.getErrorCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        log.error("Unexpected exception", e);
        return Result.error("INTERNAL_ERROR", "System error");
    }
}
```

### 4. Transaction Management (`transaction-management.md`)

**Key Topics:**
- @Transactional annotation usage
- Transaction propagation levels
- Isolation levels
- Rollback rules
- Distributed transactions (Seata)
- Transaction failure scenarios

**Quick Reference:**
```java
// ✅ Good - Transaction on service method
@Service
public class OrderService {
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(CreateOrderDTO dto) {
        // 1. Create order
        Order order = new Order();
        orderMapper.insert(order);

        // 2. Deduct inventory
        inventoryService.deduct(dto.getProductId(), dto.getQuantity());

        // 3. Create payment record
        paymentService.createPayment(order.getId(), dto.getAmount());
    }
}

// Transaction propagation
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logOperation(String operation) {
    // This runs in a new transaction, independent of caller
    auditMapper.insert(new AuditLog(operation));
}
```

## Common Patterns

### 1. Controller Pattern

```java
@RestController
@RequestMapping("/api/v1/users")
@Slf4j
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public Result<UserVO> getUser(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("USER_NOT_FOUND", "User not found");
        }
        return Result.ok(UserVO.from(user));
    }

    @Operation(summary = "Create user")
    @PostMapping
    public Result<UserVO> createUser(@Valid @RequestBody CreateUserDTO dto) {
        User user = userService.create(dto);
        return Result.ok(UserVO.from(user));
    }
}
```

### 2. Service Pattern

```java
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User create(CreateUserDTO dto) {
        // 1. Validate
        if (existsByUsername(dto.getUsername())) {
            throw new BusinessException("USER_EXISTS", "Username already exists");
        }

        // 2. Create entity
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        // 3. Save
        baseMapper.insert(user);

        // 4. Publish event
        applicationContext.publishEvent(new UserCreatedEvent(user));

        return user;
    }
}
```

### 3. Repository Pattern with Mybatis-plus

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // Custom methods if needed
    List<User> selectUsersByRole(@Param("role") String role);
}

// Entity
@TableName("sys_user")
@Data
public class User extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String email;

    @TableField(select = false)
    private String passwordHash;

    private Integer status;

    @TableLogic
    private Integer isDeleted;
}
```

## Anti-Patterns to Avoid

### 1. Field Injection
```java
// ❌ Bad
@Autowired
private UserService userService;

// ✅ Good
private final UserService userService;

public UserController(UserService userService) {
    this.userService = userService;
}
```

### 2. Transaction on Controller
```java
// ❌ Bad
@Transactional
@PostMapping
public Result createUser(@RequestBody CreateUserDTO dto) {
    // Transaction should be on service method
}

// ✅ Good
@PostMapping
public Result createUser(@RequestBody CreateUserDTO dto) {
    User user = userService.create(dto);  // Service method has @Transactional
    return Result.ok(UserVO.from(user));
}
```

### 3. N+1 Query Problem
```java
// ❌ Bad
public List<OrderVO> getUserOrders(Long userId) {
    List<Order> orders = orderMapper.selectByUserId(userId);
    for (Order order : orders) {
        // N+1 problem!
        List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
        order.setItems(items);
    }
    return OrderVO.fromList(orders);
}

// ✅ Good - Single query with JOIN
public List<OrderVO> getUserOrders(Long userId) {
    return orderMapper.selectOrdersWithItems(userId);
}
```

### 4. Catching Generic Exception
```java
// ❌ Bad
try {
    userService.create(dto);
} catch (Exception e) {
    // Too broad, catches everything including RuntimeException
}

// ✅ Good
try {
    userService.create(dto);
} catch (BusinessException e) {
    // Handle business exception
    return Result.error(e.getErrorCode(), e.getMessage());
} catch (DataIntegrityViolationException e) {
    // Handle database constraint violation
    return Result.error("DATA_ERROR", "Data integrity violation");
}
```

## Integration with lcyf Modules

### Module Structure
```
lcyf-framework          (Base framework and utilities)
├── lcyf-module-base    (Shared DTOs, enums, utilities)
├── lcyf-module-finance (Finance domain)
├── lcyf-module-policy  (Policy domain)
└── lcyf-module-sales   (Sales domain)
```

### Best Practices for Multi-Module
1. **Interface Definition**: Define service interfaces in `lcyf-module-base`
2. **Implementation**: Implement in specific modules
3. **Feign Clients**: For inter-module communication
4. **Event-Driven**: Use Spring Events or MQ for loose coupling
5. **Shared DTOs**: Place in `lcyf-module-base`

## Testing Guidelines

### Unit Testing
```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;

    @MockBean
    private UserMapper userMapper;

    @Test
    void testCreateUser() {
        // Given
        CreateUserDTO dto = new CreateUserDTO();
        dto.setUsername("testuser");

        when(userMapper.insert(any())).thenReturn(1);

        // When
        User user = userService.create(dto);

        // Then
        assertNotNull(user);
        assertEquals("testuser", user.getUsername());
        verify(userMapper).insert(any(User.class));
    }
}
```

### Integration Testing
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateUser() throws Exception {
        String requestBody = """
            {
              "username": "testuser",
              "email": "test@example.com",
              "password": "password123"
            }
            """;

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
```

## Performance Considerations

1. **Caching**: Use @Cacheable for frequently accessed data
2. **Lazy Loading**: Use @OneToMany(fetch = FetchType.LAZY)
3. **Batch Operations**: Use saveBatch() for bulk inserts
4. **Connection Pooling**: Configure HikariCP properly
5. **Query Optimization**: Use indexes and avoid SELECT *

## Security Checklist

- [ ] Input validation with Bean Validation
- [ ] SQL injection prevention (Mybatis-plus handles this)
- [ ] Authentication with Spring Security
- [ ] Authorization with method security (@PreAuthorize)
- [ ] Sensitive data not logged
- [ ] Password hashing with BCrypt
- [ ] CSRF protection enabled

## Related Resources

- Spring Boot official documentation
- Mybatis-plus documentation
- lcyf-claude-code agents: java-reviewer, api-designer, db-optimizer
- lcyf-claude-code rules: spring-boot-best-practices, java-coding-standards

---

**Version**: 1.0.0
**Last Updated**: 2026-01-26
**Maintainer**: lcyf Team
