# 架构说明

本文档详细说明 lcyf-claude-code 的系统架构、核心组件和交互方式。

---

## 目录

- [系统概览](#系统概览)
- [核心组件](#核心组件)
- [工作流程](#工作流程)
- [Agent 协作机制](#agent-协作机制)
- [Skill 加载和调用](#skill-加载和调用)
- [Hook 执行流程](#hook-执行流程)
- [扩展点](#扩展点)
- [设计原则](#设计原则)

---

## 系统概览

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                  Claude Code CLI 用户界面                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                   ┌───────▼────────┐
                   │  Command Router │
                   │ /lcyf-new-feature
                   │ /lcyf-review等
                   └───────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐     ┌──────▼──────┐   ┌──────▼──────┐
    │ Agents  │     │   Skills    │   │   Rules    │
    │ Layer   │     │   (TDD等)   │   │ (标准规范)  │
    └────┬────┘     └──────┬──────┘   └──────┬──────┘
         │                  │                  │
    ┌────┴──────────────────┴──────────────────┴────┐
    │          Execution Engine (执行引擎)          │
    │  - Agent 编排                                  │
    │  - Skill 加载                                  │
    │  - Hook 触发                                   │
    └────┬──────────────────┬──────────────────┬────┘
         │                  │                  │
    ┌────▼────┐     ┌──────▼──────┐   ┌──────▼──────┐
    │  Read   │     │  Bash/Edit  │   │  Glob/Grep  │
    │ (文件读取)│     │ (执行/编辑)  │   │ (搜索)      │
    └─────────┘     └─────────────┘   └─────────────┘
         │                  │                  │
    ┌────┴──────────────────┴──────────────────┴────┐
    │            Tools (工具层)                     │
    │  - 文件系统                                    │
    │  - Git                                        │
    │  - 进程执行                                    │
    └──────────────────────────────────────────────┘
```

### 分层架构

| 层级 | 组件 | 职责 |
|------|------|------|
| **UI 层** | Claude Code CLI | 用户交互、命令解析 |
| **路由层** | Command Router | 命令分发、权限验证 |
| **业务层** | Agents、Skills、Rules | 核心业务逻辑 |
| **执行层** | Execution Engine | Agent 编排、Hook 触发 |
| **工具层** | Tools | 文件、进程、搜索等操作 |

---

## 核心组件

### 1. Agents（代理层）

**位置**: `agents/`

**职责**:
- 提供专业的代码审查和设计能力
- 执行特定的开发任务
- 支持可自定义的工作流程

**现有 Agents**:

| Agent | 功能 | 输入 | 输出 |
|-------|------|------|------|
| **java-reviewer** | Java 代码审查 | 源代码、需求 | 审查报告 |
| **api-designer** | API 设计指导 | API 规范需求 | API 设计方案 |
| **db-optimizer** | 数据库优化 | SQL 查询、表设计 | 优化建议 |
| **module-coordinator** | 模块协调 | 模块依赖配置 | 依赖报告 |

**Agent 生命周期**:

```
用户请求
    │
    ▼
检查 Agent 定义 ✓
    │
    ▼
加载 Agent 配置 ✓
    │
    ▼
检查权限 ✓
    │
    ▼
执行 Agent ✓
    │
    ▼
生成报告/建议
```

### 2. Skills（技能库）

**位置**: `skills/`

**职责**:
- 提供可复用的技能和知识
- 支持领域特定的开发指导
- 包含最佳实践和模式

**现有 Skills**:

| Skill | 内容 | 适用场景 |
|-------|------|---------|
| **java-dev** | Spring Boot 开发 | Java 项目开发 |
| **database-design** | 数据库设计 | 数据库相关任务 |
| **api-design** | API 设计规范 | API 开发 |
| **module-design** | 模块设计规范 | 模块化项目 |
| **lcyf-workflow** | lcyf 专属工作流 | 所有项目 |

**Skill 加载流程**:

```
需求分析
    │
    ▼
关键词匹配 → 选择相关 Skills
    │
    ▼
加载 Skill 文件
    │
    ▼
注入上下文信息
    │
    ▼
提供建议/指导
```

### 3. Rules（规范库）

**位置**: `rules/`

**职责**:
- 定义代码规范和最佳实践
- 提供强制性的检查清单
- 支持项目级别的规范定制

**现有 Rules**:

| Rule | 规范内容 |
|------|---------|
| **agents.md** | Agent 编排规范 |
| **coding-style.md** | 代码风格规范 |
| **git-workflow.md** | Git 工作流规范 |
| **security.md** | 安全检查规范 |
| **testing.md** | 测试覆盖率规范 |
| **hooks.md** | Hook 系统规范 |
| **patterns.md** | 设计模式规范 |
| **performance.md** | 性能优化规范 |

**Rule 应用**:

```
代码编辑
    │
    ▼
触发 Post-Edit Hook
    │
    ▼
加载相关 Rules
    │
    ▼
检查违规项
    │
    ▼
生成警告/错误 (可选)
```

### 4. Commands（命令系统）

**位置**: `commands/`

**职责**:
- 提供快捷的工作流命令
- 协调 Agents 和 Skills
- 自动化常见开发任务

**现有 Commands**:

| Command | 工作流程 | 涉及 Agent |
|---------|---------|-----------|
| **/lcyf-new-feature** | 需求→方案→实现→审查 | planner, tdd-guide, code-reviewer |
| **/lcyf-review** | 代码审查 | java-reviewer |
| **/lcyf-db-review** | 数据库审查 | db-optimizer |
| **/lcyf-api-review** | API 审查 | api-designer |
| **/lcyf-module-check** | 模块检查 | module-coordinator |

**Command 执行流程**:

```
用户输入命令
    │
    ▼
解析命令参数
    │
    ▼
初始化工作流上下文
    │
    ▼
步骤 1: 需求分析
    ├→ 加载相关 Rules
    ├→ 调用相关 Agents
    └→ 收集信息
    │
    ▼
步骤 2: 方案设计
    ├→ 应用 Skills 知识
    ├→ 生成设计文档
    └→ 获取用户确认
    │
    ▼
步骤 3: 实现/审查
    ├→ 执行核心任务
    ├→ 触发 Hooks
    └→ 生成报告
    │
    ▼
完成并输出结果
```

### 5. Hooks（钩子系统）

**位置**: `hooks/`

**职责**:
- 在特定事件触发自动化操作
- 支持 Pre-commit、Post-edit 等钩子
- 实现自动化质量检查

**钩子类型**:

| 钩子 | 触发时机 | 示例操作 |
|------|---------|---------|
| **PreToolUse** | 执行工具前 | 参数验证、权限检查 |
| **PostToolUse** | 工具执行后 | 代码格式化、验证 |
| **Stop** | 会话结束 | 最终验证、清理 |

**Hook 执行流程**:

```
触发事件（如 git commit）
    │
    ▼
匹配 PreToolUse Hook
    │
    ├→ 执行钩子脚本
    ├→ 验证结果
    └→ 中断或继续
    │
    ▼
执行主要操作
    │
    ▼
匹配 PostToolUse Hook
    │
    ├→ 执行钩子脚本
    └→ 格式化/验证
    │
    ▼
完成操作
```

---

## 工作流程

### 新功能开发完整工作流

```
用户请求新功能
    │
    ▼
【阶段 1: 需求设计】
├→ 触发 /lcyf-new-feature 命令
├→ 收集需求信息
├→ 使用 lcyf-workflow skill
├→ 生成 EARS 需求文档
└→ 获取用户确认
    │
    ▼
【阶段 2: 技术方案设计】
├→ 调用 api-designer agent
├→ 调用 db-optimizer agent
├→ 调用 architecture agent（计划中）
├→ 生成 API 设计方案
├→ 生成 数据库设计方案
├→ 生成 缓存策略
└→ 获取用户确认
    │
    ▼
【阶段 3: 任务拆分】
├→ 调用 planner agent
├→ 识别独立任务
├→ 计算任务依赖
├→ 生成任务清单
└→ 获取用户确认
    │
    ▼
【阶段 4: TDD 实现】
├→ 调用 tdd-guide agent
├→ 编写测试（RED）
├→ 实现代码（GREEN）
├→ 重构代码（IMPROVE）
├→ 触发 Post-Edit Hook
│  └→ 运行格式化（Prettier）
│  └→ 运行 TypeScript 检查
└→ 验证测试通过
    │
    ▼
【阶段 5: 代码审查】
├→ 调用 java-reviewer agent
├→ 检查代码规范
├→ 生成审查报告
└→ 获取反馈并修复
    │
    ▼
【阶段 6: 提交和文档】
├→ 触发 Pre-commit Hook
│  └→ 运行安全检查
│  └→ 检查测试覆盖率
├→ Git commit
├→ 更新文档
└→ 完成
```

---

## Agent 协作机制

### Agent 并行执行

当多个 Agent 可以独立工作时，使用并行执行：

```
需求
 │
 ├→ Agent A (API 设计)
 ├→ Agent B (数据库设计)
 └→ Agent C (缓存设计)
    │
    └→ 等待所有 Agent 完成
    │
    ▼
汇总结果
```

**实现**:

```javascript
// 并行调用多个 agent
const results = await Promise.all([
  callAgent('api-designer', input),
  callAgent('db-optimizer', input),
  callAgent('module-coordinator', input)
]);
```

### Agent 顺序执行

当 Agent 之间有依赖关系时，按顺序执行：

```
Agent 1 (需求分析)
    │
    ▼
Agent 2 (方案设计，依赖 Agent 1 的输出)
    │
    ▼
Agent 3 (实现指导，依赖 Agent 2 的输出)
```

### Agent 权限隔离

每个 Agent 有独立的工具权限：

```
java-reviewer Agent
├→ Read (读取文件)
├→ Grep (搜索代码)
├→ Bash (执行检查脚本)
└→ ❌ Write/Edit (禁止修改)

code-reviewer Agent
├→ Read
├→ Grep
├→ Edit (修改代码)
└→ Bash (格式化)
```

---

## Skill 加载和调用

### Skill 自动加载

```
项目启动
    │
    ▼
扫描 skills/ 目录
    │
    ▼
按优先级加载 Skill 文件
├→ java-dev (Java 项目自动加载)
├→ database-design (包含 Mapper 时加载)
├→ api-design (包含 Controller 时加载)
├→ module-design (多模块项目加载)
└→ lcyf-workflow (始终加载)
    │
    ▼
注入到 Claude Code 上下文
```

### Skill 上下文注入

```
当用户提问
    │
    ▼
分析关键词
    │
    ▼
匹配相关 Skills
    │
    ▼
提取 Skill 内容
    │
    ▼
合并到提示信息中
    │
    ▼
提供建议
```

---

## Hook 执行流程

### Pre-commit Hook 流程

```
用户执行 git commit
    │
    ▼
Claude Code 拦截
    │
    ▼
匹配 PreToolUse Hook
    │
    ├→ 运行安全检查
    │  ├─ SQL 注入检查
    │  ├─ XSS 检查
    │  └─ 密钥检查
    │
    ├→ 检查测试覆盖率
    │  ├─ 运行 npm test
    │  └─ 验证覆盖率 >= 80%
    │
    ├→ 检查 Commit 消息格式
    │  └─ 验证 Conventional Commits
    │
    └→ 所有检查通过？
       ├─ YES → 继续提交
       └─ NO  → 中止并报错
```

### Post-edit Hook 流程

```
用户编辑文件
    │
    ▼
文件保存
    │
    ▼
匹配 PostToolUse Hook
    │
    ├→ 如果是 .ts/.tsx 文件
    │  └─ 运行 TypeScript 检查
    │
    ├→ 如果是 .js/.jsx 文件
    │  └─ 运行 Prettier 格式化
    │
    ├→ 如果包含 console.log
    │  └─ 显示警告
    │
    └─ 验证无语法错误
```

---

## 扩展点

### 1. 添加新 Agent

**扩展点**: `agents/` 目录

```markdown
# 创建新 Agent
1. 在 agents/ 下创建 .md 文件
2. 定义职责和工作流程
3. 声明需要的工具权限
4. 更新文档
```

### 2. 添加新 Skill

**扩展点**: `skills/` 目录

```markdown
# 创建新 Skill
1. 在 skills/ 下创建目录
2. 创建 SKILL.md 文件
3. 添加详细内容
4. 在启动时自动加载
```

### 3. 添加新 Rule

**扩展点**: `rules/` 目录

```markdown
# 创建新 Rule
1. 在 rules/ 下创建 .md 文件
2. 定义规范和检查清单
3. 提供代码示例
4. 在 Agents 中引用
```

### 4. 添加新 Command

**扩展点**: `commands/` 目录

```markdown
# 创建新 Command
1. 在 commands/ 下创建 .md 文件
2. 定义工作流程和步骤
3. 关联相关 Agents
4. 更新文档
```

### 5. 添加新 Hook

**扩展点**: `hooks/hooks.json`

```json
{
  "hooks": [
    {
      "type": "PreToolUse",
      "matcher": "tool == \"Bash\" && input.contains(\"npm test\")",
      "actions": [
        {
          "type": "validate",
          "command": "check-test-coverage"
        }
      ]
    }
  ]
}
```

---

## 设计原则

### 1. 最小权限原则

- 每个 Agent 只声明必需的工具权限
- 禁止不必要的 Read、Write、Bash 权限
- 使用 Allow-list 而非 Deny-list

### 2. 单一职责原则

- 每个 Agent 专注于一个领域
- java-reviewer 只审查代码
- api-designer 只设计 API
- 不重复功能

### 3. 可复用设计

- Skills 应该可被多个 Agents 使用
- Rules 应该可被多个项目应用
- Commands 应该可以组合使用

### 4. 渐进式工作流

```
简单任务
    │
    ▼
使用 /lcyf-review
    │
中等复杂度任务
    │
    ▼
使用 /lcyf-new-feature
    │
复杂项目
    │
    ▼
自定义工作流组合
```

### 5. 明确的数据流

```
输入（用户需求）
    │
    ▼
处理（Agents、Skills）
    │
    ▼
输出（建议、报告）
    │
    ▼
反馈（用户确认）
```

### 6. 错误优先策略

- 宁可报告过多，也不放过问题
- Critical 问题必须报告
- Warning 问题推荐解决
- Suggestion 问题作为参考

---

## 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| **Node.js** | 脚本执行环境 | 18.0.0+ |
| **npm** | 包管理 | 8.0.0+ |
| **Claude Code** | 命令行工具 | 0.8.0+ |
| **Markdown** | 文档格式 | CommonMark |
| **JSON** | 配置格式 | JSON5 |

---

## 性能考虑

### 优化策略

1. **并行执行**
   - 独立的 Agents 并行运行
   - 减少总的执行时间

2. **懒加载**
   - Skills 按需加载
   - Rules 按项目加载

3. **缓存**
   - 缓存 Agent 结果
   - 缓存 Rule 检查结果

4. **增量处理**
   - 只处理变更的文件
   - 使用 git diff 识别变更

---

## 安全考虑

### 权限管理

- ✅ 每个 Agent 的工具权限单独声明
- ✅ 不允许执行任意 Shell 命令
- ✅ 敏感操作需要明确确认

### 敏感数据

- ✅ 不在日志中记录密钥
- ✅ 配置文件中使用环境变量
- ✅ 代码审查中检查硬编码密钥

---

## 可扩展性

### 支持的扩展方式

1. **添加新 Agents** - 提供新的分析和建议能力
2. **添加新 Skills** - 提供新的领域知识
3. **添加新 Rules** - 添加新的检查规范
4. **添加新 Commands** - 提供新的工作流程
5. **自定义 Hooks** - 添加新的自动化操作

### 向后兼容性

- ✅ 新 Agent 不影响现有 Agents
- ✅ 新 Rule 不破坏现有项目
- ✅ 新 Skill 不强制所有项目加载
- ✅ 支持版本控制和迁移指南

---

## 下一步

- [安装指南](docs/INSTALLATION.md) - 如何安装
- [使用指南](docs/USAGE.md) - 如何使用
- [开发指南](CONTRIBUTING.md) - 如何扩展
- [FAQ](docs/FAQ.md) - 常见问题

---

**架构文档最后更新**: 2026-01-26
