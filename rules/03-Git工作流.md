# 03-Git工作流

## 概述

统一的Git工作流确保团队协作顺畅，代码历史清晰可追溯。

## 分支策略

### 分支类型

| 分支类型 | 命名规范 | 说明 |
|----------|----------|------|
| 主分支 | main/master | 生产代码，受保护 |
| 开发分支 | develop | 开发集成分支 |
| 功能分支 | feature/{name} | 新功能开发 |
| 修复分支 | fix/{name} | Bug修复 |
| 发布分支 | release/{version} | 版本发布 |
| 热修复 | hotfix/{name} | 紧急修复 |

### 分支命名

```bash
# ✅ 正确
feature/user-login
feature/order-export
fix/user-list-pagination
hotfix/payment-timeout

# ❌ 错误
Feature/UserLogin     # 大小写不一致
feature-user-login    # 分隔符错误
my-branch             # 无类型前缀
```

## 提交规范

### 提交信息格式

```
<type>: <description>

[optional body]

[optional footer]
```

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat: 添加用户导出功能 |
| fix | Bug修复 | fix: 修复分页查询错误 |
| refactor | 重构 | refactor: 重构用户服务 |
| docs | 文档 | docs: 更新API文档 |
| chore | 杂项 | chore: 更新依赖版本 |
| perf | 性能 | perf: 优化查询性能 |
| style | 格式 | style: 格式化代码 |

### 提交示例

```bash
# ✅ 正确
feat: 添加用户批量导入功能

- 支持Excel文件导入
- 支持数据校验和错误提示
- 最大支持1000条记录

Closes #123

# ❌ 错误
update code              # 太模糊
添加功能                  # 无类型
feat:添加用户功能         # 冒号后无空格
```

## 工作流程

### 功能开发流程

```
1. 创建功能分支
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-export

2. 开发并提交
   git add .
   git commit -m "feat: 添加用户导出功能"

3. 推送分支
   git push -u origin feature/user-export

4. 创建Pull Request
   - 标题：feat: 添加用户导出功能
   - 描述：功能说明
   - 指定审查人

5. 代码审查
   - 至少1人审查通过
   - CI检查通过
   - 解决所有评论

6. 合并
   - Squash合并到develop
   - 删除功能分支
```

### Bug修复流程

```
1. 创建修复分支
   git checkout develop
   git checkout -b fix/user-list-bug

2. 修复并测试
   git add .
   git commit -m "fix: 修复用户列表分页错误"

3. 创建PR并合并
```

### 发布流程

```
1. 创建发布分支
   git checkout develop
   git checkout -b release/v1.2.0

2. 更新版本号
   # 更新pom.xml版本
   git commit -m "chore: 更新版本号到1.2.0"

3. 测试和修复
   # 在release分支上修复问题

4. 合并到main
   git checkout main
   git merge release/v1.2.0
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin main --tags

5. 合并回develop
   git checkout develop
   git merge release/v1.2.0
```

## Pull Request规范

### PR标题

```
<type>: <description>

示例：
feat: 添加用户批量导入功能
fix: 修复订单列表分页错误
```

### PR描述模板

```markdown
## 变更说明
简要描述这个PR做了什么

## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 重构
- [ ] 文档更新

## 检查清单
- [ ] 代码符合编码规范
- [ ] 已更新相关文档
```

## 代码审查

### 审查要点

- [ ] 代码逻辑正确性
- [ ] 符合编码规范
- [ ] 无安全问题
- [ ] 性能可接受
- [ ] 文档已更新

### 审查原则

1. **及时审查**：24小时内完成初次审查
2. **建设性反馈**：提出问题时给出建议
3. **区分级别**：区分必须修改和建议修改
4. **尊重作者**：保持专业和尊重

## 冲突解决

```bash
# 1. 更新本地分支
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# 2. 解决冲突
# 编辑冲突文件
git add .
git rebase --continue

# 3. 强制推送（仅个人分支）
git push -f origin feature/my-feature
```

## 禁止操作

| 操作 | 原因 |
|------|------|
| force push到main/develop | 破坏历史 |
| 直接提交到main | 绕过审查 |
| 大量文件的单次提交 | 难以审查 |
| 不相关变更混合提交 | 历史不清晰 |

## 关联 Agent

- planner：任务分支管理
