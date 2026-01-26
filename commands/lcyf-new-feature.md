# lcyf-new-feature Command

Complete feature development workflow for lcyf projects.

## Command
`/lcyf-new-feature`

## Description
Guides you through the complete feature development lifecycle:
1. EARS requirement design
2. Technical design (API + DB + Cache)
3. Task breakdown
4. TDD implementation
5. Code review
6. Documentation

## Usage
```
/lcyf-new-feature
```

## Workflow

You will guide the user through the following phases:

### Phase 1: Requirement Collection
Ask the user to describe the feature requirements. Then generate EARS-format requirements:

```markdown
## 需求 1 - [功能名称]

**用户故事**: 作为[角色]，我希望[目标]

#### 验收标准
1. When [条件] 时，the 系统应当 [响应]
2. ...
```

### Phase 2: Technical Design
Based on requirements, design:

**API Design:**
```
POST /api/v1/[resource]
Request: { ... }
Response: { ... }
```

**Database Design:**
```
表: [table_name]
字段: ...
索引: ...
```

**Cache Strategy:**
```
Redis: [key_pattern] -> [value] (TTL: [duration])
```

### Phase 3: Task Breakdown
Break down into actionable tasks:
```
- [ ] Task 1
- [ ] Task 2
...
```

### Phase 4: Implementation
Use TDD approach:
1. Write failing tests (RED)
2. Implement code (GREEN)
3. Refactor (IMPROVE)

### Phase 5: Review
1. Run `/lcyf-review` for Java code review
2. Run `/lcyf-db-review` for database review
3. Run `/lcyf-api-review` for API review

## Example Session

```
User: /lcyf-new-feature