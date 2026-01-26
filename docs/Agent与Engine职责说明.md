# Agent 与 Engine 职责说明

## 概述

lcyf-claude-code v2.0 采用 **Agent + Engine** 双层架构设计：

- **Engine（引擎）** - 底层实现，提供核心算法和数据处理能力
- **Agent（代理）** - 高层调度，负责决策、编排和用户交互

这种设计实现了关注点分离，使系统更加模块化和可维护。

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户交互层                              │
│                    (Commands/CLI)                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent 层（高层调度）                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 规划专家 │ │ 架构专家 │ │Java专家  │ │ 学习代理 │ ...   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│       决策        设计        实现        学习               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Engine 层（底层实现）                     │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ Learning      │ │ Verification  │ │ Orchestrator  │     │
│  │ Engine        │ │ Engine        │ │ Engine        │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│       算法            检查               编排               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       数据层                                 │
│              (知识库 / 配置 / 会话历史)                       │
└─────────────────────────────────────────────────────────────┘
```

## Engine 详解

### 1. Learning Engine（学习引擎）

**位置**: `core/learning-engine/`

**职责**: 提供模式识别和知识管理的底层能力

```
learning-engine/
├── pattern-extractor.js   # 模式提取算法
├── knowledge-base.js      # 知识库存储管理
└── instinct-builder.js    # 本能构建器
```

#### 核心功能

**pattern-extractor.js**
```javascript
/**
 * 从会话中提取可复用的模式
 *
 * 输入: 会话记录（代码变更、命令、对话）
 * 输出: 结构化的模式对象
 */
export function extractPatterns(session) {
  // 1. 解析会话内容
  // 2. 识别重复出现的代码模式
  // 3. 提取问题-解决方案对
  // 4. 计算模式置信度
  // 5. 返回模式列表
}
```

**knowledge-base.js**
```javascript
/**
 * 知识库CRUD操作
 */
export const KnowledgeBase = {
  // 存储模式
  store(pattern) {},

  // 检索相似模式
  search(query, options) {},

  // 更新模式频率
  updateFrequency(patternId) {},

  // 清理过期模式
  cleanup(retentionDays) {}
};
```

**instinct-builder.js**
```javascript
/**
 * 将高频模式升级为本能
 *
 * 本能 = 高置信度 + 高频率的模式
 * 本能会在新会话中自动应用
 */
export function buildInstincts(patterns) {
  // 1. 筛选高频模式（频率 > 阈值）
  // 2. 验证模式质量
  // 3. 生成本能规则
  // 4. 存储到 instincts/
}
```

### 2. Verification Engine（验证引擎）

**位置**: `core/verification-engine/`

**职责**: 提供代码质量检查的底层能力

```
verification-engine/
├── quality-checker.js     # 代码质量检查
├── security-scanner.js    # 安全漏洞扫描
└── coverage-analyzer.js   # 测试覆盖率分析
```

#### 核心功能

**quality-checker.js**
```javascript
/**
 * 执行代码质量检查
 */
export async function checkQuality(options) {
  const results = {
    build: await runBuild(),
    compile: await runCompile(),
    lint: await runLint(),
    tests: await runTests()
  };
  return analyzeResults(results);
}
```

**security-scanner.js**
```javascript
/**
 * 扫描安全漏洞
 */
export function scanSecurity(files) {
  const issues = [];

  // 检查硬编码密钥
  issues.push(...checkHardcodedSecrets(files));

  // 检查SQL注入
  issues.push(...checkSqlInjection(files));

  // 检查XSS风险
  issues.push(...checkXssRisk(files));

  return issues;
}
```

**coverage-analyzer.js**
```javascript
/**
 * 分析测试覆盖率
 */
export async function analyzeCoverage(projectPath) {
  // 运行覆盖率工具
  const report = await runJacoco(projectPath);

  // 解析报告
  const coverage = parseReport(report);

  // 检查是否达标
  const passed = coverage.overall >= 80;

  return { coverage, passed, suggestions };
}
```

### 3. Orchestrator Engine（编排引擎）

**位置**: `core/orchestrator/`

**职责**: 提供任务编排和并行执行的底层能力

```
orchestrator/
├── parallel-executor.js   # 并行任务执行
└── worktree-manager.js    # Git worktree管理
```

#### 核心功能

**parallel-executor.js**
```javascript
/**
 * 并行执行多个任务
 */
export async function executeParallel(tasks, options) {
  const { maxConcurrency = 3 } = options;

  // 创建任务队列
  const queue = new TaskQueue(maxConcurrency);

  // 添加任务
  tasks.forEach(task => queue.add(task));

  // 执行并收集结果
  return await queue.run();
}
```

**worktree-manager.js**
```javascript
/**
 * 管理Git worktrees实现隔离开发
 */
export const WorktreeManager = {
  // 创建worktree
  create(branchName, path) {},

  // 列出worktrees
  list() {},

  // 删除worktree
  remove(path) {},

  // 在worktree中执行命令
  exec(path, command) {}
};
```

## Agent 详解

### Agent 与 Engine 的关系

```
Agent           调用           Engine
-----           ----           ------
08-学习代理  →  决定何时学习  →  learning-engine
07-测试专家  →  决定测试策略  →  verification-engine
01-规划专家  →  决定任务分配  →  orchestrator
```

### 1. 08-学习代理

**位置**: `agents/08-学习代理.md`

**职责**: 高层学习决策和知识应用

```markdown
# 学习代理

## 职责
1. 决定何时触发学习（会话结束、重要操作后）
2. 选择学习目标（哪些模式值得学习）
3. 评估学习质量（模式是否有效）
4. 应用学习结果（在新会话中使用）
5. 与用户交互（询问是否保存模式）

