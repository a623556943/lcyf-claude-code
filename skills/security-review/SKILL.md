---
name: security-review
description: 在添加认证、处理用户输入、处理密钥、创建 API 端点或实现支付/敏感功能时使用此 skill。提供全面的安全检查清单和模式。
---

# 安全审查技能

## 概述

提供 OWASP Top 10 安全检查清单、敏感信息检测模式和安全编码最佳实践。

## OWASP Top 10 检查清单

### A01:2021 - 访问控制失效

```java
// 错误: 缺少权限检查
@GetMapping("/user/{id}")
public User getUser(@PathVariable Long id) {
    return userService.getById(id);
}

// 正确: 添加权限校验
@GetMapping("/user/{id}")
@PreAuthorize("@ss.hasPermission('system:user:query')")
public User getUser(@PathVariable Long id) {
    return userService.getById(id);
}
```

**检查项**:
- [ ] 所有 API 端点有权限注解
- [ ] 数据查询包含租户隔离
- [ ] 敏感操作有操作日志
- [ ] 水平越权检查（用户只能访问自己的数据）

### A02:2021 - 加密失败

```java
// 错误: 使用弱加密
String hash = DigestUtils.md5Hex(password);

// 正确: 使用BCrypt
String hash = BCrypt.hashpw(password, BCrypt.gensalt());
```

**检查项**:
- [ ] 密码使用 BCrypt 加密
- [ ] 敏感数据传输使用 HTTPS
- [ ] 密钥不硬编码在代码中

### A03:2021 - 注入攻击

```java
// 错误: SQL注入风险
@Select("SELECT * FROM user WHERE name = '" + name + "'")
User findByName(String name);

// 正确: 参数化查询
@Select("SELECT * FROM user WHERE name = #{name}")
User findByName(@Param("name") String name);
```

**检查项**:
- [ ] MyBatis 使用 `#{}` 而非 `${}`
- [ ] 动态 SQL 使用 `<where>` 和 `<if>` 标签
- [ ] 用户输入不直接拼接到查询中

### A04:2021 - 不安全设计

**检查项**:
- [ ] 密码不明文存储
- [ ] 业务逻辑有防重复提交
- [ ] 关键操作有确认机制

### A05:2021 - 安全配置错误

```yaml
# 错误: 开启所有端点
management:
  endpoints:
    web:
      exposure:
        include: "*"

# 正确: 限制端点暴露
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

**检查项**:
- [ ] 生产环境关闭 debug 端点
- [ ] 错误响应不暴露内部信息
- [ ] CORS 配置合理

### A06:2021 - 易受攻击的组件

**检查项**:
- [ ] 依赖无已知 CVE 漏洞
- [ ] 定期执行 `mvn dependency-check:check`

### A07:2021 - 认证失败

**检查项**:
- [ ] 强密码策略（长度≥8，含大小写、数字、特殊字符）
- [ ] 登录失败锁定机制
- [ ] JWT Token 有合理过期时间

### A08:2021 - 软件和数据完整性失败

**检查项**:
- [ ] 不使用 Java 原生反序列化
- [ ] Jackson 配置安全的类型处理

### A09:2021 - 安全日志和监控失败

```java
// 错误: 记录敏感信息
log.info("用户登录: username={}, password={}", username, password);

// 正确: 脱敏处理
log.info("用户登录: username={}", username);
```

**检查项**:
- [ ] 日志不记录密码、Token、密钥
- [ ] 关键操作有审计日志
- [ ] 异常登录有告警

### A10:2021 - 服务端请求伪造(SSRF)

**检查项**:
- [ ] 用户输入的 URL 有白名单验证
- [ ] 内网地址不可从外部访问

## 敏感信息检测模式

| 类型 | 正则模式 | 示例 |
|------|----------|------|
| API密钥 | `[A-Za-z0-9_-]{32,}` | sk-proj-xxxxx |
| 私钥 | `-----BEGIN.*PRIVATE KEY-----` | RSA私钥 |
| 密码 | `password\s*=\s*["'][^"']+["']` | password="123" |
| 数据库URL | `jdbc:.*@.*:\d+` | jdbc:mysql://... |

### 常见泄露位置

- application.yml / application.properties
- 代码中的常量
- 测试代码
- 注释中的示例
- Git 历史记录

## 安全审查报告模板

```markdown
# 安全审查报告

## 基本信息
- 审查范围: {文件/模块}
- 风险等级: 高/中/低

## 漏洞汇总

| 类型 | 数量 | 风险 |
|------|------|------|
| 注入攻击 | {n} | 高 |
| 认证问题 | {n} | 高 |
| 配置错误 | {n} | 中 |
| 敏感信息 | {n} | 中 |

## 详细发现

### 高风险
#### VULN-001: {描述}
- **位置**: {file}:{line}
- **类型**: {OWASP类型}
- **修复**: {修复方案}

## 修复优先级
1. 紧急修复（24小时内）
2. 重要修复（1周内）
3. 建议改进
```

## 关联Agent

- security-reviewer

## 关联命令

- `/lcyf-security-scan` - 安全扫描
- `/lcyf-code-review` - 代码审查（安全阶段）
