# 安装指南

本文档详细说明如何安装和配置 lcyf-claude-code。

---

## 系统要求

### 必需
- **Node.js** >= 18.0.0
- **Claude Code CLI** >= 0.8.0
- **Git**

### 推荐
- **Java** 17+
- **Maven** 或 **Gradle**
- **IDE**: IntelliJ IDEA / VS Code

---

## 安装方式

### 方式 1: 本地安装（推荐）

适合需要自定义配置或离线使用的场景。

#### 步骤 1: 克隆仓库

```bash
git clone https://github.com/a623556943/lcyf-claude-code.git
cd lcyf-claude-code
```

#### 步骤 2: 安装依赖

```bash
npm install
```

#### 步骤 3: 验证安装

```bash
# 运行测试
npm test

# 验证配置
npm run validate
```

#### 步骤 4: 初始化项目配置

```bash
# 为 lcyf 项目初始化配置
node scripts/setup/init-project.js "D:\code project2"
```

这将：
- 在项目根目录创建 `.claude/` 目录
- 生成 `.claude/CLAUDE.md` 配置文件
- 创建 `.claude/contexts/` 上下文目录
- 链接 lcyf-claude-code 组件

---

### 方式 2: Claude Code Plugin 安装

适合快速安装和自动更新的场景。

#### 步骤 1: 添加 Marketplace

```bash
# 在 Claude Code 中执行
/plugin marketplace add https://github.com/a623556943/lcyf-claude-code
```

或者手动编辑 `~/.claude/settings.json`：

```json
{
  "extraKnownMarketplaces": {
    "lcyf-claude-code": {
      "source": {
        "type": "github",
        "url": "https://github.com/a623556943/lcyf-claude-code"
      }
    }
  }
}
```

#### 步骤 2: 安装 Plugin

```bash
/plugin install lcyf-claude-code
```

或者在 `~/.claude/settings.json` 中启用：

```json
{
  "enabledPlugins": {
    "lcyf-claude-code": true
  }
}
```

#### 步骤 3: 重启 Claude Code

```bash
# 重新加载配置
/reload
```

---

## 项目集成

### 为现有项目启用 lcyf-claude-code

#### 步骤 1: 创建项目配置

在项目根目录创建 `.claude/CLAUDE.md`：

```markdown
# lcyf Project Configuration

使用 lcyf-claude-code 工具链进行开发

## 项目信息
- **名称**: lcyf-module-xxx
- **技术栈**: Java 17 / Spring Boot 3.5.x / Mybatis-plus 3.x
- **数据库**: MySQL 8.0 + Redis 7.x
- **架构**: 微服务

## 开发工作流

1. 新功能开发: `/lcyf-new-feature`
2. 代码审查: `/lcyf-review`
3. 数据库审查: `/lcyf-db-review`
4. API 审查: `/lcyf-api-review`
5. 模块依赖检查: `/lcyf-module-check`

## 编码规范

参考 lcyf-claude-code 的 rules:
- Java 编码规范
- Spring Boot 最佳实践
- 数据库设计规则
- API 设计规则
```

#### 步骤 2: 创建上下文目录

```bash
mkdir -p .claude/contexts
```

#### 步骤 3: 配置 Git 忽略

在项目 `.gitignore` 中添加：

```gitignore
# Claude Code
.claude/local/
.claude/*.log
```

---

## 配置验证

### 检查 Plugin 状态

```bash
# 列出已安装的 plugins
/plugin list

# 检查 lcyf-claude-code 是否已启用
/plugin status lcyf-claude-code
```

### 验证 Agents 可用性

```bash
# 尝试调用 java-reviewer agent
请帮我审查这段 Java 代码...
```

Claude Code 应该自动识别并使用 java-reviewer agent。

### 验证 Commands 可用性

```bash
# 查看可用命令
/help

# 应该看到 lcyf-* 系列命令
```

### 验证 Skills 加载

在 Claude Code 中询问：

```
请使用 java-dev skill 帮我编写一个 Spring Boot Controller
```

---

## 自定义配置

### 全局配置 (~/.claude/)

