# 项目级配置 - 快速参考卡片

## 选择您的方案

### 🌟 方案A: Git 子模块（推荐）

**一句话**: 自动更新，团队共享

```bash
cd your-java-project

# 1. 添加子模块
git submodule add https://github.com/a623556943/lcyf-claude-code.git .claude/lcyf-claude-code
git submodule update --init --recursive

# 2. 创建符号链接
# Windows (PowerShell - 管理员)
$lcyfPath = Join-Path (Get-Location) ".claude\lcyf-claude-code"
New-Item -ItemType SymbolicLink -Path ".\.claude\agents" -Target "$lcyfPath\agents" -Force
New-Item -ItemType SymbolicLink -Path ".\.claude\commands" -Target "$lcyfPath\commands" -Force
New-Item -ItemType SymbolicLink -Path ".\.claude\skills" -Target "$lcyfPath\skills" -Force
New-Item -ItemType SymbolicLink -Path ".\.claude\rules" -Target "$lcyfPath\rules" -Force
New-Item -ItemType SymbolicLink -Path ".\.claude\templates" -Target "$lcyfPath\templates" -Force

# macOS/Linux
ln -s "./.claude/lcyf-claude-code/agents" "./.claude/agents"
ln -s "./.claude/lcyf-claude-code/commands" "./.claude/commands"
ln -s "./.claude/lcyf-claude-code/skills" "./.claude/skills"
ln -s "./.claude/lcyf-claude-code/rules" "./.claude/rules"
ln -s "./.claude/lcyf-claude-code/templates" "./.claude/templates"

# 3. 创建知识库目录
mkdir -p .claude/{learned-patterns,team-conventions,instincts}

# 4. 提交
git add .claude/
git commit -m "feat: 添加 lcyf-claude-code 项目配置"
```

---

### ⚡ 方案B: 快速复制

**一句话**: 最快上手，无需子模块

```bash
cd your-java-project

# 1. 克隆配置
git clone https://github.com/a623556943/lcyf-claude-code.git /tmp/lcyf-claude-code

# 2. 复制到项目
mkdir -p .claude
cp -r /tmp/lcyf-claude-code/{agents,commands,skills,rules,templates} .claude/
mkdir -p .claude/{learned-patterns,team-conventions,instincts}

# 3. 提交
git add .claude/
git commit -m "feat: 添加 lcyf-claude-code 配置"
```

---

### 🔗 方案C: 符号链接（macOS/Linux）

**一句话**: 共享全局配置

```bash
cd your-java-project

# 1. 创建链接到全局配置
mkdir -p .claude
ln -s ~/.claude/agents .claude/agents
ln -s ~/.claude/commands .claude/commands
ln -s ~/.claude/skills .claude/skills
ln -s ~/.claude/rules .claude/rules
ln -s ~/.claude/templates .claude/templates

# 2. 创建项目级目录
mkdir -p .claude/{learned-patterns,team-conventions,instincts}
```

---

## 开始使用

```bash
# 1. 打开项目
claude-code .

# 2. 输入命令
/lcyf-新功能 添加用户批量导入功能

# 3. 系统自动执行
# ├── 需求分析
# ├── 架构设计
# ├── TDD开发
# ├── 代码审查
# ├── 安全扫描
# └── 知识沉淀
```

---

## 常用命令

### 更新配置（方案A）

```bash
# 更新到最新版本
git submodule update --remote

# 提交更新
git add .claude/lcyf-claude-code
git commit -m "chore: 更新 lcyf-claude-code"
```

### 项目配置

```bash
# 创建 config.json
cat > .claude/config.json << 'EOF'
{
  "projectName": "your-project",
  "moduleName": "system",
  "language": "zh_CN",
  "architecture": "lcyf-cloud"
}
EOF
```

### Git 配置

```bash
# 添加到 .gitignore（忽略学习结果）
cat >> .gitignore << 'EOF'
.claude/learned-patterns/*
.claude/team-conventions/*
.claude/instincts/*
EOF
```

---

## 常见问题

### ❌ "符号链接创建失败" (Windows)

**解决方案**:
1. 以管理员身份运行 PowerShell
2. 或使用方案B（快速复制）

### ❌ "命令不生效"

**检查清单**:
```bash
ls -la .claude/
# 应包含: agents/, commands/, rules/, skills/, templates/
```

### ❌ "拉取时子模块不更新"

**解决方案**:
```bash
git pull --recurse-submodules
# 或
git submodule update --remote
```

---

## 团队成员初始化

```bash
# 克隆项目
git clone https://github.com/your-org/your-project.git
cd your-project

# 初始化子模块
git submodule update --init --recursive

# 创建符号链接
# [根据上面的方案A/B/C 命令]

# 完成！
claude-code .
```

---

## 对比全局配置

| 特性 | 项目级 | 全局 |
|------|--------|------|
| 团队共享 | ✅ | ❌ |
| 版本控制 | ✅ | ❌ |
| CI/CD | ✅ | ❌ |
| 自动更新 | ✅ (方案A) | ❌ |
| 多项目 | ✅ | ❌ |

---

## 文档链接

- 📖 [详细快速开始](docs/快速开始.md)
- 📚 [项目级配置完整说明](docs/项目级配置说明.md)
- 🔧 [安装指南](docs/安装指南.md)

---

**推荐: 使用方案A 获得最佳体验！**
