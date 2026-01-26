# CLI 功能说明

## 概述

`lcyf-cli` 是 lcyf-claude-code v2.0 的命令行工具，提供交互式安装、配置和管理功能。

## 安装方式

### 全局安装

```bash
npm install -g lcyf-claude-code

# 验证安装
lcyf --version
```

### 本地开发

```bash
git clone https://github.com/a623556943/lcyf-claude-code.git
cd lcyf-claude-code
npm install
npm link

# 现在可以使用 lcyf 命令
```

## 核心命令

### 1. 初始化 (init)

```bash
lcyf init

# 或指定项目路径
lcyf init /path/to/your/project
```

**功能**:
- 检测项目类型（Maven/Gradle）
- 分析项目结构
- 创建 `.lcyf/` 知识库目录
- 生成初始配置文件
- 设置Git忽略规则

**交互流程**:
```
? 项目名称: lcyf-cloud
? 基础包名: com.lcyf.cloud
? 主模块名: system
? 作者姓名: 张三
? 作者邮箱: zhangsan@lcyf.com
? 启用哪些功能?
  ◉ 持续学习
  ◉ 自动验证
  ◉ 代码审查
  ◯ 性能监控
```

### 2. 安装 (install)

```bash
lcyf install

# 选择性安装
lcyf install --agents --commands
lcyf install --all
```

**功能**:
- 交互式选择要安装的组件
- Agents（8个专家）
- Commands（20个命令）
- Skills（15个技能）
- Rules（11条规则）
- Hooks（25个钩子）
- Templates（18个模板）

**交互界面**:
```
? 选择要安装的组件:
  ◉ Agents (8个) - AI专家代理
  ◉ Commands (20个) - 斜杠命令
  ◉ Skills (15个) - 技能库
  ◉ Rules (11个) - 编码规范
  ◯ Hooks (25个) - 自动化钩子
  ◯ Templates (18个) - 代码模板

? 确认安装? Yes

正在安装...
✓ Agents 安装完成
✓ Commands 安装完成
✓ Skills 安装完成
✓ Rules 安装完成

安装完成！
运行 'lcyf validate' 验证配置
```

### 3. 配置 (config)

```bash
lcyf config

# 查看配置
lcyf config list

# 设置配置
lcyf config set author "张三"
lcyf config set basePackage "com.lcyf.cloud"

# 重置配置
lcyf config reset
```

**可配置项**:
```yaml
# 项目配置
project:
  name: lcyf-cloud
  basePackage: com.lcyf.cloud
  buildTool: maven  # maven | gradle

# 作者信息
author:
  name: 张三
  email: zhangsan@lcyf.com

# 功能开关
features:
  continuousLearning: true
  autoVerification: true
  codeReview: true
  performanceMonitor: false

# 模板配置
templates:
  author: ${author.name}
  date: ${currentDate}
  basePackage: ${project.basePackage}
```

### 4. 团队配置 (team)

```bash
lcyf team setup

# 导出团队配置
lcyf team export team-config.json

# 导入团队配置
lcyf team import team-config.json
```

**团队配置向导**:
```
欢迎使用 lcyf-claude-code 团队配置向导

? 团队名称: lcyf开发团队
? 团队规模:
  ◯ 小型（2-5人）
  ◉ 中型（6-15人）
  ◯ 大型（15人+）

? 代码审查要求:
  ◉ 强制审查
  ◯ 建议审查
  ◯ 可选审查

? 测试覆盖率要求:
  ◉ 80%+（推荐）
  ◯ 60%+
  ◯ 自定义

? Git工作流:
  ◉ Git Flow
  ◯ GitHub Flow
  ◯ Trunk Based

正在生成团队配置...
✓ 团队规范已生成: .lcyf/team-conventions/
✓ Git hooks已配置
✓ CI配置已生成: .github/workflows/

团队配置完成！
运行 'git add .lcyf && git commit -m "chore: setup team config"' 提交配置
```

### 5. 模板管理 (template)

```bash
# 列出所有模板
lcyf template list

# 应用模板
lcyf template apply Controller \
  --var entityName=User \
  --var moduleName=system \
  --output src/main/java/.../UserController.java

# 创建自定义模板
lcyf template create MyTemplate
```

**交互式模板生成**:
```
? 选择模板类型:
  ◯ Controller
  ◯ Service
  ◯ Mapper
  ◯ Entity (DO)
  ◉ 完整CRUD（生成全套）

? 实体名称: User
? 模块名称: system
? 需要认证: Yes
? 需要日志: Yes
? 需要缓存: Yes
? 需要分页: Yes

正在生成代码...
✓ UserController.java
✓ IUserService.java
✓ UserServiceImpl.java
✓ UserMapper.java
✓ UserDo.java
✓ UserAddCmd.java
✓ UserUpdateCmd.java
✓ UserDto.java
✓ UserView.java

生成完成！共9个文件
运行 '/lcyf-验证' 检查代码质量
```

