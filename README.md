# LCYF Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java_17+-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot%203.x-6DB33F?logo=spring-boot&logoColor=white)

**面向 Java/Spring Boot 团队的轻量级智能开发伙伴系统**

> 自动化工作流、代码审查、知识管理一体化解决方案

---

## 核心特性

### 4 个专家 Agent

| Agent | 职责 |
|-------|------|
| planner | 复杂功能和重构的专业规划专家 |
| java-developer | 功能实现、API 开发、代码生成 |
| code-reviewer | 代码质量检查、安全审查 |
| knowledge-manager | 知识提取、模式积累、知识库管理 |

### 5 个智能命令

| 命令 | 用途 |
|------|------|
| `/lcyf-auto` | 自动化工作流：需求分析 → 开发（推荐） |
| `/lcyf-plan` | 需求规划、风险评估、实施步骤 |
| `/lcyf-java-developer` | 完整功能开发流程 |
| `/lcyf-code-review` | 全面质量审查 |
| `/lcyf-learn` | 知识库管理 |

### 5 条编码规范

| 规则 | 说明 |
|------|------|
| 00-总则 | 基本原则和强制要求 |
| 01-Java开发规范 | Java/Spring Boot/MyBatis 编码规范 |
| 02-API设计规范 | RESTful API 设计 |
| 03-Git工作流 | 分支策略、提交规范 |
| 04-性能优化 | 数据库、缓存、并发优化 |

### 20+ 个业务领域 Skill

- **基础技能**: java-full-stack、modular-monolith
- **系统模块**: 账号用户权限、组织架构、菜单管理、数据权限、脱敏管理
- **配置管理**: 字典、系统配置、即展、渠道 banner
- **风控管理**: 产品风控、黑名单、白名单
- **外部系统**: 微信、短信、代理人签署合同
- **核心业务**: MGA 业务、中介核心接口、公共运营

---

## 快速开始

```bash
# 1. 进入项目目录
cd /path/to/your/java/project

# 2. 克隆配置
git clone https://github.com/a623556943/lcyf-claude-code.git .claude

# 3. 开始使用（自动化工作流）- 推荐
/lcyf-auto 为 XX 模块添加用户导出功能

# 或单独使用规划/开发命令
/lcyf-plan 为 XX 模块添加用户导出功能
/lcyf-java-developer 实现用户导出功能
```

> 详细说明请参考 [CLAUDE.md](CLAUDE.md) 和 [快速开始](docs/快速开始.md)

---

## 项目结构

```
lcyf-claude-code/
├── agents/                  # 4 个专家 Agent
│   ├── planner.md
│   ├── java-developer.md
│   ├── code-reviewer.md
│   └── knowledge-manager.md
├── commands/                # 5 个智能命令
│   ├── lcyf-auto.md
│   ├── lcyf-plan.md
│   ├── lcyf-java-developer.md
│   ├── lcyf-code-review.md
│   └── lcyf-learn.md
├── rules/                   # 5 条编码规范
│   ├── 00-总则.md
│   ├── 01-Java开发规范.md
│   ├── 02-API设计规范.md
│   ├── 03-Git工作流.md
│   └── 04-性能优化.md
├── skills/                  # 20+ 个业务领域技能
│   ├── java-full-stack/
│   ├── modular-monolith/
│   └── system-*/            # 系统各模块业务技能
├── docs/                    # 文档和知识库
│   ├── 快速开始.md
│   ├── 安装指南.md
│   ├── 知识库架构说明.md
│   ├── 项目级配置说明.md
│   └── knowledge/           # 业务模块知识库
├── hooks/                   # 自动化钩子
├── CLAUDE.md                # 完整配置参考
└── README.md                # 本文件
```

---

## 技术栈支持

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 / 21 | 推荐 Java 21 |
| Spring Boot | 3.x | 最新生产版本 |
| MyBatis-Plus | 3.5.x | ORM 框架 |
| MySQL | 8.x | 关系型数据库 |
| Redis | 7.x | 缓存方案 |
| Dubbo | 3.x | RPC 框架（可选） |

---

## 文档导航

### 快速上手
| 文档 | 说明 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 完整配置和分层架构 |
| [快速开始](docs/快速开始.md) | 3 步快速集成 |
| [安装指南](docs/安装指南.md) | 详细安装说明 |

### 进阶指南
| 文档 | 说明 |
|------|------|
| [项目级配置说明](docs/项目级配置说明.md) | 多项目集成配置 |
| [知识库架构说明](docs/知识库架构说明.md) | 知识库组织方式 |
| [模板变量格式规范](docs/模板变量格式规范.md) | Skill 开发指南 |

### 编码规范
- [00-总则](rules/00-总则.md) - 基本原则和强制要求
- [01-Java开发规范](rules/01-Java开发规范.md) - Java/Spring Boot/MyBatis 编码规范
- [02-API设计规范](rules/02-API设计规范.md) - RESTful API 设计规范
- [03-Git工作流](rules/03-Git工作流.md) - 分支策略、提交规范
- [04-性能优化](rules/04-性能优化.md) - 数据库、缓存、并发优化

### 知识库
- [docs/knowledge](docs/knowledge/) - 系统各模块完整业务文档

---

## 许可证

MIT License

---

**使用 lcyf-claude-code 构建更好的 Java 应用！**
