# LCYF Claude Code Configuration

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot-6DB33F?logo=spring-boot&logoColor=white)

**Production-ready Claude Code configuration specifically tailored for lcyf Java/Spring Boot microservices projects.**

基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 框架，为 lcyf 项目深度定制，优化了 Java 开发、API 设计、数据库优化和多模块协调工作流。

---

## 核心特性

### 🎯 专用 Agents

- **java-reviewer** - Java 代码审查专家，检查 Spring Boot 最佳实践
- **api-designer** - API 设计专家，确保 RESTful 规范和文档完整性
- **db-optimizer** - 数据库优化专家，MySQL 性能优化和设计审查
- **module-coordinator** - 模块协调器，管理多模块依赖和接口契约

### 📚 专业 Skills

- **java-dev** - Spring Boot、Mybatis-plus、异常处理、事务管理
- **database-design** - MySQL 优化、索引策略、分页查询
- **api-design** - RESTful 规范、统一返回值、OpenAPI 文档
- **module-design** - 依赖管理、接口设计、破坏性变更检查
- **lcyf-workflow** - EARS 需求设计 → 技术方案 → 任务拆分

### ⚡ 定制命令

- `/lcyf-new-feature` - 完整新功能开发流程
- `/lcyf-review` - Java 代码质量审查
- `/lcyf-db-review` - 数据库设计审查
- `/lcyf-api-review` - API 设计审查
- `/lcyf-module-check` - 模块依赖检查

### 🔒 自动化质量检查

- Pre-commit 检查（SQL 注入、XSS、硬编码密钥）
- Post-edit 格式化（Google Java Format、Checkstyle）
- 强制 TDD 工作流（最低 80% 测试覆盖率）
- 安全漏洞扫描

---

## 技术栈支持

- **Java** 17+
- **Spring Boot** 3.5.x
- **Mybatis-plus** 3.x
- **MySQL** 8.0+
- **Redis** 7.x
- **Maven/Gradle**

---

## 快速开始

### 方式 1: 本地安装 (推荐)

```bash
# 1. 项目已经克隆到 D:\lcyf-claude-code

# 2. 安装依赖
cd D:\lcyf-claude-code
npm install

# 3. 初始化 lcyf 项目配置
node scripts/setup/init-project.js "D:\code project2"
```

### 方式 2: Claude Code Plugin 安装

在 Claude Code 中执行：

```bash
# 添加 marketplace
/plugin marketplace add file://D:\lcyf-claude-code

# 安装 plugin
/plugin install lcyf-claude-code
```

---

## 项目结构

```
lcyf-claude-code/
├── agents/              # 专用 Agents（java-reviewer, api-designer, db-optimizer, module-coordinator）
├── skills/              # 领域技能（java-dev, database-design, api-design, module-design, lcyf-workflow）
├── commands/            # 定制命令（lcyf-new-feature, lcyf-review, 等）
├── rules/               # 编码规范（java-coding-standards, spring-boot-best-practices, 等）
├── hooks/               # 自动化钩子（pre-commit, post-edit）
├── templates/           # 代码模板（Controller, Service, Mapper, DTO）
├── contexts/            # 上下文模式（lcyf-dev, lcyf-review）
├── scripts/             # 工具脚本
├── examples/            # 示例配置
└── docs/                # 详细文档
```

---

## 使用示例

### 开发新功能

```bash
# 使用完整工作流
/lcyf-new-feature

# Claude Code 将引导你完成：
# 1. EARS 需求设计
# 2. 技术方案设计（API + 数据库 + 缓存）
# 3. 任务拆分
# 4. TDD 实现
# 5. 代码审查
# 6. 文档更新
```

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

## 工作流程

### 1. 需求设计 (EARS 语法)

```markdown
## 需求 1 - 用户登录功能

**用户故事**: 作为用户，我希望能够通过用户名和密码登录系统

#### 验收标准
1. When 用户输入正确的用户名和密码时，the 系统应当返回 JWT token
2. When 用户输入错误的用户名或密码时，the 系统应当返回错误信息
3. The 系统应当记录登录日志
```

### 2. 技术方案设计

```markdown
## API 设计
POST /api/v1/auth/login
Request: { "username": "string", "password": "string" }
Response: { "success": true, "data": { "token": "string" } }

## 数据库设计
- 表: sys_user (id, username, password_hash, salt, status, created_at)
- 索引: idx_username (唯一索引)

## 缓存策略
- Redis: user:token:{token} -> user_id (TTL: 2小时)
```

### 3. 任务拆分与实现

Claude Code 自动拆分为可执行任务，强制 TDD 流程。

---

## 配置

### 项目级配置

在 `D:\code project2\.claude\CLAUDE.md` 中：

```markdown
# lcyf Project Configuration

使用 lcyf-claude-code 工具链进行开发

## 技术栈
- Java 17 / Spring Boot 3.5.x
- Mybatis-plus 3.x / MySQL 8.0
- Redis 7.x

## 开发流程
参考 /lcyf-new-feature 命令
```

---

## 文档

- [安装指南](docs/INSTALLATION.md) - 详细的安装和配置说明
- [使用指南](docs/USAGE.md) - 命令和工作流详解
- [示例项目](examples/) - 实际使用示例

---

## 与 everything-claude-code 的关系

本项目基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 框架：

- **继承**: 基础架构、通用 agents（planner, tdd-guide, code-reviewer 等）
- **扩展**: 新增 Java/Spring Boot 专用 agents 和 skills
- **定制**: 针对 lcyf 项目的工作流和规范

---

## 开发路线图

### v1.0.0 (当前)

- [x] 基础项目结构
- [x] 核心 agents 和 skills
- [x] 基础文档

### v1.1.0 (计划中)

- [ ] 完整的 agents 实现
- [ ] 所有 skills 内容
- [ ] Hooks 和自动化脚本
- [ ] 代码模板库

### v1.2.0 (计划中)

- [ ] 持续学习功能
- [ ] 知识库积累
- [ ] 性能优化

---

## 贡献

欢迎贡献！请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

---

## 许可证

MIT License - 自由使用和修改

---

## 支持

- **Issues**: [提交问题](https://github.com/lcyf/lcyf-claude-code/issues)
- **文档**: [查看文档](docs/)
- **团队**: lcyf 开发团队

---

**基于 lcyf-claude-code 构建更好的 Java 应用！**
