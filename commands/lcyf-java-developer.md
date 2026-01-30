---
description: Java/Spring Boot 开发专家，负责功能实现、API开发、数据库操作等核心编码工作。
---

# /lcyf-java-developer 命令

Java/Spring Boot 开发专家，基于 lcyf-cloud 架构（Spring Boot 3.5.x + Dubbo 3.3.3 + MyBatis-Plus 3.5.x）。

## 用法

```bash
/lcyf-java-developer 实现用户管理CRUD功能
/lcyf-java-developer 添加订单导出接口
/lcyf-java-developer 修复多租户过滤问题
```

## 适用场景

- REST API 实现（Controller）
- 业务逻辑编写（Service）
- 数据访问层（Gateway + Mapper）
- Dubbo RPC 服务开发
- 对象转换（MapStruct Assembler）
- 数据库表设计与优化
- Bug 修复与代码重构

## 编码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Controller | {Entity}Controller | UserController |
| Service 接口 | I{Entity}Service | IUserService |
| Service 实现 | {Entity}ServiceImpl | UserServiceImpl |
| Gateway | {Entity}Gateway | UserGateway |
| Assembler | {Entity}Assembler | UserAssembler |
| Entity | {Entity}Do | UserDo |

### 核心约束

**必须做的**：
- 使用 @RequiredArgsConstructor 依赖注入
- Service/Gateway 使用 @Slf4j
- 业务实体继承 TenantBaseDO
- 分页使用 BeanSearcher
- 对象转换使用 MapStruct

**禁止做的**：
- 使用 @Autowired
- 硬编码 Magic Values
- catch 异常不打日志
- 返回 null
- 在 DTO/DO 中写业务逻辑

## 技术栈

| 技术 | 版本 |
|------|------|
| Java | 21 |
| Spring Boot | 3.5.x |
| MyBatis-Plus | 3.5.x |
| Dubbo | 3.3.3 |
| MapStruct | 1.5.x |
| BeanSearcher | 4.x |

## 参数

| 参数 | 说明 | 示例                             |
|------|------|--------------------------------|
| 需求描述 | 要实现的功能 | "实现用户管理 CRUD"                  |
| --module | 指定模块 | system, sales, finance, policy |
| --dry-run | 只生成方案 | true/false                     |

## 工作流

```
需求分析 → /lcyf-plan（复杂功能推荐）
    ↓
/lcyf-java-developer（核心编码）

```

## 关联规则

- **01-Java开发规范** - Java/Spring Boot/MyBatis 编码规范
- **02-API设计规范** - RESTful API 设计
- **03-Git工作流** - Git 提交和分支管理

## 相关文档

- `~/.claude/agents/java-developer.md` - Agent 详细规范
- `~/CLAUDE.md` - 项目架构说明
