# Skills 自动加载工作流规则

> **优先级**：★★★ 高 | **覆盖范围**：所有开发任务 | **版本**：1.0.0

---

## 1. 核心原则

### 必须遵守

所有涉及开发的任务中，**必须**按照以下工作流加载相关 skills：

```
任务输入
  ↓
[第 1 步] 分析关键词 ← 匹配 .claude-skills-config.json
  ↓
[第 2 步] 主动加载 Skills ← 使用 Read 工具读取 SKILL.md
  ↓
[第 3 步] 融入任务上下文 ← 基于 skill 知识生成方案
  ↓
[第 4 步] 执行任务 ← 调用 Agent 或直接实现
```

### 不可跳过任何步骤

| 步骤 | 必须 | 说明 |
|------|------|------|
| 分析关键词 | ✓ | 即使不确定也要尝试匹配 |
| 主动加载 Skills | ✓ | 不能依赖系统自动，必须主动读取 |
| 融入上下文 | ✓ | 不能只读不用 |
| 执行任务 | ✓ | 基于 skill 知识执行 |

---

## 2. 第 1 步：分析关键词

### 规则 2.1：关键词识别

当收到任务时，**必须**检查是否包含以下关键词：

**系统认证与权限**
```
用户、user、账号、认证、登录、登出、用户管理
菜单、menu、前端权限、权限控制、权限、permission、角色、role
组织、organization、部门、岗位
数据权限、data permission、脱敏、加密、敏感数据
```

**系统配置管理**
```
配置、config、参数、系统参数
系统配置、全局配置、system config
字典、dict、数据字典、枚举
记账、jz、记账规则
渠道、banner、横幅、广告配置
```

**风险控制**
```
白名单、whitelist、豁免、风险豁免
黑名单、blacklist、风险、blocked
风险管理、risk、风险策略
产品风控、product risk
```

**外部系统集成**
```
微信、wechat、小程序、公众号
短信、sms、验证码
合同、签章、电子签名、contract
外部系统、对接、integration
```

**架构与技术栈**
```
Java、Spring Boot、全栈
模块化、单体架构、模块拆分
```

### 规则 2.2：多关键词匹配

如果识别到**多个关键词**，应该加载**所有匹配的 skills**：

```
例子：
  需求："实现用户导出，需要脱敏处理"

  关键词：
    - "用户" → system-auth-user
    - "脱敏" → system-auth-data-masking

  加载：
    ✓ system-auth-user
    ✓ system-auth-data-masking
```

### 规则 2.3：不确定时的处理

如果不确定是否有相关 skill，**应该尝试查询** `.claude-skills-config.json`：

```
步骤：
  1. Read: D:/lcyf-claude-code/.claude-skills-config.json
  2. 搜索相关的 triggers 字段
  3. 如果有匹配，加载对应 skills
  4. 如果没有，继续执行任务（不强制）
```

---

## 3. 第 2 步：主动加载 Skills

### 规则 3.1：加载方式

**必须使用 Read 工具加载**，不能依赖系统自动加载：

```
✓ 正确做法：
  1. 识别 skill ID：system-auth-user
  2. 对应路径：skills/system-auth-user/SKILL.md
  3. Read: D:/lcyf-claude-code/skills/system-auth-user/SKILL.md
  4. 完整 SKILL.md 内容被加载到上下文中

✗ 错误做法：
  1. 识别了 skill 但没有读取
  2. 依赖系统自动加载（系统不会）
  3. 只看 .claude-skills-config.json 的元数据，不读 SKILL.md
```

### 规则 3.2：加载顺序

按照以下优先级加载：

```
优先级 1: 系统认证与权限 (6 个)
优先级 2: 系统配置管理 (5 个)
优先级 3: 风险控制 (4 个)
优先级 4: 外部系统集成 (4 个)
优先级 5: 架构与技术栈 (2 个)
```

**原因**：系统认证相关的 skills 最常用，应该优先加载。

### 规则 3.3：加载后的处理

加载完成后，**必须在回复中显示加载情况**：

```
✓ 正确做法：

用户: 实现用户导出功能

我的回复：

【Skills 已加载】
  ✓ system-auth-user: 用户账号与认证管理
    路径: D:/lcyf-claude-code/skills/system-auth-user/SKILL.md

根据 system-auth-user 中的信息：
  - Controller 入口: UserInfoController
  - Service 接口: IUserInfoService
  - 导出相关的接口: toAInnerPage() / queryUserAgentPage()

我现在将基于这些知识实现导出功能...
```

---

## 4. 第 3 步：融入任务上下文

### 规则 4.1：必须使用 Skill 中的信息

加载 skill 后，**必须引用** skill 中的信息：

```
SKILL.md 提供的信息包括：
  • 目录结构 → 帮助定位文件
  • Controller 入口 → HTTP 端点
  • Service 接口 → 业务逻辑
  • 核心流程 → 理解执行过程
  • 数据模型 → ER 图、字段说明
  • 依赖关系 → 其他模块
  • 扩展指南 → 怎么添加新功能

使用方式：
  1. 读取 skill 信息
  2. 在回复中明确引用（标记来源）
  3. 基于这些信息生成实现方案
```

### 规则 4.2：引用格式

当引用 skill 中的信息时，使用以下格式：

```
【来源: system-auth-user】
根据 SKILL.md 的"核心入口文件"章节：
  Controller: UserInfoController (路径: .../adapter/web/auth/UserInfoController.java)
  Service: IUserInfoService (路径: .../biz/service/auth/user/IUserInfoService.java)

所以我们应该在 UserInfoController 中添加导出接口...
```

### 规则 4.3：融合多个 Skills

如果加载了多个 skills，应该**综合使用**：

