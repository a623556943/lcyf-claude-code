---
description: 测试驱动开发命令，强制执行红-绿-重构的TDD工作流。适合编写新功能、修复bug或重构代码时使用，确保80%以上测试覆盖率。
---

# /lcyf-tdd

## 概述

测试驱动开发命令，强制执行红-绿-重构的TDD工作流。

## 用法

```
/lcyf-tdd <功能描述>
/lcyf-tdd 实现用户登录验证
/lcyf-tdd 添加订单金额计算逻辑
```

## TDD工作流

```
┌─────────────────┐
│   1. 红灯       │ ← 编写测试，测试应该失败
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   2. 绿灯       │ ← 编写最小实现，测试通过
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   3. 重构       │ ← 优化代码，保持测试通过
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   4. 验证       │ ← 检查覆盖率≥80%
└─────────────────┘
```

## 执行流程

### 步骤1: 理解需求

**执行Agent**: tdd-guide

```markdown
## 需求分析
- 功能: 用户登录验证
- 输入: username, password
- 输出: 登录成功/失败
- 边界: 用户不存在、密码错误、用户被禁用
```

### 步骤2: 编写测试

**执行Agent**: tdd-guide

```java
@Test
@DisplayName("登录成功-正确的用户名和密码")
void login_success() {
    // Given
    String username = "admin";
    String password = "123456";

    // When
    LoginResult result = authService.login(username, password);

    // Then
    assertThat(result.isSuccess()).isTrue();
    assertThat(result.getToken()).isNotBlank();
}

@Test
@DisplayName("登录失败-用户不存在")
void login_userNotFound() {
    // Given
    String username = "notexist";
    String password = "123456";

    // When & Then
    assertThrows(UserNotFoundException.class, () -> {
        authService.login(username, password);
    });
}

@Test
@DisplayName("登录失败-密码错误")
void login_wrongPassword() {
    // Given
    String username = "admin";
    String password = "wrongpassword";

    // When & Then
    assertThrows(PasswordErrorException.class, () -> {
        authService.login(username, password);
    });
}
```

### 步骤3: 运行测试（应该失败）

```bash
mvn test -Dtest=AuthServiceTest

# 预期输出: 3 tests, 3 failures
```

### 步骤4: 实现代码

**执行Agent**: java-developer

```java
@Service
public class AuthServiceImpl implements IAuthService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private PasswordEncoder passwordEncoder;

    @Override
    public LoginResult login(String username, String password) {
        // 查找用户
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("用户不存在");
        }

        // 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new PasswordErrorException("密码错误");
        }

        // 检查状态
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UserDisabledException("用户已被禁用");
        }

        // 生成Token
        String token = generateToken(user);
        return LoginResult.success(token);
    }
}
```

### 步骤5: 运行测试（应该通过）

```bash
mvn test -Dtest=AuthServiceTest

# 预期输出: 3 tests, 3 passed
```

### 步骤6: 重构（保持测试通过）

```java
// 重构: 提取验证逻辑
private void validateUser(User user, String password) {
    if (user == null) {
        throw new UserNotFoundException("用户不存在");
    }
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new PasswordErrorException("密码错误");
    }
    if (user.getStatus() != UserStatus.ACTIVE) {
        throw new UserDisabledException("用户已被禁用");
    }
}
```

### 步骤7: 验证覆盖率

```bash
mvn test jacoco:report

# 检查覆盖率 ≥ 80%
```

## 测试类型

| 类型 | 用途 | 占比 |
|------|------|------|
| 单元测试 | 测试单个方法 | 70% |
| 集成测试 | 测试组件协作 | 20% |
| E2E测试 | 测试完整流程 | 10% |

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --coverage | 覆盖率要求 | 80 |
| --skip-refactor | 跳过重构步骤 | false |

## 关联命令

- `/lcyf-new-feature` - 完整功能开发流程
- `/lcyf-verify` - 执行验证

## 关联Agent

- tdd-guide
- java-developer

## 关联Skill

- tdd-workflow
- java-full-stack

## 关联规则

- 03-测试要求
