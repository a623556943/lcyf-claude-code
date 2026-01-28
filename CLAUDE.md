# LCYF Claude Code - Java 团队智能开发系统

> 面向 Java/Spring Boot 团队的轻量级智能开发伙伴系统

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
│  │   web   │ │   rpc   │ │   mq    │   │
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
/lcyf-new-feature 添加用户导出功能
```

### 2. 代码审查

```bash
/lcyf-code-review
```

### 3. 知识管理

```bash
/lcyf-learn list
```

---

## 文档

- [快速开始](docs/快速开始.md)
- [安装指南](docs/安装指南.md)
- [知识库架构说明](docs/知识库架构说明.md)

---

**仓库**: https://github.com/a623556943/lcyf-claude-code