不建议修改全局配置。lcyf-claude-code 应该作为项目级插件使用。

### 项目配置 (D:\code project2\.claude/)

推荐的项目配置结构：

```
D:\code project2\
└── .claude/
    ├── CLAUDE.md           # 项目主配置
    ├── contexts/           # 项目特定上下文
    │   └── domain.md       # 业务领域知识
    └── local/              # 本地临时文件（不提交 Git）
```

### 禁用特定组件

如果不需要某些 agents 或 skills，在项目的 `.claude/CLAUDE.md` 中声明：

```markdown
## 禁用组件

不使用以下 agents:
- module-coordinator (单模块项目)

不使用以下 skills:
- continuous-learning (暂不需要)
```

---

## 高级配置

### 配置 Hooks

编辑 `D:\lcyf-claude-code\hooks\hooks.json` 自定义 hooks 行为。

示例 - 修改 pre-commit 检查：

```json
{
  "hooks": [
    {
      "type": "PreToolUse",
      "matcher": "tool == \"Bash\" && tool_input.command contains \"git commit\"",
      "hooks": [
        {
          "type": "command",
          "command": "node D:\\lcyf-claude-code\\hooks\\scripts\\pre-commit-check.js"
        }
      ]
    }
  ]
}
```

### 配置模板

在 `D:\lcyf-claude-code\templates\` 中自定义代码模板。

### 配置 Package Manager

```bash
# 设置项目级 package manager
node scripts/setup-package-manager.js --project maven

# 或者设置为 gradle
node scripts/setup-package-manager.js --project gradle
```

---

## 故障排除

### 问题 1: Plugin 未加载

**症状**: `/plugin list` 未显示 lcyf-claude-code

**解决方案**:
1. 检查 `~/.claude/settings.json` 配置是否正确
2. 验证 `D:\lcyf-claude-code\.claude-plugin\plugin.json` 存在
3. 重启 Claude Code: `/reload`

### 问题 2: Commands 不可用

**症状**: `/lcyf-new-feature` 命令不存在

**解决方案**:
1. 确认 plugin 已启用: `/plugin status lcyf-claude-code`
2. 检查 `D:\lcyf-claude-code\commands\` 目录下是否有 `.md` 文件
3. 重新加载配置: `/reload`

### 问题 3: Agents 未调用

**症状**: Claude Code 没有使用专用 agents

**解决方案**:
1. 明确指示使用 agent: "请使用 java-reviewer agent 审查代码"
2. 检查 agent 定义: `D:\lcyf-claude-code\agents\*.md`
3. 确认 agent 的 tools 权限配置正确

### 问题 4: Hooks 未触发

**症状**: Pre-commit 检查没有执行

**解决方案**:
1. 检查 `hooks/hooks.json` 语法是否正确
2. 验证 hooks 脚本是否可执行: `node hooks/scripts/pre-commit-check.js`
3. 检查 matcher 表达式是否匹配

### 问题 5: Node.js 依赖问题

**症状**: `npm install` 失败

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

---

## 卸载

### 卸载 Plugin

```bash
# 禁用 plugin
/plugin disable lcyf-claude-code

# 从 marketplace 移除
/plugin marketplace remove lcyf-claude-code
```

或者手动编辑 `~/.claude/settings.json`，移除相关配置。

### 清理项目配置

```bash
# 删除项目配置
rm -rf D:\code project2\.claude
```

### 完全卸载

```bash
# 删除整个 lcyf-claude-code 目录
rm -rf D:\lcyf-claude-code
```

---

## 更新

### 检查更新

```bash
cd lcyf-claude-code
git pull origin master
npm install
```

### 升级项目配置

如果 lcyf-claude-code 有重大更新，需要重新初始化项目配置：

```bash
node scripts/setup/init-project.js "D:\code project2" --force
```

---

## 下一步

安装完成后，请参考：
- [使用指南](USAGE.md) - 学习如何使用 lcyf-claude-code
- [示例](../examples/) - 查看实际使用示例
- [FAQ](FAQ.md) - 常见问题解答

---

**安装遇到问题？请提交 [Issue](https://github.com/a623556943/lcyf-claude-code/issues)**
