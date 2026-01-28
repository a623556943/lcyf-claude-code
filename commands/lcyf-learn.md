---
description: 管理项目知识库，包括学习到的模式、团队约定、问题解决方案。适合知识沉淀、模式提取或团队经验分享。
---

# /lcyf-learn

## 概述

管理项目知识库，包括学习到的模式、团队约定、问题解决方案。

## 用法

```
/lcyf-learn list              # 列出知识库内容
/lcyf-learn search <关键词>   # 搜索知识
/lcyf-learn add               # 添加知识
/lcyf-learn export            # 导出知识库
/lcyf-learn import <文件>     # 导入知识库
/lcyf-learn cleanup           # 清理过期知识
```

## 子命令

### list - 列出知识

```
/lcyf-learn list
/lcyf-learn list --type=pattern    # 只列出模式
/lcyf-learn list --type=solution   # 只列出解决方案
/lcyf-learn list --type=convention # 只列出约定
```

### search - 搜索知识

```
/lcyf-learn search MyBatis分页
/lcyf-learn search "用户认证"
```

### add - 添加知识

```
/lcyf-learn add --type=pattern
/lcyf-learn add --type=solution
/lcyf-learn add --type=convention
```

### export/import - 导出导入

```
/lcyf-learn export knowledge.json
/lcyf-learn import team-knowledge.json
```

## 知识类型

### 1. 代码模式 (pattern)

可复用的代码模式和最佳实践。

```json
{
  "id": "pattern-001",
  "type": "pattern",
  "name": "MyBatis-Plus分页查询",
  "description": "使用LambdaQueryWrapper实现分页查询",
  "code": "...",
  "tags": ["mybatis", "分页"],
  "frequency": 15
}
```

### 2. 问题解决方案 (solution)

遇到的问题及其解决方案。

```json
{
  "id": "solution-001",
  "type": "solution",
  "problem": "MyBatis查询返回null但数据库有数据",
  "symptoms": ["selectById返回null", "数据确认存在"],
  "solutions": [
    "检查@TableName注解",
    "检查字段映射",
    "检查逻辑删除配置"
  ],
  "tags": ["mybatis", "troubleshooting"]
}
```

### 3. 团队约定 (convention)

团队的编码约定和规范。

```json
{
  "id": "convention-001",
  "type": "convention",
  "category": "naming",
  "rule": "Service接口使用I前缀",
  "example": "IUserService",
  "rationale": "区分接口和实现类"
}
```

## 知识库结构

```
docs/
├── knowledge/                     # 知识库根目录
│   ├── learned-patterns/          # 学习到的模式
│   │   ├── code-patterns/
│   │   ├── problem-solutions/
│   │   └── best-practices/
│   ├── team-conventions/          # 团队约定
│   │   ├── naming-rules.json
│   │   ├── coding-standards.json
│   │   └── git-workflow.json
│   ├── instincts/                 # 本能规则
│   │   └── auto-patterns.json
│   └── module-knowledge/          # 模块专属知识
│       ├── system/
│       ├── sales/
│       └── finance/
```

## 输出格式

### 知识列表

```markdown
# 知识库概览

## 统计
- 代码模式: 25
- 问题解决方案: 18
- 团队约定: 12
- 本能规则: 8

## 最近添加

| 类型 | 名称 | 添加时间 | 使用次数 |
|------|------|----------|----------|
| pattern | 分页查询模式 | 2025-01-26 | 15 |
| solution | MyBatis返回null | 2025-01-25 | 8 |
| convention | Service命名规范 | 2025-01-20 | 5 |

## 高频使用

1. **分页查询模式** (15次)
2. **统一返回格式** (12次)
3. **异常处理模式** (10次)
```

### 搜索结果

```markdown
# 搜索结果: "分页"

## 找到 3 条相关知识

### 1. MyBatis-Plus分页查询 (pattern)
- **相关度**: 95%
- **使用次数**: 15
- **摘要**: 使用LambdaQueryWrapper实现分页查询

### 2. 分页参数验证 (convention)
- **相关度**: 78%
- **描述**: pageNo最小为1，pageSize最大为100

### 3. 深度分页优化 (solution)
- **相关度**: 65%
- **问题**: LIMIT offset过大导致性能问题
- **解决**: 使用游标分页
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --type | 知识类型 | 全部 |
| --limit | 显示数量 | 20 |
| --sort | 排序方式 | frequency |

## 关联命令

- `/lcyf-new-feature` - 新功能开发

## 关联规则

- 00-总则
- 02-编码风格

---

## 执行指令

当用户执行此命令时，立即启动 **knowledge-manager** agent 来执行知识管理任务。

### knowledge-manager agent 职责

1. 根据子命令执行相应操作:
   - `list`: 读取并展示知识库内容
   - `search`: 搜索匹配的知识条目
   - `add`: 引导用户添加新知识
   - `export`: 导出知识库为 JSON/Markdown
   - `cleanup`: 清理过期知识

2. 自动维护知识库:
   - 更新使用频率
   - 评估本能升级条件
   - 合并相似模式

### 执行要求

**必须做**:
- 立即启动 knowledge-manager agent
- 根据子命令执行相应操作
- 操作完成后输出清晰的结果报告

**禁止做**:
- 手动操作知识库文件（应通过 agent 操作）
- 跳过知识质量评估
