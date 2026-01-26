# 贡献指南

感谢你对 lcyf-claude-code 的关注！本文档说明如何为项目做出贡献。

---

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码风格指南](#代码风格指南)
- [Commit 消息规范](#commit-消息规范)
- [Pull Request 流程](#pull-request-流程)
- [Agent 开发指南](#agent-开发指南)
- [Skill 开发指南](#skill-开发指南)
- [Command 开发指南](#command-开发指南)
- [测试要求](#测试要求)
- [文档更新指南](#文档更新指南)

---

## 行为准则

我们的社区对所有人都开放。为了保持健康的社区，请遵循：

- **相互尊重** - 在代码审查和讨论中保持专业和尊重的态度
- **包容性** - 欢迎所有背景和经验水平的贡献者
- **建设性反馈** - 提供有意义的、有建设性的批评和建议
- **安全第一** - 如果发现安全漏洞，请私密报告，不要在公开 Issue 中讨论

---

## 如何贡献

### 贡献类型

我们接受以下类型的贡献：

| 类型 | 说明 | 优先级 |
|------|------|--------|
| **Bug 修复** | 修复已知问题或缺陷 | 🔴 高 |
| **新功能** | 添加新的 Agent、Skill 或 Command | 🟡 中 |
| **文档改进** | 改进或扩展文档内容 | 🟢 中 |
| **测试增加** | 添加单元测试或集成测试 | 🟡 中 |
| **性能优化** | 优化代码或工作流性能 | 🟢 低 |
| **重构** | 改进代码质量而不改变功能 | 🟢 低 |

### 开始贡献

#### 第一步：Fork 并克隆仓库

```bash
# Fork 仓库（在 GitHub 上）
# 然后克隆到本地
git clone https://github.com/YOUR-USERNAME/lcyf-claude-code.git
cd lcyf-claude-code

# 添加上游仓库
git remote add upstream https://github.com/a623556943/lcyf-claude-code.git
```

#### 第二步：创建开发分支

```bash
# 更新主分支
git fetch upstream
git rebase upstream/master

# 创建功能分支
git checkout -b feature/your-feature-name

# 或 Bug 修复分支
git checkout -b fix/bug-description
```

#### 第三步：进行修改

根据具体的贡献类型（Agent、Skill、Command、文档等）进行修改。

#### 第四步：测试修改

```bash
# 运行现有测试
npm test

# 运行验证脚本
npm run validate

# 运行 Lint 检查（如果配置了）
npm run lint
```

#### 第五步：提交修改

遵循 [Commit 消息规范](#commit-消息规范)。

#### 第六步：推送并创建 Pull Request

```bash
# 推送到你的 Fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

---

## 开发环境设置

### 系统要求

- **Node.js** >= 18.0.0
- **Git** >= 2.30.0
- **npm** >= 8.0.0
- **Claude Code** >= 0.8.0

### 环境安装

```bash
# 1. 检查 Node.js 版本
node --version
npm --version

# 2. 克隆仓库
git clone https://github.com/a623556943/lcyf-claude-code.git
cd lcyf-claude-code

# 3. 安装依赖
npm install

# 4. 验证安装
npm run validate
```

### IDE 推荐配置

**VS Code**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**IntelliJ IDEA**
- 启用 Markdown 插件
- 安装 Code Spell Checker 插件
- 配置代码风格与 `.editorconfig` 一致

---

## 代码风格指南

### Markdown 文件规范

```markdown
# 一级标题（仅用一次，作为文档标题）

## 二级标题（主要章节）

### 三级标题（小节）

**粗体** 用于强调

- 列表项 1
- 列表项 2

```代码块```
用于代码示例
```

| 表头 | 表头 |
|------|------|
| 内容 | 内容 |
```

### JavaScript 代码规范

```javascript
// 使用 const，避免 var
const MY_CONSTANT = 'value';

// 函数使用 camelCase
function myFunctionName() {
  // ...
}

// 类使用 PascalCase
class MyClassName {
  constructor() {
    // ...
  }
}

// 注释清晰明了
// 这是一个简短的注释

/**
 * 这是一个多行注释
 * @param {string} name - 参数说明
 * @returns {boolean} 返回值说明
 */
function example(name) {
  // ...
}
```

### JSON 文件规范

```json
{
  "key": "value",
  "nested": {
    "subKey": "subValue"
  },
  "array": [
    {
      "item": "value"
    }
  ]
}
```

- 使用 2 空格缩进
- 使用双引号
- 避免末尾逗号

### Agent/Skill 文档规范

```markdown
# Agent 名称 / Skill 名称

## 描述
简明扼要的描述

## 职责 / 功能
- 职责 1
- 职责 2

## 工作流程 / 使用方式
具体的使用步骤或工作流程

## 检查项 / 包含内容
- [ ] 检查项 1
- [ ] 检查项 2

## 代码示例
包含使用示例或代码模板

## 最佳实践
关键的最佳实践建议

## 相关资源
链接到相关文档或工具
```

---

## Commit 消息规范

我们采用 **Conventional Commits** 规范：

### 格式

```
<type>: <subject>

<body>

<footer>
```

### 类型 (type)

| 类型 | 说明 |
|------|------|
| **feat** | 新功能 |
| **fix** | Bug 修复 |
| **docs** | 文档变更 |
| **style** | 代码风格变更（不影响功能） |
| **refactor** | 代码重构（不添加功能也不修复 Bug） |
| **test** | 添加或修改测试 |
| **chore** | 构建过程、依赖管理等 |
| **perf** | 性能优化 |

### 示例

```bash
# 新功能
git commit -m "feat: 添加 java-reviewer agent 的安全检查功能"

# Bug 修复
git commit -m "fix: 修复 Rule 文件加载顺序错误导致的冲突问题"

# 文档更新
git commit -m "docs: 更新 README 中的快速开始部分"

# 带详细说明的 Commit
git commit -m "feat: 实现 API 版本控制检查

- 添加版本兼容性验证
- 支持 @Deprecated 注解检测
- 生成版本迁移指南

Closes #123"
```

### Commit 消息最佳实践

- ✅ 使用祈使态：使用 "add" 而不是 "adds" 或 "added"
- ✅ 不要用句号结尾
- ✅ 将主题行限制在 50 个字符以内
- ✅ 详细说明用 72 个字符换行
- ✅ 解释 **为什么** 而不仅仅是 **什么**

---

## Pull Request 流程

### 提交 PR 前的检查清单

- [ ] 已从 `master` 分支创建功能分支
- [ ] 代码遵循项目的代码风格
- [ ] 已运行 `npm test` 确保所有测试通过
- [ ] 已运行 `npm run validate` 验证配置
- [ ] 添加了必要的测试（单元测试或集成测试）
- [ ] 更新了相关文档
- [ ] Commit 消息遵循规范
- [ ] 没有引入不必要的依赖

### PR 模板

```markdown
## 描述
简明扼要的描述本 PR 的目的。

## 修改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] Breaking Change（破坏性更改）
- [ ] 文档更新

## 修改内容
列出具体的修改内容：
- 修改 1
- 修改 2

## 测试方式
说明如何测试这些修改：
1. 步骤 1
2. 步骤 2

## 截图/演示（如适用）
贴图或演示 GIF

## 相关 Issue
Closes #123（如果有）

## 其他说明
任何其他需要说明的地方
```

### PR 审查流程

1. **自动检查**
   - 所有测试必须通过
   - 代码风格检查必须通过

2. **人工审查**
   - 至少一个项目维护者审查
   - 可能需要多个审查者

3. **修改反馈**
   - 根据反馈进行修改
   - 推送修改到同一分支（自动更新 PR）

4. **合并**
   - 审查通过后，维护者合并 PR
   - 自动删除分支

---

## Agent 开发指南

### Agent 文件位置

```
agents/
├── java-reviewer.md
├── api-designer.md
├── db-optimizer.md
├── module-coordinator.md
└── [new-agent].md
```

### Agent 文件结构

```markdown
# Agent 名称

## 描述（必需）
对 Agent 的简明描述，说明其主要用途。

## 职责（必需）
- 职责 1
- 职责 2
- 职责 3

## 工作流程（必需）
详细说明 Agent 的工作流程步骤。

## 检查项（可选）
为代码审查类 Agent 列出检查清单：
- [ ] 检查项 1
- [ ] 检查项 2

## 工具权限（必需）
```json
{
  "allowed_tools": [
    "Read",
    "Grep",
    "Edit"
  ]
}
```

## 相关规范（可选）
参考的规范文件：
- rules/java-coding-standards.md
- rules/security-best-practices.md
```

### Agent 开发步骤

1. **创建 Agent 文件**
   ```bash
   touch agents/my-new-agent.md
   ```

2. **编写 Agent 定义**
   - 遵循上面的文件结构
   - 提供清晰的职责和工作流程

3. **定义权限**
   - 最小权限原则
   - 只声明必需的工具

4. **编写测试**
   ```bash
   touch tests/agents/my-new-agent.test.js
   ```

5. **更新文档**
   - 在 USAGE.md 中添加 Agent 说明
   - 在 README.md 中更新特性列表

6. **提交 PR**
   - 按 PR 流程提交

---

## Skill 开发指南

### Skill 文件位置

```
skills/
├── java-dev/
│   ├── SKILL.md
│   └── [相关文档].md
├── database-design/
│   └── SKILL.md
└── [new-skill]/
    └── SKILL.md
```

### Skill 文件结构

```markdown
# Skill 名称

## 概述
Skill 的概览和使用场景。

## 包含内容
列出 Skill 提供的内容：
- 内容 1
- 内容 2

## 使用场景
描述何时使用这个 Skill：
```bash
# 场景 1
请使用 my-skill...

# 场景 2
我需要...
```

## 内容详解
详细的技术内容。

## 代码示例
实际的代码示例。

## 最佳实践
推荐的做法和反面教材。

## 常见陷阱
容易犯的错误。
```

### Skill 开发步骤

1. **创建 Skill 目录**
   ```bash
   mkdir -p skills/my-new-skill
   ```

2. **创建 SKILL.md**
   - 遵循上面的文件结构
   - 包含丰富的示例和说明

3. **添加支持文档**（可选）
   - 详细说明文件
   - 示例代码文件

4. **测试 Skill**
   ```bash
   npm test
   ```

5. **更新总文档**
   - 在 USAGE.md 中添加 Skill 说明

6. **提交 PR**

---

## Command 开发指南

### Command 文件位置

```
commands/
├── lcyf-new-feature.md
├── lcyf-review.md
├── lcyf-db-review.md
├── lcyf-api-review.md
├── lcyf-module-check.md
└── [new-command].md
```

### Command 文件结构

```markdown
# /command-name - 命令显示名称

## 描述（必需）
命令的简明描述。

## 工作流程（必需）
详细的命令工作流程：
1. 第一步
2. 第二步
3. 第三步

## 权限要求（必需）
```json
{
  "allowed_tools": [
    "Read",
    "Bash",
    "Edit"
  ]
}
```

## 参数（可选）
如果命令接受参数：
- `param1` - 说明
- `param2` - 说明

## 输出示例（可选）
命令的输出示例。

## 相关 Agents
此命令会使用的 Agents：
- Agent 1
- Agent 2

## 最佳实践
使用这个命令的最佳实践。
```

### Command 开发步骤

1. **创建 Command 文件**
   ```bash
   touch commands/my-new-command.md
   ```

2. **编写 Command 定义**
   - 清晰的工作流程
   - 合理的权限声明

3. **测试 Command**
   ```bash
   /my-new-command
   ```

4. **更新文档**
   - 在 USAGE.md 中添加命令说明

5. **提交 PR**

---

## 测试要求

### 单元测试

为新功能编写单元测试：

```javascript
// tests/agents/my-agent.test.js
const fs = require('fs');

describe('MyAgent', () => {
  it('should load agent file correctly', () => {
    const content = fs.readFileSync('agents/my-agent.md', 'utf-8');
    expect(content).toContain('# MyAgent');
    expect(content).toContain('## 职责');
  });

  it('should have required sections', () => {
    const content = fs.readFileSync('agents/my-agent.md', 'utf-8');
    expect(content).toMatch(/## 职责/);
    expect(content).toMatch(/## 工作流程/);
    expect(content).toMatch(/## 工具权限/);
  });
});
```

### 集成测试

测试 Agent/Command/Skill 之间的交互：

```javascript
// tests/integration/workflow.test.js
describe('Workflow Integration', () => {
  it('should execute complete workflow', async () => {
    // 执行完整工作流
    // 验证结果
  });
});
```

### 测试运行

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- tests/agents/my-agent.test.js

# 生成覆盖率报告
npm test -- --coverage
```

### 测试覆盖率要求

- **最低要求**: 80% 覆盖率
- **目标**: 90%+ 覆盖率

---

## 文档更新指南

### 何时更新文档

- [ ] 添加或修改了 Agent
- [ ] 添加或修改了 Skill
- [ ] 添加或修改了 Command
- [ ] 修改了规范或最佳实践
- [ ] 修复了错误或不清楚的说明

### 文档清单

```markdown
## 文档更新检查清单

- [ ] 更新了 README.md（如适用）
- [ ] 更新了 USAGE.md（如适用）
- [ ] 更新了 INSTALLATION.md（如适用）
- [ ] 更新了 FAQ.md（如适用）
- [ ] 更新了 ARCHITECTURE.md（如适用）
- [ ] 添加或修改了相关 Agent/Skill/Command 文档
- [ ] 修正了所有拼写和语法错误
- [ ] 所有代码示例都能正确运行
```

### 文档风格指南

- **简洁明了** - 使用清晰的语言
- **示例丰富** - 提供实际的代码示例
- **逐步说明** - 分步骤说明复杂过程
- **双语** - 标题使用中文，代码保持英文
- **链接完整** - 所有引用都有正确的链接

---

## 常见问题

### 我可以提议新功能吗？

可以！请在 GitHub Issues 中提议，说明：
- 功能的目的和用途
- 解决的问题
- 实现方案（如果有）
- 预期的工作流程

### 我发现了安全漏洞，应该怎么做？

请**不要**在公开 Issue 中报告。而是：

1. 发送邮件到项目维护者
2. 说明漏洞详情和复现步骤
3. 给我们时间修复（通常 30 天）
4. 修复后再公开发布

### 我可以重构现有代码吗？

可以，但请：
- 创建单独的分支
- 保持所有测试通过
- 在 PR 中清晰说明改动的原因
- 不要混合功能添加和重构

---

## 更多帮助

- **Issues**: [GitHub Issues](https://github.com/a623556943/lcyf-claude-code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/a623556943/lcyf-claude-code/discussions)
- **Email**: lcyf-team@example.com

---

感谢你对 lcyf-claude-code 的贡献！🎉
