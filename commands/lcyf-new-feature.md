# lcyf-new-feature 命令

lcyf 项目完整的功能开发工作流。

## 命令

`/lcyf-new-feature`

## 描述

引导你完成完整的功能开发生命周期：
1. EARS 需求设计
2. 技术方案设计（API + 数据库 + 缓存）
3. 任务拆分
4. TDD 实现
5. 代码审查
6. 文档更新

## 使用方式

```
/lcyf-new-feature
```

## 工作流程

将通过以下阶段引导用户：

### 阶段 1：需求收集

要求用户描述功能需求。然后生成 EARS 格式的需求：

```markdown
## 需求 1 - [功能名称]

**用户故事**: 作为[角色]，我希望[目标]

#### 验收标准
1. When [条件] 时，the 系统应当 [响应]
2. ...
```

### 阶段 2：技术设计

基于需求，设计：

**API 设计：**
```
POST /api/v1/[resource]
Request: { ... }
Response: { ... }
```

**数据库设计：**
```
表: [table_name]
字段: ...
索引: ...
```

**缓存策略：**
```
Redis: [key_pattern] -> [value] (TTL: [duration])
```

### 阶段 3：任务拆分

分解为可执行的任务：
```
- [ ] 任务 1
- [ ] 任务 2
...
```

### 阶段 4：实现

使用 TDD 方法：
1. 编写失败的测试（RED）
2. 实现代码（GREEN）
3. 重构（IMPROVE）

### 阶段 5：审查

1. 运行 `/lcyf-review` 进行 Java 代码审查
2. 运行 `/lcyf-db-review` 进行数据库审查
3. 运行 `/lcyf-api-review` 进行 API 审查

## 示例会话

```
用户: /lcyf-new-feature