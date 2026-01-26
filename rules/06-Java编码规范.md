# 06-Java编码规范

## 概述

Java编码规范确保代码风格统一，提高可读性和可维护性。

## 命名规范

### 包命名

```java
// ✅ 全小写，使用点分隔
package com.lcyf.cloud.system.biz.service;
package com.lcyf.cloud.sales.adapter.web;

// ❌ 错误
package com.lcyf.cloud.System.Biz.Service;
package com_lcyf_cloud_system;
```

### 类命名

```java
// ✅ PascalCase
public class UserService {}
public class OrderController {}
public interface IUserService {}
public abstract class AbstractHandler {}
public enum StatusEnum {}

// ❌ 错误
public class userService {}      // 首字母小写
public class User_Service {}     // 使用下划线
public class USERService {}      // 大写缩写词
```

### 方法命名

```java
// ✅ camelCase，动词开头
public User getById(Long id) {}
public List<User> listByStatus(Integer status) {}
public Long create(UserDTO dto) {}
public void update(UserDTO dto) {}
public void deleteById(Long id) {}
public boolean isActive() {}
public boolean hasPermission() {}

// ❌ 错误
public User GetById(Long id) {}        // 首字母大写
public User get_by_id(Long id) {}      // 使用下划线
public User query(Long id) {}          // 不够描述性
```

### 变量命名

```java
// ✅ camelCase
private Long userId;
private String userName;
private List<Order> pendingOrders;

// ✅ 常量全大写+下划线
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";

// ❌ 错误
private Long UserId;          // 首字母大写
private String user_name;     // 使用下划线
private List<Order> l;        // 无意义
```

## 代码结构

### 类文件结构

```java
// 1. 包声明
package com.lcyf.cloud.system.biz.service.impl;

// 2. Import语句（分组：java、javax、第三方、本项目）
import java.util.List;
import java.util.Map;

import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import com.lcyf.cloud.system.biz.service.IUserService;

// 3. 类声明
/**
 * 用户服务实现
 *
 * @author zhangsan
 */
@Service
public class UserServiceImpl implements IUserService {

    // 4. 静态常量
    private static final int DEFAULT_PAGE_SIZE = 10;

    // 5. 静态变量
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    // 6. 实例变量
    @Resource
    private UserMapper userMapper;

    // 7. 构造方法

    // 8. 公共方法

    // 9. 私有方法
}
```

### 方法长度

```java
// ✅ 方法不超过50行，单一职责
public void processOrder(Order order) {
    validateOrder(order);
    calculatePrice(order);
    applyDiscount(order);
    saveOrder(order);
    sendNotification(order);
}

private void validateOrder(Order order) {
    // 验证逻辑
}

private void calculatePrice(Order order) {
    // 计算价格
}

// ❌ 方法过长
public void processOrder(Order order) {
    // 100+ 行代码...
}
```

## 异常处理

### 异常使用

```java
// ✅ 使用具体异常
public User getById(Long id) {
    User user = userMapper.selectById(id);
    if (user == null) {
        throw new NotFoundException("用户不存在: " + id);
    }
    return user;
}

// ✅ 捕获具体异常
try {
    userService.save(user);
} catch (DuplicateKeyException e) {
    throw new BusinessException("用户名已存在", e);
}

// ❌ 不要捕获Exception
try {
    // ...
} catch (Exception e) {
    // 太宽泛
}
```

### 自定义异常

```java
// ✅ 业务异常
public class BusinessException extends RuntimeException {
    private final Integer code;
    private final String message;

    public BusinessException(String message) {
        this(ErrorCode.BUSINESS_ERROR.getCode(), message);
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
```

## 集合处理

### Stream API

```java
// ✅ 使用Stream简化集合操作
List<String> names = users.stream()
    .filter(u -> u.getStatus() == 1)
    .map(User::getName)
    .collect(Collectors.toList());

Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, Function.identity()));

// ✅ 并行流处理大数据
long count = largeList.parallelStream()
    .filter(this::isValid)
    .count();
```

### Optional处理

```java
// ✅ 使用Optional避免NPE
public String getUserName(Long id) {
    return Optional.ofNullable(userMapper.selectById(id))
        .map(User::getName)
        .orElse("unknown");
}

// ✅ 链式调用
Optional.ofNullable(user)
    .map(User::getDepartment)
    .map(Department::getManager)
    .map(User::getName)
    .orElse("N/A");

// ❌ 避免isPresent + get
if (optional.isPresent()) {
    return optional.get();
}
```

## 空值处理

### 防御性编程

```java
// ✅ 参数校验
public void process(List<User> users) {
    if (CollectionUtils.isEmpty(users)) {
        return;
    }
    // 处理逻辑
}

// ✅ 使用Objects工具类
Objects.requireNonNull(user, "user不能为null");

// ✅ 字符串判断
if (StringUtils.isNotBlank(name)) {
    // 处理
}
```

## 日志规范

### 日志级别

```java
// ERROR: 错误，需要关注
log.error("订单处理失败, orderId={}", orderId, e);

// WARN: 警告，潜在问题
log.warn("重试次数过多, userId={}, retryCount={}", userId, retryCount);

// INFO: 重要业务信息
log.info("用户登录成功, userId={}", userId);

// DEBUG: 调试信息
log.debug("查询参数: {}", query);
```

### 日志格式

```java
// ✅ 使用占位符
log.info("用户登录, userId={}, ip={}", userId, ip);

// ❌ 不要字符串拼接
log.info("用户登录, userId=" + userId + ", ip=" + ip);

// ✅ 异常日志包含堆栈
log.error("处理失败, orderId={}", orderId, e);

// ❌ 不要只记录message
log.error("处理失败: " + e.getMessage());
```

## 注释规范

### 类注释

```java
/**
 * 用户服务实现
 *
 * <p>处理用户相关的业务逻辑</p>
 *
 * @author zhangsan
 * @since 2025-01-01
 */
public class UserServiceImpl {
}
```

### 方法注释

```java
/**
 * 根据ID获取用户
 *
 * @param id 用户ID
 * @return 用户信息
 * @throws NotFoundException 用户不存在时抛出
 */
public User getById(Long id) {
}
```

## 关联Agent

- 03-Java开发专家.md：Java代码实现
- 05-代码审查专家.md：代码审查