## 调用Learning Engine
- 提取模式: learning-engine.extractPatterns()
- 存储知识: learning-engine.store()
- 检索知识: learning-engine.search()
- 构建本能: learning-engine.buildInstincts()

## 决策流程
1. 会话结束时，评估是否有可学习内容
2. 调用Engine提取模式
3. 评估模式质量和通用性
4. 决定是否存储
5. 高频模式自动升级为本能
```

### 2. 07-测试专家

**位置**: `agents/07-测试专家.md`

**职责**: 高层测试策略和质量把控

```markdown
# 测试专家

## 职责
1. 制定测试策略（单元/集成/E2E比例）
2. 决定测试优先级（关键路径优先）
3. 评估测试质量（覆盖率、有效性）
4. 指导TDD实践

## 调用Verification Engine
- 运行测试: verification-engine.runTests()
- 分析覆盖率: verification-engine.analyzeCoverage()
- 检查质量: verification-engine.checkQuality()

## 决策流程
1. 分析需求，确定测试策略
2. 调用Engine执行测试
3. 分析结果，提出改进建议
4. 验证测试覆盖率达标
```

### 3. 其他Agent与Engine的关系

| Agent | 主要调用的Engine | 职责 |
|-------|------------------|------|
| 01-规划专家 | orchestrator | 任务分解和分配 |
| 02-架构专家 | - | 纯决策，不依赖Engine |
| 03-Java开发专家 | - | 纯开发，不依赖Engine |
| 04-模块协调专家 | verification-engine | 模块依赖分析 |
| 05-代码审查专家 | verification-engine | 质量检查 |
| 06-安全审查专家 | verification-engine | 安全扫描 |
| 07-测试专家 | verification-engine | 测试和覆盖率 |
| 08-学习代理 | learning-engine | 模式学习 |

## 协作流程示例

### 示例1: 新功能开发 + 自动学习

```
用户: /lcyf-新功能 添加用户登录

1. 01-规划专家（决策）
   ├── 分析需求
   ├── 拆分任务
   └── 分配给其他Agent

2. 03-Java开发专家（执行）
   ├── 编写代码
   └── 实现功能

3. 07-测试专家（验证）
   ├── 调用 verification-engine.checkQuality()
   ├── 调用 verification-engine.analyzeCoverage()
   └── 确认质量达标

4. 05-代码审查专家（审查）
   ├── 调用 verification-engine.runLint()
   └── 提出改进建议

5. 08-学习代理（学习）
   ├── 调用 learning-engine.extractPatterns()
   ├── 发现"JWT认证模式"
   ├── 评估模式通用性
   └── 存储到知识库

会话结束后:
- 知识库新增: "JWT登录认证模式"
- 本能更新: "认证相关代码需要安全审查"
```

### 示例2: 代码审查 + 安全扫描

```
用户: /lcyf-代码审查

1. 05-代码审查专家（主导）
   └── 调用 verification-engine.checkQuality()
       ├── build检查
       ├── lint检查
       └── 代码规范检查

2. 06-安全审查专家（协作）
   └── 调用 verification-engine.scanSecurity()
       ├── 硬编码密钥检查
       ├── SQL注入检查
       └── XSS风险检查

3. 05-代码审查专家（汇总）
   └── 生成审查报告
```

## 扩展Engine

如果需要添加新的Engine：

### 1. 创建Engine目录

```bash
mkdir -p core/new-engine
```

### 2. 实现核心功能

```javascript
// core/new-engine/index.js
export const NewEngine = {
  // 实现具体功能
};
```

### 3. 创建对应Agent

```markdown
<!-- agents/xx-新专家.md -->
# 新专家

## 职责
...

## 调用New Engine
- 功能1: new-engine.func1()
- 功能2: new-engine.func2()
```

### 4. 注册到系统

更新 `plugin.json` 的 components.core 配置。

## 最佳实践

### Engine 设计原则

1. **单一职责**: 每个Engine只负责一类功能
2. **无状态**: Engine不保存状态，状态由调用方管理
3. **可测试**: 所有功能都应该可单独测试
4. **可配置**: 通过参数控制行为，不硬编码

### Agent 设计原则

1. **高层决策**: Agent负责"做什么"，Engine负责"怎么做"
2. **编排协调**: Agent可以协调多个Engine
3. **用户交互**: 需要用户确认的决策由Agent处理
4. **上下文感知**: Agent理解业务上下文，做出合理决策

### 避免的反模式

❌ **Agent直接实现底层逻辑**
```markdown
# 错误: Agent包含算法实现
## 实现
1. 解析代码AST
2. 匹配模式规则
3. 计算相似度
```

✅ **Agent调用Engine**
```markdown
# 正确: Agent调用Engine
## 调用Engine
- learning-engine.extractPatterns()
```

❌ **Engine做决策**
```javascript
// 错误: Engine决定是否保存
if (pattern.isGood) {
  this.store(pattern);
}
```

✅ **Engine只执行**
```javascript
// 正确: Engine只提供能力
export function extractPatterns(session) {
  return patterns; // 返回结果，由Agent决定
}
```

## 总结

| 层级 | 职责 | 关注点 |
|------|------|--------|
| Agent | 决策、编排、交互 | 做什么、何时做、为什么做 |
| Engine | 算法、处理、执行 | 怎么做、做多快、做多好 |

这种分离使得：
- Agent可以灵活组合不同Engine
- Engine可以独立优化和测试
- 系统更易于维护和扩展