### 6. 知识库管理 (knowledge)

```bash
# 查看知识库统计
lcyf knowledge stats

# 搜索知识
lcyf knowledge search "异常处理"

# 清理旧知识
lcyf knowledge clean --older-than 30d

# 导出知识库
lcyf knowledge export knowledge-backup.tar.gz

# 导入知识库
lcyf knowledge import knowledge-backup.tar.gz
```

**知识库统计输出**:
```
知识库统计
==========
总计: 156项知识

按类型分布:
- 学习模式: 45项
- 团队约定: 12项
- 本能规则: 8项
- 会话历史: 91项

最近学习:
1. SQL优化模式 (2025-01-26, 频率: 12)
2. 异常处理模式 (2025-01-25, 频率: 8)
3. 缓存使用模式 (2025-01-24, 频率: 15)

高频本能:
1. Service层添加@Transactional (置信度: 0.98)
2. Controller参数添加@Valid (置信度: 0.95)
3. 避免SQL拼接 (置信度: 0.99)
```

### 7. 验证 (validate)

```bash
# 验证配置
lcyf validate

# 验证特定组件
lcyf validate --agents
lcyf validate --templates
lcyf validate --hooks
```

**验证输出**:
```
正在验证配置...

✓ 项目结构正确
✓ package.json 有效
✓ Agents配置正确 (8/8)
✓ Commands配置正确 (20/20)
✓ Skills配置正确 (15/15)
✓ Rules配置正确 (11/11)
✓ Hooks配置正确 (25/25)
✓ Templates配置正确 (18/18)

✓ 所有配置验证通过！

建议:
- 运行 'lcyf test' 测试核心功能
- 查看 'lcyf status' 了解系统状态
```

### 8. 状态 (status)

```bash
lcyf status
```

**状态输出**:
```
lcyf-claude-code 系统状态
===========================
版本: v2.0.0
安装路径: /usr/local/lib/node_modules/lcyf-claude-code

项目信息
--------
名称: lcyf-cloud
路径: /home/user/projects/lcyf-cloud
类型: Maven项目
模块数: 6

组件状态
--------
✓ Agents: 8个已加载
✓ Commands: 20个可用
✓ Skills: 15个已加载
✓ Rules: 11条已应用
✓ Hooks: 25个已启用
✓ Templates: 18个可用

知识库
------
学习模式: 45项
团队约定: 12项
本能规则: 8项
会话历史: 91项

最近活动
--------
- 2025-01-26 14:30 - 完成用户模块开发
- 2025-01-26 10:15 - 代码审查通过
- 2025-01-25 16:45 - 修复SQL注入漏洞

系统健康
--------
✓ 所有组件正常运行
✓ 知识库正常
✓ Git仓库正常
```

### 9. 更新 (update)

```bash
# 检查更新
lcyf update check

# 更新到最新版本
lcyf update

# 更新到指定版本
lcyf update 2.1.0
```

### 10. 卸载 (uninstall)

```bash
# 完全卸载
lcyf uninstall

# 只移除组件，保留配置
lcyf uninstall --keep-config
```

## 高级功能

### 批量操作

```bash
# 批量应用模板
lcyf template batch \
  --entities User,Order,Product \
  --module system \
  --type full-crud
```

### 自动修复

```bash
# 自动修复配置问题
lcyf fix

# 自动修复特定问题
lcyf fix --missing-files
lcyf fix --broken-links
```

### 日志查看

```bash
# 查看操作日志
lcyf logs

# 查看错误日志
lcyf logs --errors

# 实时日志
lcyf logs --follow
```

## 配置文件

### 全局配置

`~/.lcyfrc`:
```json
{
  "defaultAuthor": "张三",
  "defaultEmail": "zhangsan@lcyf.com",
  "preferredModel": "opus",
  "theme": "dark",
  "language": "zh-CN"
}
```

### 项目配置

`.lcyf/config.json`:
```json
{
  "project": {
    "name": "lcyf-cloud",
    "basePackage": "com.lcyf.cloud",
    "modules": ["system", "sales", "finance", "policy"]
  },
  "features": {
    "continuousLearning": true,
    "autoVerification": true
  }
}
```

## 命令别名

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
alias lci='lcyf init'
alias lcs='lcyf status'
alias lcv='lcyf validate'
alias lct='lcyf template'
alias lck='lcyf knowledge'
```

## 调试模式

```bash
# 启用调试输出
lcyf --debug init

# 详细日志
lcyf --verbose install

# 静默模式
lcyf --silent update
```

## 注意事项

- **首次使用**: 运行 `lcyf init` 初始化项目
- **团队协作**: 使用 `lcyf team setup` 统一团队配置
- **定期更新**: 运行 `lcyf update` 获取最新功能
- **备份知识库**: 定期运行 `lcyf knowledge export`
- **验证配置**: 修改配置后运行 `lcyf validate`
