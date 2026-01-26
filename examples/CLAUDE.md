# lcyf 项目配置示例

此文件展示如何在 lcyf 项目中使用 lcyf-claude-code 配置。

---

## 项目信息

```yaml
name: lcyf-module-finance
description: 金融模块 - 处理保费计算、账单管理等
version: 1.0.0
tech_stack:
  - Java 17
  - Spring Boot 3.5.x
  - Mybatis-plus 3.x
  - MySQL 8.0
  - Redis 7.x
architecture: 微服务
```

---

## 开发工作流

### 开发新功能

```bash
/lcyf-new-feature
```

完整流程：
1. **EARS 需求设计** - 定义用户故事和验收标准
2. **技术方案设计** - 设计 API、数据库、缓存策略
3. **任务拆分** - 分解为具体的可执行任务
4. **TDD 实现** - 先写测试，再实现功能
5. **代码审查** - 自动检查代码质量、安全性、性能

### 代码审查

```bash
# Java 代码审查
/lcyf-review

# 数据库设计审查
/lcyf-db-review

# API 设计审查
/lcyf-api-review

# 模块依赖检查
/lcyf-module-check
```

---

## 编码规范

### Java 命名规范
- 类名：PascalCase (UserService, OrderController)
- 方法/变量：camelCase (getUserById, totalAmount)
- 常量：UPPER_SNAKE_CASE (MAX_RETRY_COUNT)

### Spring Boot 最佳实践
- 使用构造函数注入，避免字段注入
- @Transactional 放在 service 方法上，不放在 controller
- 使用全局异常处理器 (@ControllerAdvice)
- 配置管理使用 application.yml

### 数据库设计
- 表名：sys_ 前缀 + 小写下划线分隔 (sys_user, order_item)
- 必备字段：id, created_at, updated_at, is_deleted
- 外键列必须有索引
- 使用 BIGINT AUTO_INCREMENT 作为主键

### API 设计
- 使用 RESTful 规范
- URL 使用复数名词 (/api/v1/users 而不是 /api/v1/user)
- 使用统一的 Result 返回值格式
- 始终验证输入参数 (@Valid)

---

## 项目特定的上下文

### 模块结构
```
lcyf-framework              # 基础框架
├── lcyf-module-base        # 共享 DTO 和工具
├── lcyf-module-finance     # 金融模块（当前）
├── lcyf-module-policy      # 保单模块
└── lcyf-module-sales       # 销售模块
```

### 模块依赖
当前模块依赖：
- lcyf-framework
- lcyf-module-base
- lcyf-module-policy（通过 PolicyService）

### 常见问题处理

**Q: 如何处理模块间通信？**
A: 优先使用 Feign 客户端调用其他模块的服务接口。

**Q: 如何进行跨模块事务处理？**
A: 使用 Seata 分布式事务框架。

**Q: 如何避免循环依赖？**
A: 将共享接口放在 lcyf-module-base 中，其他模块依赖此模块。

---

## 示例：开发用户登录功能

### 1. 启动工作流
```bash
/lcyf-new-feature

# 输入：我想开发用户登录功能
```

### 2. Claude Code 生成 EARS 需求
```markdown
## 需求 1 - 用户登录

**用户故事**: 作为用户，我希望能够通过用户名/邮箱和密码登录系统

#### 验收标准
1. When 用户输入正确的用户名和密码时，the 系统应当返回有效的 JWT token
2. When 用户输入错误的凭据时，the 系统应当返回"用户名或密码错误"
3. When 登录成功时，the 系统应当记录登录日志
4. The 系统应当在 2 小时后让 token 失效
```

### 3. Claude Code 生成技术方案
```markdown
## API 设计
POST /api/v1/auth/login
Request: {
  "username": "string",
  "password": "string"
}
Response: {
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }
}

## 数据库设计
表: sys_user
字段:
  - id BIGINT PRIMARY KEY
  - username VARCHAR(50) UNIQUE
  - password_hash VARCHAR(255)
  - status TINYINT
  - created_at TIMESTAMP
  - updated_at TIMESTAMP
  - is_deleted TINYINT

索引: idx_username (UNIQUE)

## 缓存策略
Redis: user:token:{token} -> user_id (TTL: 2小时)
```

### 4. Claude Code 拆分任务
```markdown
- [ ] 创建 LoginDTO 和 LoginVO
  - _需求: 需求 1
- [ ] 实现 AuthService.login() 方法
  - 验证用户名和密码
  - 生成 JWT token
  - _需求: 需求 1
- [ ] 实现 AuthController.login() 端点
  - 参数验证
  - 调用 service
  - _需求: 需求 1
- [ ] 编写测试用例
  - 单元测试 (Service)
  - 集成测试 (Controller)
  - _需求: 需求 1
```

### 5. 实现和审查

完成实现后运行审查：
```bash
# 代码审查
/lcyf-review

# API 审查
/lcyf-api-review

# 数据库审查
/lcyf-db-review
```

---

## 快速参考

### 常用命令
| 命令 | 用途 |
|------|------|
| `/lcyf-new-feature` | 新功能完整开发流程 |
| `/lcyf-review` | Java 代码审查 |
| `/lcyf-db-review` | 数据库设计审查 |
| `/lcyf-api-review` | API 设计审查 |
| `/lcyf-module-check` | 模块依赖检查 |

### 关键文件位置
```
src/main/java/com/lcyf/module/finance/
├── controller/       # API 控制器
├── service/         # 业务逻辑
├── mapper/          # 数据访问
├── entity/          # 数据实体
├── dto/             # 传输对象
└── exception/       # 自定义异常

src/main/resources/
├── application.yml  # Spring Boot 配置
└── mapper/          # Mybatis XML 文件

src/test/java/      # 测试代码
```

---

## 获取帮助

- 参考 `/lcyf-review` 命令的输出了解代码问题
- 查看 `docs/USAGE.md` 了解详细用法
- 阅读 `rules/` 目录下的规范文件

---

**创建时间**: 2026-01-26
**版本**: 1.0.0
