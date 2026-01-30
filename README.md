# LCYF Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java_17+-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot%203.x-6DB33F?logo=spring-boot&logoColor=white)

**面向 Java/Spring Boot 团队的轻量级智能开发伙伴系统**

> 模块化单体 + 智能 Skills + 自动化工作流 = 高效团队开发

---

## 核心特性

### 3 个专家 Agent

| Agent | 职责 |
|-------|------|
| **planner** | 复杂功能和重构的专业规划专家 |
| **java-developer** | 功能实现、API 开发、代码生成 |
| **code-reviewer** | 代码质量检查、安全审查 |

### 3 个智能命令

| 命令 | 用途 |
|------|------|
| `/lcyf-auto` | 自动化工作流：需求分析 → 规划 → 开发（推荐） |
| `/lcyf-plan` | 需求规划、风险评估、实施步骤 |
| `/lcyf-java-developer` | Java 功能开发、测试、代码审查 |

### 5 条编码规范

| 规则 | 说明 |
|------|------|
| 00-总则 | 基本原则和强制要求 |
| 01-Java开发规范 | Java/Spring Boot/MyBatis 编码规范 |
| 02-API设计规范 | RESTful API 设计 |
| 03-Git工作流 | 分支策略、提交规范 |
| **05-Skills加载工作流** | **[强制]** Skills 自动加载与使用 |

### 80+ 个业务领域 Skill

**智能自动加载**：当任务包含触发词时，系统自动识别并加载对应 skill

- **架构技能**: java-full-stack、modular-monolith
- **系统认证权限**: 用户、菜单、权限、组织、数据权限、数据脱敏
- **系统配置**: 字典、系统配置、参数管理、记账规则、渠道配置
- **风险控制**: 产品风控、黑名单、白名单、风险策略
- **外部集成**: 微信、短信、电子签章、外部系统对接
- **财务费率**: 费率管理、等级管理、费率审核、费率同步、基本法职级
- **财务订单和活动**: 订单管理、供应商活动、渠道活动
- **财务结算**: 结算流程、结算单、差额、收入、佣金
- **产品管理**: 80+ 个细粒度 skills 覆盖产品配置全生命周期
- **保单管理**: 保单、续保、保全、订单、续期、预订单

---

## 快速开始

```bash
# 1. 进入项目目录
cd /path/to/your/java/project

# 2. 克隆配置
git clone https://github.com/a623556943/lcyf-claude-code.git .claude

# 3. 开始使用（自动化工作流） - 推荐
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
├── agents/                      # 3 个专家 Agent
│   ├── planner.md
│   ├── java-developer.md
│   └── code-reviewer.md
├── commands/                    # 3 个智能命令
│   ├── lcyf-auto.md
│   ├── lcyf-plan.md
│   └── lcyf-java-developer.md
├── rules/                       # 5 条编码规范
│   ├── 00-总则.md
│   ├── 01-Java开发规范.md
│   ├── 02-API设计规范.md
│   ├── 03-Git工作流.md
│   └── 05-Skills加载工作流.md
├── skills/                      # 80+ 个业务领域技能（自动加载）
│   ├── java-full-stack/
│   ├── modular-monolith/
│   ├── system-*/                # 系统域（20+ skills）
│   ├── finance-*/               # 财务域（30+ skills）
│   ├── product-*/               # 产品域（20+ skills）
│   └── policy-*/                # 保单域（10+ skills）
├── docs/                        # 文档
│   ├── 快速开始.md
│   ├── 安装指南.md
│   ├── 项目级配置说明.md
│   ├── 知识库架构说明.md
│   └── knowledge/               # 业务模块知识库
├── hooks/                       # 自动化钩子
├── mcp-configs/                 # MCP 服务器配置
├── .claude-skills-config.json   # **[重要]** Skills 注册与自动加载配置
├── CLAUDE.md                    # 完整项目配置参考
└── README.md                    # 本文件
```

---

## 技术栈支持

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 / 21 | 推荐 Java 21 |
| Spring Boot | 3.x | 最新生产版本 |
| Spring Cloud Alibaba | 2025.0.x | Nacos、服务注册 |
| MyBatis-Plus | 3.5.x | ORM 框架 |
| MySQL | 8.x | 关系型数据库 |
| Redis | 7.x | 缓存方案 |
| Dubbo | 3.x | RPC 框架 |

---

## 文档导航

### 快速上手
| 文档 | 说明 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 完整配置、架构说明、项目约定 |
| [快速开始](docs/快速开始.md) | 3 步快速集成 |
| [安装指南](docs/安装指南.md) | 详细安装说明 |

### 进阶指南
| 文档 | 说明 |
|------|------|
| [项目级配置说明](docs/项目级配置说明.md) | 多项目集成配置 |
| [知识库架构说明](docs/知识库架构说明.md) | 知识库组织方式 |

### 核心规则
- **[05-Skills加载工作流](rules/05-Skills加载工作流.md)** - **[强制]** Skills 自动加载与使用
- [00-总则](rules/00-总则.md) - 基本原则和强制要求
- [01-Java开发规范](rules/01-Java开发规范.md) - Java/Spring Boot/MyBatis 编码规范
- [02-API设计规范](rules/02-API设计规范.md) - RESTful API 设计规范
- [03-Git工作流](rules/03-Git工作流.md) - 分支策略、提交规范

---

## 许可证

MIT License

---

**使用 lcyf-claude-code，让 Java 团队开发更高效！**

🚀 [GitHub](https://github.com/a623556943/lcyf-claude-code) | 📚 [文档](docs/) | 💡 [规则](rules/) | 🎯 [Skills](skills/)
