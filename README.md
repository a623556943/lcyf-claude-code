# LCYF Claude Code v2.1

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java_17+-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot%203.x-6DB33F?logo=spring-boot&logoColor=white)
![Version](https://img.shields.io/badge/version-2.1.0-green)

**面向Java/Spring Boot团队的轻量级智能开发伙伴系统**

> v2.1 轻量化版本: 聚焦核心功能，移除冗余模块，保持简洁高效

---

## 核心特性

### 5个专家Agent

| Agent | 职责 |
|-------|------|
| planner | 任务分解、执行规划、进度跟踪 |
| architect | 系统设计、技术决策、架构评审 |
| java-developer | 功能实现、API开发、数据库操作 |
| code-reviewer | 代码质量、规范检查 |
| knowledge-manager | 知识提取、本能升级、模式积累 |

### 4个智能命令

| 命令 | 用途 |
|------|------|
| `/lcyf-new-feature` | 完整功能开发流程 |
| `/lcyf-code-review` | 全面质量审查 |
| `/lcyf-build-fix` | 修复编译错误 |
| `/lcyf-learn` | 知识库管理 |

### 8条编码规范

| 规则 | 说明 |
|------|------|
| 00-总则 | 基本原则和强制要求 |
| 02-编码风格 | 代码格式、命名规范 |
| 04-Git工作流 | 分支策略、提交规范 |
| 05-性能优化 | 数据库、缓存、并发优化 |
| 06-Java编码规范 | Java特定编码标准 |
| 07-SpringBoot最佳实践 | Spring Boot使用规范 |
| 08-MyBatis规范 | MyBatis-Plus使用规范 |
| 09-API设计规范 | RESTful API设计 |

---

## 快速开始

### 3 步安装

```bash
# 1. 进入项目目录
cd /path/to/your/java/project

# 2. 克隆配置
git clone https://github.com/a623556943/lcyf-claude-code.git .claude

# 3. 开始使用
/lcyf-new-feature 添加用户导出功能
```

> 详细说明请参考 [快速开始文档](docs/快速开始.md)

---

## 项目结构

```
lcyf-claude-code/
├── agents/              # 5个专家Agent
│   ├── planner.md
│   ├── architect.md
│   ├── java-developer.md
│   ├── code-reviewer.md
│   └── knowledge-manager.md
├── commands/            # 4个命令
│   ├── lcyf-new-feature.md
│   ├── lcyf-code-review.md
│   ├── lcyf-build-fix.md
│   └── lcyf-learn.md
├── rules/               # 8条规则
│   ├── 00-总则.md
│   ├── 02-编码风格.md
│   ├── 04-Git工作流.md
│   ├── 05-性能优化.md
│   ├── 06-Java编码规范.md
│   ├── 07-SpringBoot最佳实践.md
│   ├── 08-MyBatis规范.md
│   └── 09-API设计规范.md
├── skills/              # 4个领域技能
│   ├── java-full-stack/
│   ├── modular-monolith/
│   ├── continuous-learning/
│   └── workflows/
├── hooks/               # 自动化钩子
│   └── hooks.json
├── docs/                # 文档
├── README.md
└── CLAUDE.md
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
| Maven/Gradle | 3.8+ / 8.0+ |

---

## v2.1 特性

### 轻量化设计

专注于核心功能:
- 4个核心命令（原13个）
- 5个专家Agent（原6个）
- 4个领域技能（原7个）
- 8条编码规范（原12条）

### 知识管理

自动从开发过程中学习可复用模式：
- 代码模式提取
- 问题解决方案记录
- 团队约定积累
- 高频模式自动升级为"本能"

### 模块化单体架构

专为模块化单体设计：
- 模块依赖分析
- 边界检查
- 循环依赖检测

---

## 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/快速开始.md) | 3 步上手 |
| [安装指南](docs/安装指南.md) | 详细安装说明 |
| [知识库架构](docs/知识库架构说明.md) | 知识管理机制 |
| [模板变量格式](docs/模板变量格式规范.md) | Mustache 模板语法 |

---

## 贡献

欢迎贡献！请参考 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 许可证

MIT License

---

## 支持

- **Issues**: [提交问题](https://github.com/a623556943/lcyf-claude-code/issues)
- **文档**: [查看文档](docs/)

---

**使用 lcyf-claude-code v2.1 构建更好的Java应用！**
