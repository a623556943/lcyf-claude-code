# LCYF Claude Code - Java团队智能开发系统 v2.0

> 面向 Java/Spring Boot 团队的智能开发伙伴系统

---

## 技术栈

- **语言**: Java 17/21
- **框架**: Spring Boot 3.x
- **ORM**: MyBatis-Plus 3.5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis 7.x
- **RPC**: Dubbo 3.x
- **架构**: 模块化单体（Modular Monolith）

---

## 分层架构

```
┌─────────────────────────────────────────┐
│              adapter（适配层）            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   web   │ │   rpc   │ ���   mq    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│               biz（业务层）              │
│  ┌─────────────────────────────────┐   │
│  │           service               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │        infrastructure           │   │
│  │  ┌─────────┐ ┌─────────┐       │   │
│  │  │ entity  │ │ mapper  │       │   │
│  │  └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│               api（接口层）              │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐ │
│  │  cmd  │ │  dto  │ │ query │ │view │ │
│  └───────┘ └───────┘ └───────┘ └─────┘ │
└─────────────────────────────────────────┘
```

---

## 可用命令

### 核心开发命令

| 命令 | 用途 |
|------|------|
| `/lcyf-new-feature` | 完整的新功能开发工作流 |
| `/lcyf-tdd` | 测试驱动开发流程 |
| `/lcyf-refactor` | 代码重构流程 |
| `/lcyf-build-fix` | 修复构建错误 |

### 代码审查命令

| 命令 | 用途 |
|------|------|
| `/lcyf-code-review` | 全面代码审查 |
| `/lcyf-security-scan` | 安全漏洞扫描 |
| `/lcyf-api-review` | API 设计审查 |
| `/lcyf-db-review` | 数据库设计审查 |
| `/lcyf-module-check` | 模块依赖检查 |

### 管理命令

| 命令 | 用途 |
|------|------|
| `/lcyf-verify` | 执行质量验证 |
| `/lcyf-checkpoint` | 创建/恢复检查点 |
| `/lcyf-learn` | 知识库管理 |
| `/lcyf-auto` | 智能命令选择 |

---

## 编码规范

### Java 命名规范

- **类名**: PascalCase (`UserService`, `OrderController`)
- **方法/变量**: camelCase (`getUserById`, `totalAmount`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **包名**: 全小写 (`com.lcyf.cloud.system`)

### Spring Boot 最佳实践

- 使用构造函数注入，避免字段注入
- `@Transactional` 放在 Service 方法上
- 使用全局异常处理器 (`@ControllerAdvice`)
- 分页查询必须使用 `PageResult<T>`

### 数据库设计

- 表名: 模块前缀 + 小写下划线 (`sys_user`, `sales_order`)
- 必备字段: `id`, `creator`, `create_time`, `updater`, `update_time`, `deleted`
- 主键: `BIGINT AUTO_INCREMENT`
- 外键列必须有索引

### API 设计

- 使用 RESTful 规范
- URL 使用复数名词 (`/api/v1/users`)
- 统一返回 `CommonResult<T>` 格式
- 始终验证输入参数 (`@Valid`)

---

## 质量要求

### 测试覆盖率

- **最低要求**: 80%
- **单元测试**: Service 层必须覆盖
- **集成测试**: Controller 层必须覆盖

### 安全检查

- 无硬编码密钥
- 无 SQL 注入风险
- 无 XSS 风险
- 无敏感信息泄露

### 代码规范

- 方法不超过 50 行
- 类不超过 800 行
- 圈复杂度不超过 10
- 嵌套深度不超过 4 层

---

## 模块依赖规则

```
base ← 所有模块可依赖
  │
  ├─ system ← 基础系统服务
  │
  ├─ sales ← 销售模块
  │     │
  │     └─ policy ← 保单模块
  │           │
  │           └─ finance ← 财务模块
  │
  └─ product-factory ← 产品工厂（独立）
```

**规则**:
- 只依赖 `-api` 模块，不依赖 `-biz` 模块
- 使用 Dubbo RPC 进行跨模块通信
- 禁止循环依赖

---

## 快速开始

### 1. 开发新功能

```bash
# 在 Claude Code 中输入
/lcyf-new-feature

# 输入功能描述
我想开发用户登录功能
```

### 2. 代码审查

```bash
# 代码审查
/lcyf-code-review

# 安全扫描
/lcyf-security-scan
```

### 3. 验证代码

```bash
# 快速验证
/lcyf-verify quick

# 完整验证
/lcyf-verify full
```

---

## Agent 列表

| Agent | 职责 |
|-------|------|
| planner | 任务分解、执行计划 |
| architect | 系统设计、技术决策 |
| java-developer | 功能实现、代码编写 |
| code-reviewer | 代码质量检查 |
| security-reviewer | 安全漏洞检测 |
| tdd-guide | TDD、测试覆盖率 |

## Skill 列表

| Skill | 用途 |
|-------|------|
| java-full-stack | Java/Spring Boot 代码模板 |
| modular-monolith | 模块化架构设计原则 |
| continuous-learning | 知识积累和模式提取 |
| verification-loop | 代码质量验证 |
| workflows | 标准化开发工作流 |
| security-review | 安全检查清单和模式 |
| tdd-workflow | TDD 测试模板和覆盖率 |

---

## 文档

- [快速开始](docs/快速开始.md)
- [安装指南](docs/安装指南.md)
- [CLI使用指南](docs/CLI使用指南.md)
- [模板变量格式规范](docs/模板变量格式规范.md)
- [知识库架构说明](docs/知识库架构说明.md)

---

**版本**: 2.0.0
**仓库**: https://github.com/a623556943/lcyf-claude-code
