# LCYF Workflow Skill

---

name: lcyf-workflow
description: lcyf 项目的标准开发工作流，包括 EARS 需求设计、技术方案设计和任务拆分
version: 1.0.0

---

## Overview

Standardized workflow for lcyf feature development:

1. **Requirement Design** (EARS syntax)
2. **Technical Design** (API + DB + Cache)
3. **Task Breakdown** (Actionable tasks)
4. **Implementation** (TDD approach)
5. **Review** (Code + DB + API)

## Component Files

- `requirement-design.md` - EARS requirement template
- `technical-design.md` - Technical design template
- `task-breakdown.md` - Task breakdown template

## Workflow Phases

### Phase 1: Requirement Design (EARS)

**Format:**

```markdown
## 需求 X - [功能名称]

**用户故事**: 作为[角色]，我希望[目标]

#### 验收标准
1. When [触发条件] 时，the 系统应当 [系统响应]
2. ...
```

**Example:**

```markdown
## 需求 1 - 用户登录功能

**用户故事**: 作为用户，我希望能够通过用户名和密码登录系统

#### 验收标准
1. When 用户输入正确的用户名和密码时，the 系统应当返回 JWT token
2. When 用户输入错误的凭据时，the 系统应当返回错误信息"用户名或密码错误"
3. The 系统应当记录登录日志
```

### Phase 2: Technical Design

**Format:**

```markdown
## API 设计
[HTTP Method] [Endpoint]
Request: { ... }
Response: { ... }

## 数据库设计
- 表: [table_name]
- 字段: [field descriptions]
- 索引: [index strategy]

## 缓存策略
- Redis: [key_pattern] -> [value] (TTL: [duration])
```

**Example:**

```markdown
## API 设计
POST /api/v1/auth/login
Request: {
  "username": "string",
  "password": "string"
}
Response: {
  "success": true,
  "data": {
    "token": "eyJ..."
  }
}

## 数据库设计
- 表: sys_user
- 字段: id, username, password_hash, salt, status, created_at
- 索引: unique idx_username

## 缓存策略
- Redis: user:token:{token} -> user_id (TTL: 2小时)
```

### Phase 3: Task Breakdown

**Format:**

```markdown
- [ ] Task 1
  - Description
  - _需求: 相关需求编号
- [ ] Task 2
  ...
```

**Example:**

```markdown
- [ ] 创建 LoginDTO 和 LoginVO
  - 定义请求和响应数据结构
  - _需求: 需求 1
- [ ] 实现 AuthService.login() 方法
  - 验证用户名和密码
  - 生成 JWT token
  - _需求: 需求 1
- [ ] 实现 AuthController.login() 端点
  - 参数验证
  - 调用 service
  - 返回统一格式
  - _需求: 需求 1
```

### Phase 4: Implementation (TDD)

1. **Red**: Write failing test
2. **Green**: Implement minimal code to pass
3. **Refactor**: Improve code quality

### Phase 5: Review

1. **Code Review**: `/lcyf-review`
2. **DB Review**: `/lcyf-db-review`
3. **API Review**: `/lcyf-api-review`

## Usage

Invoke complete workflow:

```bash
/lcyf-new-feature
```

This command guides through all phases automatically.

## Related Resources

- `/lcyf-new-feature` command
- java-reviewer, api-designer, db-optimizer agents
- TDD workflow guidelines
