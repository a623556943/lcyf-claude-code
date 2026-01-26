# LCYF Claude Code v2.0

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Java](https://img.shields.io/badge/-Java_17+-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot%203.x-6DB33F?logo=spring-boot&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-green)

**面向Java/Spring Boot团队的智能开发伙伴系统**

> 💡 **v2.0 革命性更新**: 持续学习引擎、自动验证循环、模块化单体架构支持、团队知识库

---

## 核心特性

### 🤖 8个专家Agent

| Agent | 职责 |
|-------|------|
| 01-规划专家 | 任务分解、执行规划、进度跟踪 |
| 02-架构专家 | 系统设计、技术决策、架构评审 |
| 03-Java开发专家 | 功能实现、API开发、数据库操作 |
| 04-模块协调专家 | 模块依赖分析、边界管理 |
| 05-代码审查专家 | 代码质量、规范检查 |
| 06-安全审查专家 | 安全漏洞检测、OWASP Top 10 |
| 07-测试专家 | TDD实践、覆盖率保障 |
| 08-学习代理 | 模式提取、知识沉淀 |

### 📝 13个智能命令

**功能开发**
- `/lcyf-新功能` - 完整功能开发流程
- `/lcyf-tdd` - 测试驱动开发
- `/lcyf-构建修复` - 修复编译错误
- `/lcyf-重构` - 安全代码重构

**代码审查**
- `/lcyf-代码审查` - 全面质量审查
- `/lcyf-安全扫描` - 安全漏洞检测
- `/lcyf-API审查` - API设计审查
- `/lcyf-数据库审查` - 数据库设计审查

**模块管理**
- `/lcyf-模块检查` - 模块依赖检查

**验证检查**
- `/lcyf-验证` - 全面验证
- `/lcyf-检查点` - 检查点管理

**知识管理**
- `/lcyf-知识管理` - 知识库管理

**智能助手**
- `/lcyf-自动` - 智能命令选择

### 📏 12条编码规范

| 规则 | 说明 |
|------|------|
| 00-总则 | 基本原则和强制要求 |
| 01-安全规范 | 安全编码、敏感信息处理 |
| 02-编码风格 | 代码格式、命名规范 |
| 03-测试要求 | 测试覆盖率、TDD工作流 |
| 04-Git工作流 | 分支策略、提交规范 |
| 05-性能优化 | 数据库、缓存、并发优化 |
| 06-Java编码规范 | Java特定编码标准 |
| 07-SpringBoot最佳实践 | Spring Boot使用规范 |
| 08-MyBatis规范 | MyBatis-Plus使用规范 |
| 09-API设计规范 | RESTful API设计 |
| 10-数据库设计规范 | 表结构、索引设计 |
| 11-模块依赖规范 | 模块化架构依赖规则 |

---

## 快速开始

### 安装

```bash
# 全局安装
npm install -g lcyf-claude-code

# 验证安装
lcyf --version
```

### 初始化项目

```bash
cd /path/to/your/java/project
lcyf init
```

### 开始使用

```
/lcyf-新功能 添加用户导出功能
```

> 📖 详细说明请参考 [快速开始文档](docs/快速开始.md)

---

## 项目结构

```
lcyf-claude-code/
├── agents/              # 8个专家Agent
│   ├── 01-规划专家.md
│   ├── 02-架构专家.md
│   ├── 03-Java开发专家.md
│   ├── 04-模块协调专家.md
│   ├── 05-代码审查专家.md
│   ├── 06-安全审查专家.md
│   ├── 07-测试专家.md
│   └── 08-学习代理.md
├── commands/            # 20个命令
│   ├── lcyf-新功能.md
│   ├── lcyf-代码审查.md
│   ├── lcyf-tdd.md
│   └── ...
├── rules/               # 11条规则
│   ├── 00-总则.md
│   ├── 01-安全规范.md
│   └── ...
├── skills/              # 领域技能
├── templates/           # 代码模板
│   └── java/
│       ├── adapter/Controller.java.template
│       ├── biz/service/Service.java.template
│       └── ...
├── hooks/               # 自动化钩子
│   └── hooks.json
├── core/                # 核心引擎
│   ├── learning-engine/
│   ├── verification-engine/
│   └── orchestrator/
├── docs/                # 文档
│   ├── 快速开始.md
│   ├── 安装指南.md
│   ├── CLI使用指南.md
│   └── ...
└── .lcyf/               # 知识库（项目级）
    ├── config.json
    ├── learned-patterns/
    ├── team-conventions/
    └── instincts/
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

## v2.0 新特性

### 🧠 持续学习引擎

自动从开发过程中学习可复用模式：
- 代码模式提取
- 问题解决方案记录
- 团队约定积累
- 高频模式自动升级为"本能"

### ✅ 验证循环

自动化质量验证：
- 构建检查
- 测试运行
- 安全扫描
- 覆盖率分析

### 🏗️ 模块化单体架构

专为模块化单体设计：
- 模块依赖分析
- 边界检查
- 循环依赖检测
- 跨层调用检查

### 👥 团队知识库

团队知识共享：
- 团队约定同步
- 共享代码模式
- 统一配置管理

---

## 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/快速开始.md) | 5分钟上手指南 |
| [安装指南](docs/安装指南.md) | 详细安装说明 |
| [CLI使用指南](docs/CLI使用指南.md) | 命令行工具 |
| [迁移指南](docs/迁移指南.md) | v1.0到v2.0迁移 |
| [模板变量格式规范](docs/模板变量格式规范.md) | Mustache模板语法 |
| [知识库架构说明](docs/知识库架构说明.md) | 知识库结构 |
| [Agent与Engine职责说明](docs/Agent与Engine职责说明.md) | 架构设计 |

---

## 与v1.0对比

| 方面 | v1.0 | v2.0 |
|------|------|------|
| 架构 | 简单工具集合 | 三层架构 |
| Agents | 4个 | 8个专家 |
| Commands | 5个 | 13个 |
| Rules | 4条 | 12条 |
| 学习能力 | 无 | 持续学习引擎 |
| 验证能力 | 手动 | 自动验证引擎 |
| 模块支持 | 基础 | 深度模块协调 |
| CLI工具 | 无 | 完整CLI |
| 语言 | 英文 | 中文 |

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

**使用 lcyf-claude-code v2.0 构建更好的Java应用！**