```
例子：
  加载: system-auth-user + system-auth-data-masking

  融合方式：
  1. 使用 system-auth-user 了解用户数据结构和导出入口
  2. 使用 system-auth-data-masking 了解脱敏规则和实现方式
  3. 结合两者生成完整方案：
     - 从 UserInfoController 提供导出接口
     - 在导出时调用脱敏模块
     - 返回脱敏后的用户数据
```

---

## 5. 第 4 步：执行任务

### 规则 5.1：基于 Skill 知识执行

**不能脱离 skill 知识执行任务**：

```
✓ 正确做法：
  1. 加载 system-auth-user
  2. 了解到用户管理的核心文件位置
  3. 在这些文件中实现功能
  4. 确保符合现有架构和模式

✗ 错误做法：
  1. 加载 skill 但不使用其信息
  2. 凭经验实现，忽视 skill 提供的结构信息
  3. 创建新的文件/目录，而不是使用 skill 中指定的位置
```

### 规则 5.2：调用 Agent

当执行复杂任务时，使用 Task 工具调用 Agent：

```
格式：
  Task(
    subagent_type="java-developer",
    description="实现用户导出功能",
    prompt="""
    背景信息：
      已加载 SKILL: system-auth-user
      参考文件: D:/lcyf-claude-code/skills/system-auth-user/SKILL.md

    具体要求：
      1. 在 UserInfoController 中添加导出接口
      2. Service 层实现导出逻辑
      3. 支持参数: ...
    """
  )
```

---

## 6. 检查清单

**执行任何开发任务前，检查以下清单**：

- [ ] 是否分析了任务中的关键词？
- [ ] 是否查询了 `.claude-skills-config.json` 找匹配的 skills？
- [ ] 是否使用 Read 工具加载了所有匹配的 SKILL.md？
- [ ] 是否在回复中显示了加载的 skills？
- [ ] 是否引用了 skill 中的信息（如目录结构、入口文件）？
- [ ] 是否基于 skill 知识生成了实现方案？
- [ ] 是否避免创建 skill 中不存在的新文件/目录？

---

## 7. 常见错误

### ❌ 错误 1：只读配置文件，不读 SKILL.md

```
错误做法：
  1. 读取 .claude-skills-config.json
  2. 看到了 system-auth-user 的元数据
  3. 直接开始编码，没有读 SKILL.md

正确做法：
  1. 读取 .claude-skills-config.json（找到 skill 信息）
  2. 读取 SKILL.md（获取详细的实现指导）
  3. 基于完整信息开始编码
```

### ❌ 错误 2：识别了 Skill 但没有在回复中说明

```
错误做法：
  用户：实现用户导出功能
  我：这很简单，我来实现...
  (没有提到加载了 system-auth-user)

正确做法：
  用户：实现用户导出功能
  我：【Skills 已加载】system-auth-user
     根据 SKILL.md 的信息...
```

### ❌ 错误 3：加载了 Skill 但没有使用

```
错误做法：
  1. 加载 system-auth-user
  2. 然后凭经验写代码
  3. 没有参考 skill 中的目录结构、入口文件等

正确做法：
  1. 加载 system-auth-user
  2. 查看 skill 中的"核心入口文件"
  3. 在指定的 Controller/Service 中实现
```

### ❌ 错误 4：创建 Skill 中不存在的新模块

```
错误做法：
  skill 说 Controller 在 lcyf-module-system-adapter
  我却创建了新的目录结构

正确做法：
  skill 说 Controller 在 lcyf-module-system-adapter
  我就在这里添加代码，不创建新目录
```

---

## 8. 特殊情况

### 情况 1：任务与多个 Skills 相关

```
处理方式：
  1. 识别所有相关 skills
  2. 全部加载
  3. 综合考虑所有 skill 的信息
  4. 生成综合方案

例子：
  任务："添加用户导出功能，需要脱敏处理，支持权限过滤"
  相关 skills:
    - system-auth-user (用户数据)
    - system-auth-data-masking (脱敏)
    - system-auth-permission (权限过滤)

  做法：
    ✓ 加载全部 3 个 skills
    ✓ 理解用户数据结构
    ✓ 理解脱敏规则
    ✓ 理解权限过滤机制
    ✓ 生成综合方案
```

### 情况 2：找不到匹配的 Skill

```
处理方式：
  1. 再次检查关键词
  2. 搜索 .claude-skills-config.json 中所有 trigger 字段
  3. 如果确实没有相关 skill，继续执行任务
  4. 在回复中说明"未找到相关 skill"

例子回复：
  "根据关键词分析，未找到直接相关的 skill。
   将基于项目整体架构（CLAUDE.md）继续实现..."
```

### 情况 3：Skill 信息不完整或过时

```
处理方式：
  1. 使用 skill 中的有效信息
  2. 在回复中说明"基于 skill 信息，部分细节需要查阅代码"
  3. 使用 Explore agent 补充信息

例子回复：
  "根据 system-auth-user skill，核心入口是 UserInfoController。
   但 skill 对导出功能没有详细说明，让我使用 Explore agent 查询实际代码..."
```

---

## 9. 优先级和强制性

| 场景 | 强制性 | 说明 |
|------|-------|------|
| 新增功能 | ★★★ 必须 | 必须加载相关 skills |
| Bug 修复 | ★★★ 必须 | 必须加载相关 skills |
| 代码审查 | ★★ 应该 | 建议加载相关 skills |
| 架构设计 | ★★★ 必须 | 必须加载所有相关 skills |
| 文档更新 | ★ 可选 | 根据情况判断 |

---

## 10. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2026-01-30 | 初始版本，建立 skills 加载工作流 |

---

**最后更新**: 2026-01-30

**制定者**: Claude Code

**适用范围**: 所有涉及 LCYF 项目的开发任务

