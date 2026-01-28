# LCYF Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java_17+-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot%203.x-6DB33F?logo=spring-boot&logoColor=white)

**面向 Java/Spring Boot 团队的轻量级智能开发伙伴系统**

> 自动化工作流、代码审查、知识管理一体化解决方案

---

## 核心特性

### 5 个专家 Agent

| Agent | 职责 |
|-------|------|
| planner | 任务分解、执行规划 |
| architect | 系统设计、技术决策 |
| java-developer | 功能实现、API 开发 |
| code-reviewer | 代码质量检查 |
| knowledge-manager | 知识提取、模式积累 |

### 3 个智能命令

| 命令 | 用途 |
|------|------|
| `/lcyf-new-feature` | 完整功能开发流程 |
| `/lcyf-code-review` | 全面质量审查 |
| `/lcyf-learn` | 知识库管理 |

### 8 条编码规范

| 规则 | 说明 |
|------|------|
| 00-总则 | 基本原则和强制要求 |
| 02-编码风格 | 代码格式、命名规范 |
| 04-Git工作流 | 分支策略、提交规范 |
| 05-性能优化 | 数据库、缓存、并发优化 |
| 06-Java编码规范 | Java 特定编码标准 |
| 07-SpringBoot最佳实践 | Spring Boot 使用规范 |
| 08-MyBatis规范 | MyBatis-Plus 使用规范 |
| 09-API设计规范 | RESTful API 设计 |

---

## 快速开始

```bash
# 1. 进入项目目录
cd /path/to/your/java/project

# 2. 克隆配置
git clone https://github.com/a623556943/lcyf-claude-code.git .claude

# 3. 开始使用
/lcyf-new-feature 添加用户导出功能
```

> 详细说明请参考 [CLAUDE.md](CLAUDE.md)

---

## 项目结构

```
lcyf-claude-code/
├── agents/              # 5 个专家 Agent
├── commands/            # 3 个智能命令
├── rules/               # 8 条编码规范
├── skills/              # 2 个领域技能
│   ├── java-full-stack/
│   └── modular-monolith/
├── hooks/               # 自动化钩子
├── docs/                # 文档
└── CLAUDE.md            # 完整配置参考
```

---

## 技术栈支持

| 技术 | 版本 |
|------|------|
| Java | 17 / 21 |
| Spring Boot | 3.x |
| MyBatis-Plus | 3.5.x |
| MySQL | 8.x |
| Redis | 7.x |

---

## 文档

### 核心文档
| 文档 | 说明 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 完整配置和使用说明 |
| [快速开始](docs/快速开始.md) | 3 步上手 |
| [安装指南](docs/安装指南.md) | 详细安装说明 |

---

## 许可证

MIT License

---

**使用 lcyf-claude-code 构建更好的 Java 应用！**
