# 使用指南

本文档详细说明如何使用 lcyf-claude-code 进行日常开发。

---

## 目录

- [快速开始](#快速开始)
- [Commands 命令](#commands-命令)
- [Agents 代理](#agents-代理)
- [Skills 技能](#skills-技能)
- [工作流程](#工作流程)
- [最佳实践](#最佳实践)

---

## 快速开始

### 第一个功能开发

```bash
# 1. 启动完整工作流
/lcyf-new-feature

# 2. Claude Code 引导你完成：
#    - EARS 需求设计
#    - 技术方案设计
#    - 任务拆分
#    - TDD 实现
#    - 代码审查
```

### 日常开发场景

```bash
# 代码审查
/lcyf-review

# 数据库设计审查
/lcyf-db-review

# API 设计审查
/lcyf-api-review

# 检查模块依赖
/lcyf-module-check
```

---

## Commands 命令

### `/lcyf-new-feature` - 新功能开发

**用途**: 完整的新功能开发流程，从需求到实现。

**流程**:

1. **需求设计（EARS 语法）**
   ```markdown
   ## 需求 1 - 用户注册功能

   **用户故事**: 作为新用户，我希望能够注册账号

   #### 验收标准
   1. When 用户输入有效的邮箱和密码时，the 系统应当创建新账号
   2. When 用户输入已存在的邮箱时，the 系统应当返回错误信息
   3. The 系统应当发送验证邮件
   ```

2. **技术方案设计**
   ```markdown
   ## API 设计
   POST /api/v1/users/register
   Request: { "email": "string", "password": "string" }
   Response: { "success": true, "data": { "userId": "long" } }

   ## 数据库设计
   - 表: sys_user
   - 索引: unique idx_email

   ## 缓存策略
   - Redis: verification:email:{email} -> code (TTL: 5min)
   ```

3. **任务拆分**
   ```markdown
   - [ ] 创建 User 实体类
   - [ ] 编写 UserMapper 接口
   - [ ] 实现 UserService.register()
   - [ ] 实现 UserController.register()
   - [ ] 编写单元测试
   - [ ] 编写集成测试
   ```

4. **TDD 实现**
   - 先编写测试（RED）
   - 实现代码（GREEN）
   - 重构（IMPROVE）

5. **代码审查**
   - 自动调用 java-reviewer agent
   - 生成审查报告

**示例**:

```bash
/lcyf-new-feature

# Claude Code 会询问:
# "请描述新功能的需求..."

# 输入需求后，Claude Code 会生成完整的开发计划
```

---

### `/lcyf-review` - Java 代码审查

**用途**: 审查 Java 代码质量、Spring Boot 最佳实践、安全性。

**检查项**:
- Spring Boot 注解正确性
- 依赖注入规范
- 事务管理
- 异常处理
- 性能问题
- 安全漏洞

**示例**:

```bash
# 审查当前分支的所有变更
/lcyf-review

# 审查特定文件
/lcyf-review src/main/java/com/lcyf/module/user/service/UserService.java
```

**输出**:

```markdown
## 代码审查报告

### 严重问题 (Critical)
1. UserService.java:45 - 缺少 @Transactional 注解
2. UserController.java:67 - 未进行参数验证

### 警告 (Warning)
1. UserMapper.xml:23 - 未使用索引，可能影响性能
2. UserDTO.java:15 - 字段应使用 @NotNull 注解

### 建议 (Suggestion)
1. UserService.java:120 - 建议提取常量
2. UserController.java:89 - 建议添加日志
```

---

### `/lcyf-db-review` - 数据库设计审查

**用途**: 审查数据库表设计、索引策略、查询性能。

**检查项**:
- 表结构设计
- 索引策略
- 查询性能
- 事务隔离级别
- 分页查询优化

**示例**:

```bash
# 审查数据库设计
/lcyf-db-review

# Claude Code 会分析:
# - Mapper XML 文件
# - Entity 定义
# - SQL 查询语句
```

**输出**:

```markdown
## 数据库审查报告

### 表设计
- sys_user: ✅ 设计合理
  - 建议: 添加 updated_at 字段

### 索引
- idx_email: ✅ 唯一索引正确
- idx_username: ⚠️ 缺少索引，建议添加

### 查询性能
- UserMapper.selectList: ⚠️ 未使用索引
  - 建议: WHERE username = ? 添加索引

### 分页查询
- UserMapper.selectPage: ✅ 使用 Mybatis-plus 分页插件
```

---

### `/lcyf-api-review` - API 设计审查

**用途**: 审查 RESTful API 设计、返回值结构、文档完整性。

**检查项**:
- RESTful 规范
- HTTP 方法正确性
- 状态码使用
- 统一返回值结构
- 参数验证
- OpenAPI 文档

**示例**:

```bash
# 审查 API 设计
/lcyf-api-review

# 审查特定 Controller
/lcyf-api-review src/main/java/com/lcyf/module/user/controller/UserController.java
```

**输出**:

```markdown
## API 审查报告

### RESTful 规范
- POST /api/v1/users: ✅ 符合规范
- GET /api/v1/users/{id}: ✅ 符合规范
- PUT /api/v1/users/{id}: ⚠️ 建议使用 PATCH 进行部分更新

### 返回值结构
- UserController.create: ✅ 使用统一 Result 结构
- UserController.update: ❌ 未使用统一结构

### 参数验证
- UserController.create: ⚠️ 缺少 @Valid 注解
- UserDTO.email: ❌ 缺少 @Email 注解

### 文档
- UserController: ⚠️ 缺少 @ApiOperation 注解
```

---

### `/lcyf-module-check` - 模块依赖检查

**用途**: 检查多模块依赖、接口契约、破坏性变更。

**检查项**:
- 模块依赖关系
- 循环依赖检测
- 接口契约验证
- 版本兼容性
- 破坏性变更

**示例**:

```bash
# 检查模块依赖
/lcyf-module-check

# 检查特定模块
/lcyf-module-check lcyf-module-finance
```

**输出**:

```markdown
## 模块依赖检查报告

### 依赖关系
lcyf-module-finance
├── lcyf-framework (v1.0.0) ✅
├── lcyf-module-base (v1.0.0) ✅
└── lcyf-module-policy (v1.0.0) ⚠️ 建议升级到 v1.1.0

### 循环依赖
❌ 检测到循环依赖:
lcyf-module-finance -> lcyf-module-policy -> lcyf-module-finance

### 接口契约
- FinanceService.calculateInterest: ✅ 接口未变更
- PolicyService.getPolicy: ⚠️ 返回值结构变更

### 破坏性变更
⚠️ 检测到破坏性变更:
1. PolicyDTO.policyType 字段类型从 String 变更为 Enum
2. 建议: 创建新版本 API 或使用适配器模式
```

---

## Agents 代理

### java-reviewer - Java 代码审查专家

**职责**:
- 检查 Spring Boot 注解使用
- 事务边界检查
- 异常处理验证
- 依赖注入审查
- 性能问题识别

**调用方式**:

```bash
# 自动调用（使用 /lcyf-review 命令）
/lcyf-review

# 手动指定
请使用 java-reviewer agent 审查这段代码...
```

---

### api-designer - API 设计专家

**职责**:
- RESTful 规范检查
- 统一返回值结构
- 参数验证完整性
- OpenAPI 文档生成
- 版本兼容性检查

**调用方式**:

```bash
# 自动调用
/lcyf-api-review

# 手动指定
请使用 api-designer agent 帮我设计一个用户管理 API...
```

---

### db-optimizer - 数据库优化专家

**职责**:
- 索引策略优化
- 查询性能分析
- 表结构设计审查
- 事务隔离级别建议
- 分页查询优化

**调用方式**:

```bash
# 自动调用
/lcyf-db-review

# 手动指定
请使用 db-optimizer agent 优化这个查询...
```

---

### module-coordinator - 模块协调器

**职责**:
- 模块依赖分析
- 循环依赖检测
- 接口契约验证
- 破坏性变更检查
- 版本兼容性管理

**调用方式**:

```bash
# 自动调用
/lcyf-module-check

# 手动指定
请使用 module-coordinator agent 分析模块依赖...
```

---

## Skills 技能

### java-dev - Java 开发技能

**包含**:
- Spring Boot 最佳实践
- Mybatis-plus 使用指南
- 异常处理策略
- 事务管理

**使用方式**:

```bash
# 自动加载（开发 Java 项目时）
# 手动指定
请使用 java-dev skill 帮我编写一个 Spring Boot Controller...
```

---

### database-design - 数据库设计技能

**包含**:
- MySQL 优化指南
- 索引策略
- 分页查询最佳实践

**使用方式**:

```bash
请使用 database-design skill 帮我设计一个用户表...
```

---

### api-design - API 设计技能

**包含**:
- RESTful 规范
- 统一返回值结构
- OpenAPI 文档规范

**使用方式**:

```bash
请使用 api-design skill 帮我设计一个 RESTful API...
```

---

### module-design - 模块设计技能

**包含**:
- 依赖管理
- 接口设计
- 破坏性变更检查清单

**使用方式**:

```bash
请使用 module-design skill 帮我设计一个新模块...
```

---

### lcyf-workflow - lcyf 工作流技能

**包含**:
- EARS 需求设计模板
- 技术方案设计模板
- 任务拆分模板

**使用方式**:

```bash
# 自动使用（调用 /lcyf-new-feature 时）
/lcyf-new-feature
```

---

## 工作流程

### 场景 1: 开发新功能

```bash
# 1. 启动工作流
/lcyf-new-feature

# 2. 需求设计
用户希望能够重置密码

# 3. Claude Code 生成 EARS 需求
## 需求 1 - 密码重置功能
**用户故事**: 作为用户，我希望能够通过邮箱重置密码
...

# 4. 确认需求
确认

# 5. Claude Code 生成技术方案
## API 设计
POST /api/v1/users/reset-password
...

# 6. 确认技术方案
确认

# 7. Claude Code 拆分任务并开始实现
- [ ] 创建 ResetPasswordDTO
- [ ] 实现 UserService.resetPassword()
...

# 8. 自动执行 TDD 流程
# 9. 代码审查
# 10. 生成文档
```

---

### 场景 2: Bug 修复

```bash
# 1. 描述 Bug
用户登录时，如果密码错误，系统返回 500 错误而不是 400

# 2. Claude Code 分析
让我分析一下 UserController.login() 方法...

# 3. 识别问题
问题在于 UserService.login() 抛出了未捕获的异常

# 4. 提出修复方案
建议添加全局异常处理器...

# 5. 实现修复
# 6. 编写测试验证修复
# 7. 代码审查
/lcyf-review
```

---

### 场景 3: 代码重构

```bash
# 1. 描述重构需求
UserService 类太大了（800+ 行），需要重构

# 2. Claude Code 分析
让我分析 UserService 的职责...

# 3. 提出重构方案
建议拆分为：
- UserService（核心业务）
- UserAuthService（认证相关）
- UserProfileService（个人资料）

# 4. 执行重构
# 5. 运行所有测试确保功能不变
# 6. 代码审查
/lcyf-review
```

---

## 最佳实践

### 1. 始终使用工作流

```bash
# ✅ 好的做法
/lcyf-new-feature

# ❌ 不好的做法
直接写代码，没有需求文档和技术方案
```

### 2. 定期代码审查

```bash
# 每次提交前
/lcyf-review

# 数据库变更前
/lcyf-db-review

# API 变更前
/lcyf-api-review
```

### 3. TDD 开发

```bash
# ✅ 先写测试
# 1. 编写失败的测试
# 2. 实现代码使测试通过
# 3. 重构

# ❌ 后补测试
# 实现代码后再补测试（容易遗漏边界情况）
```

### 4. 模块化设计

```bash
# 定期检查模块依赖
/lcyf-module-check

# 避免循环依赖
# 保持接口契约稳定
```

### 5. 文档同步

```bash
# API 变更后立即更新 OpenAPI 文档
# 数据库变更后更新表结构文档
# 需求变更后更新需求文档
```

---

## 快捷键和别名

可以在项目 `.claude/CLAUDE.md` 中定义别名：

```markdown
## 命令别名

- `nf` = `/lcyf-new-feature`
- `rv` = `/lcyf-review`
- `dr` = `/lcyf-db-review`
- `ar` = `/lcyf-api-review`
- `mc` = `/lcyf-module-check`
```

---

## 常见问题

### Q1: 如何跳过某个工作流步骤？

A: 在交互式提示中输入 "skip" 或 "跳过"。

### Q2: 如何自定义需求模板？

A: 编辑 `skills/lcyf-workflow/requirement-design.md`。

### Q3: 如何禁用自动代码审查？

A: 在项目 `.claude/CLAUDE.md` 中添加：
```markdown
## 禁用自动审查
不要自动调用 java-reviewer agent
```

### Q4: 如何添加自定义检查规则？

A: 在 `rules/` 目录下创建新的规则文件。

---

## 下一步

- 查看 [示例项目](../examples/)
- 阅读 [技术方案设计](../specs/lcyf-claude-code-migration/design.md)
- 探索 [Skills 详细文档](../skills/)

---

**使用 lcyf-claude-code 提升开发效率！**
