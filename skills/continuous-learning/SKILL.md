# 持续学习技能

## 概述

提供从开发过程中自动学习和积累知识的能力。

## 学习机制

### 学习流程

```
开发活动 → 模式识别 → 质量评估 → 知识存储 → 本能升级
```

### 学习来源

| 来源 | 学习内容 |
|------|----------|
| 代码变更 | 代码模式、重构技巧 |
| 问题解决 | 问题-解决方案对 |
| 代码审查 | 最佳实践、常见错误 |
| 测试用例 | 测试模式、边界条件 |

## 知识类型

### 1. 代码模式 (code-patterns)

可复用的代码片段和实现模式。

```json
{
  "id": "pattern-001",
  "name": "分页查询模式",
  "type": "code-pattern",
  "context": "MyBatis-Plus分页查询",
  "code": "...",
  "frequency": 15,
  "confidence": 0.95
}
```

**示例模式**:
- 分页查询实现
- 统一返回格式
- 异常处理模式
- 缓存使用模式
- 事务处理模式

### 2. 问题解决方案 (problem-solutions)

遇到的问题及其解决方法。

```json
{
  "id": "solution-001",
  "problem": "MyBatis查询返回null",
  "symptoms": [
    "selectById返回null",
    "数据库确认数据存在"
  ],
  "solutions": [
    "检查@TableName注解",
    "检查字段映射",
    "检查逻辑删除配置"
  ],
  "frequency": 8
}
```

### 3. 团队约定 (conventions)

团队统一的编码规范和约定。

```json
{
  "id": "convention-001",
  "category": "naming",
  "rule": "Service接口使用I前缀",
  "example": "IUserService",
  "rationale": "区分接口和实现类"
}
```

### 4. 本能规则 (instincts)

高频模式自动升级为本能，自动应用。

```json
{
  "id": "instinct-001",
  "trigger": "创建Controller类",
  "action": "自动添加@Tag和@Operation注解",
  "confidence": 0.98,
  "sourcePatterns": ["pattern-003", "pattern-007"]
}
```

## 知识库结构

```
.lcyf/
├── learned-patterns/          # 学习到的模式
│   ├── code-patterns/        # 代码模式
│   │   ├── pagination.json
│   │   └── exception-handling.json
│   ├── problem-solutions/    # 问题解决方案
│   │   └── mybatis-issues.json
│   └── best-practices/       # 最佳实践
│       └── spring-boot.json
├── team-conventions/          # 团队约定
│   ├── naming-rules.json     # 命名规则
│   ├── coding-standards.json # 编码标准
│   └── git-workflow.json     # Git工作流
├── instincts/                 # 本能规则
│   └── auto-patterns.json
└── module-knowledge/          # 模块专属知识
    ├── system/
    ├── sales/
    └── finance/
```

## 学习评估标准

### 模式质量评估

| 指标 | 阈值 | 说明 |
|------|------|------|
| 频率 | ≥3次 | 至少出现3次 |
| 置信度 | ≥0.8 | 成功率80%以上 |
| 通用性 | 跨场景 | 可在多场景应用 |
| 时效性 | <6个月 | 近期仍在使用 |

### 本能升级条件

```
模式 → 本能 条件:
- 频率 ≥ 10次
- 置信度 ≥ 0.95
- 最近30天使用 ≥ 3次
- 无失败案例
```

## 知识应用

### 自动建议

当识别到相似场景时，自动提供相关知识：

```
检测到: 正在实现分页查询
相关知识:
1. [pattern-001] 分页查询模式 (95%相关)
2. [solution-003] 深度分页优化 (78%相关)
```

### 本能自动应用

满足触发条件时，自动应用本能规则：

```
触发本能: instinct-001
自动添加: @Tag注解, @Operation注解
```

## 知识管理命令

```bash
# 列出知识
/lcyf-知识管理 list

# 搜索知识
/lcyf-知识管理 search "分页"

# 添加知识
/lcyf-知识管理 add --type=pattern

# 导出知识库
/lcyf-知识管理 export

# 清理过期知识
/lcyf-知识管理 cleanup
```

## 关联Agent

- 08-学习代理

## 关联命令

- `/lcyf-知识管理` - 知识库管理
