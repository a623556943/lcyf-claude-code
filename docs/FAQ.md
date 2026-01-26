# 常见问题解答 (FAQ)

本文档收集了使用 lcyf-claude-code 时常见的问题和解决方案。

---

## 目录

- [安装问题](#安装问题)
- [使用问题](#使用问题)
- [配置问题](#配置问题)
- [开发工作流问题](#开发工作流问题)
- [扩展和自定义](#扩展和自定义)
- [故障排除](#故障排除)

---

## 安装问题

### Q1: 安装后 Plugin 未加载，`/plugin list` 中看不到 lcyf-claude-code

**A:** 这通常是因为 Claude Code 未正确识别 Plugin 配置。请尝试以下步骤：

1. 确保 `.claude-plugin/plugin.json` 文件存在且格式正确
   ```bash
   cat D:\lcyf-claude-code\.claude-plugin\plugin.json
   ```

2. 检查 `~/.claude/settings.json` 中的 extraKnownMarketplaces 配置
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

3. 重新加载 Claude Code
   ```bash
   /reload
   ```

4. 重启 Claude Code CLI
   ```bash
   claude code restart
   ```

如果仍未解决，请查看 `/logs` 目录中的日志文件。

---

### Q2: npm install 失败，报错缺少依赖或权限问题

**A:** 常见原因和解决方案：

**原因 1：npm 缓存损坏**
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

**原因 2：权限问题**
```bash
# Windows 用户，以管理员身份运行
# macOS/Linux 用户，使用 sudo
sudo npm install
```

**原因 3：Node.js 版本过旧**
```bash
# 检查 Node.js 版本（需要 18.0.0 以上）
node --version

# 更新 Node.js（使用 nvm 推荐）
nvm install 18
nvm use 18
```

---

### Q3: 在不同机器上安装，为什么路径配置不对？

**A:** lcyf-claude-code 的部分配置包含硬编码路径（如 `D:\lcyf-claude-code`）。建议：

1. **使用相对路径或环境变量**
   - 编辑 `scripts/setup/init-project.js`，使用 `process.env.HOME` 或 `os.homedir()`

2. **为项目创建本地配置**
   - 在项目 `.claude/CLAUDE.md` 中使用相对路径

3. **在不同操作系统上使用路径库**
   ```javascript
   const path = require('path');
   const configPath = path.join(__dirname, 'config.json');
   ```

---

## 使用问题

### Q4: 执行 `/lcyf-new-feature` 命令时，Claude Code 没有按照工作流走流程

**A:** 这可能是几个原因造成的：

1. **Command 文件格式有问题**
   - 检查 `commands/lcyf-new-feature.md` 是否存在且格式正确

2. **Agent 未加载**
   ```bash
   # 手动指定 agent
   请使用 planner agent 帮我规划新功能开发...
   ```

3. **权限问题**
   - 检查 Claude Code 是否有足够权限执行脚本

4. **缓存问题**
   ```bash
   /reload
   ```

---

### Q5: 如何在 `/lcyf-review` 时指定要审查的文件？

**A:** 有几种方式：

**方式 1：直接指定文件路径**
```bash
/lcyf-review src/main/java/com/lcyf/module/user/service/UserService.java
```

**方式 2：在 Claude Code 中描述文件**
```bash
/lcyf-review

# 然后说：
请审查当前分支修改的所有 Service 层代码
```

**方式 3：使用 git 命令配合**
```bash
# 获取当前分支修改的文件
git diff --name-only origin/master

# 将文件列表粘贴到 Claude Code 中
/lcyf-review [粘贴文件列表]
```

---

### Q6: 代码审查报告太多，我想只看严重问题（Critical）

**A:** 可以在项目 `.claude/CLAUDE.md` 中配置：

```markdown
## 审查配置

审查等级：critical 严重问题

忽略等级：suggestion 建议
```

或者在审查时明确说明：
```bash
请使用 java-reviewer agent 审查代码，只报告严重问题和警告，忽略建议
```

---

### Q7: 为什么某些命令执行后没有输出？

**A:** Claude Code 的命令可能执行了但没有显示输出。尝试：

1. **检查日志**
   ```bash
   cat ~/.claude/history.jsonl | tail -20
   ```

2. **增加详细程度**
   - 在命令前加 `--verbose` 或 `-v` 标志

3. **查看 Claude Code 控制台**
   - 某些输出可能在控制台而不是文本中

---

## 配置问题

### Q8: 如何为特定项目自定义 lcyf-claude-code 配置？

**A:** 创建项目级配置文件 `.claude/CLAUDE.md`：

```markdown
# 项目配置

## 基本信息
- 项目名称：lcyf-module-xxx
- 技术栈：Java 17 / Spring Boot 3.5.x / MyBatis-Plus 3.x
- 数据库：MySQL 8.0

## 启用的 Agents
- java-reviewer ✅
- api-designer ✅
- db-optimizer ✅
- module-coordinator ✅

## 禁用的 Agents
- (无)

## 自定义规则
- 最低测试覆盖率：85%（高于默认 80%）
- 代码审查严格程度：strict

## 项目特定上下文
- 使用领域驱动设计（DDD）
- 严格的事务边界管理
- Redis 缓存策略
```

---

### Q9: 如何修改代码审查的检查规则？

**A:** 有两个级别的自定义：

**项目级自定义** - 在 `.claude/CLAUDE.md` 中：
```markdown
## 代码审查规则

禁用检查：
- 日志冗长性检查

额外检查：
- 并发编程安全性检查
- Redis 缓存使用规范
```

**全局自定义** - 编辑 `rules/java-coding-standards.md`：
- 添加或修改检查规则
- 更新代码示例和说明

---

### Q10: 如何让 lcyf-claude-code 在多个项目中使用？

**A:** lcyf-claude-code 设计为可复用的工具链。步骤如下：

1. **克隆到公共位置**
   ```bash
   git clone https://github.com/a623556943/lcyf-claude-code.git ~/tools/lcyf-claude-code
   ```

2. **在全局 Claude Code 配置中注册**
   编辑 `~/.claude/settings.json`：
   ```json
   {
     "extraKnownMarketplaces": {
       "lcyf-claude-code": {
         "source": {
           "type": "local",
           "path": "~/tools/lcyf-claude-code"
         }
       }
     }
   }
   ```

3. **在每个项目中创建 `.claude/CLAUDE.md`**
   ```markdown
   # lcyf Project Configuration
   使用 lcyf-claude-code 工具链进行开发
   ```

4. **启用 Plugin**
   ```bash
   /plugin install lcyf-claude-code
   ```

---

## 开发工作流问题

### Q11: TDD 工作流中，如何处理复杂的测试场景？

**A:** 按照以下步骤：

1. **先编写测试骨架**
   ```java
   @Test
   public void testComplexScenario() {
       // Given: 设置初始条件
       User user = new User();
       user.setEmail("test@example.com");

       // When: 执行操作
       Result result = userService.register(user);

       // Then: 验证结果
       assertTrue(result.isSuccess());
   }
   ```

2. **使用 Mock 和 Stub**
   ```java
   @Test
   public void testWithMock() {
       UserRepository mockRepo = mock(UserRepository.class);
       when(mockRepo.findByEmail("test@example.com")).thenReturn(null);

       UserService service = new UserService(mockRepo);
       Result result = service.register(user);
   }
   ```

3. **使用断言库简化验证**
   ```java
   // 使用 AssertJ 更清晰
   assertThat(result)
       .isNotNull()
       .hasFieldOrPropertyWithValue("success", true);
   ```

4. **使用参数化测试覆盖多个场景**
   ```java
   @ParameterizedTest
   @ValueSource(strings = {"test@example.com", "invalid-email"})
   public void testMultipleEmails(String email) {
       // 测试逻辑
   }
   ```

---

### Q12: 在模块化项目中如何处理循环依赖？

**A:** 运行 `/lcyf-module-check` 后，如果检测到循环依赖：

**方案 1：提取公共模块**
```
原结构：
module-a → module-b → module-a ❌

改进后：
module-common（公共接口）
↑                  ↑
module-a      module-b
```

**方案 2：使用依赖倒转**
```
原结构：
ServiceA → ServiceB

改进后：
ServiceA → ServiceInterface
ServiceB → ServiceInterface （实现）
```

**方案 3：使用事件驱动解耦**
```
原结构：
ModuleA → ModuleB

改进后：
ModuleA 发送事件
ModuleB 监听事件（异步解耦）
```

---

### Q13: 如何有效地执行代码重构？

**A:** 遵循以下步骤：

1. **识别重构需求**
   ```bash
   /lcyf-review
   # 找出代码坏味道
   ```

2. **制定重构计划**
   ```bash
   /plan
   # 制定详细的重构步骤
   ```

3. **先编写测试**
   - 为现有代码补充测试，确保 100% 覆盖

4. **执行小步重构**
   - 每次只改一个小部分
   - 保持所有测试通过

5. **代码审查**
   ```bash
   /lcyf-review
   # 验证重构质量
   ```

6. **性能测试**
   - 对比重构前后的性能

---

## 扩展和自定义

### Q14: 如何添加自定义的 Agent？

**A:** 按以下步骤创建新 Agent：

1. **在 `agents/` 下创建新文件**
   ```bash
   touch D:\lcyf-claude-code\agents\my-custom-agent.md
   ```

2. **编写 Agent 定义**
   ```markdown
   # My Custom Agent

   ## 描述
   我是一个自定义 Agent，用于...

   ## 职责
   - 职责 1
   - 职责 2

   ## 调用方式
   请使用 my-custom-agent agent...

   ## 工具权限
   - Read
   - Grep
   - Glob
   ```

3. **注册 Agent**
   - 编辑 `.claude-plugin/plugin.json`
   - 在 `agents` 配置中添加路径

4. **测试 Agent**
   ```bash
   /reload
   请使用 my-custom-agent agent...
   ```

---

### Q15: 如何添加新的编码规范文件？

**A:** 在 `rules/` 目录下创建新文件：

```bash
touch D:\lcyf-claude-code\rules\my-custom-standard.md
```

编写规范内容：
```markdown
# 我的自定义编码规范

## 概述
本规范用于...

## 规范清单
- [ ] 规范项 1
- [ ] 规范项 2
- [ ] 规范项 3

## 代码示例

### 错误示例
```java
// 这是错误的做法
code example
```

### 正确示例
```java
// 这是正确的做法
code example
```

## 最佳实践
1. 实践 1
2. 实践 2
```

---

### Q16: 如何为项目创建自定义命令？

**A:** 在 `commands/` 下创建新命令文件：

```bash
touch D:\lcyf-claude-code\commands\my-custom-command.md
```

编写命令定义：
```markdown
# /my-custom-command - 命令名称

## 描述
此命令用于...

## 工作流程
1. 第一步
2. 第二步
3. 第三步

## 权限要求
- Tool: Read
- Tool: Bash

## 示例
```bash
/my-custom-command
```

## 输出
描述输出格式
```

---

## 故障排除

### Q17: "Permission denied" 或 "无权限执行"错误

**A:** 这通常是文件权限问题：

```bash
# 赋予执行权限（Linux/macOS）
chmod +x scripts/setup/init-project.js

# Windows 用户
# 以管理员身份运行 Claude Code

# 或检查文件权限
ls -la scripts/
```

---

### Q18: 脚本执行超时（timeout）

**A:** 某些脚本可能需要更长时间：

1. **增加超时时间**
   ```bash
   # 在命令中指定
   timeout 300 node scripts/setup/init-project.js "path/to/project"
   ```

2. **检查网络连接**
   - 某些脚本可能需要下载依赖

3. **查看日志**
   ```bash
   cat ~/.claude/logs/claude-code.log
   ```

---

### Q19: 特定的 Agent 总是返回错误响应

**A:** 调试步骤：

1. **验证 Agent 文件格式**
   ```bash
   # 检查 markdown 语法
   # 检查 YAML frontmatter（如果有）
   ```

2. **检查权限配置**
   - Agent 定义中的 `tools` 是否包含必需的工具

3. **测试权限授予**
   ```bash
   # 在 Claude Code 中提示时授予权限
   ```

4. **查看完整错误**
   ```bash
   # 启用详细日志
   claude code --verbose
   ```

---

### Q20: git commit 前的 Pre-commit Hook 失败

**A:** 处理方式：

1. **查看具体错误信息**
   ```bash
   git commit -v
   # 查看详细输出
   ```

2. **修复问题**
   - 如果是代码问题，修复代码
   - 如果是配置问题，修改 `hooks/hooks.json`

3. **跳过 Hook（仅在必要时）**
   ```bash
   git commit --no-verify
   # ⚠️ 不建议频繁使用
   ```

4. **重新配置 Hook**
   ```bash
   # 编辑 hooks/hooks.json
   # 调整 matcher 或规则
   ```

---

## 更多帮助

如果本文档未能解决你的问题，可以：

1. **查看项目 Issues**
   - [GitHub Issues](https://github.com/a623556943/lcyf-claude-code/issues)

2. **查看详细文档**
   - [安装指南](INSTALLATION.md)
   - [使用指南](USAGE.md)
   - [架构说明](ARCHITECTURE.md)

3. **提交新 Issue**
   - 包含错误信息、环境信息和复现步骤

---

**最后更新**: 2026-01-26

**贡献者**: lcyf 开发团队
