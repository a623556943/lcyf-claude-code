# lcyf-db-review 命令

lcyf 项目的数据库设计审查。

## 命令

`/lcyf-db-review [table_name]`

## 描述

审查数据库设计的以下方面：
- 表结构优化
- 索引策略
- 查询性能
- 事务管理

## 使用方式

```
/lcyf-db-review              # 审查所有数据库变更
/lcyf-db-review sys_user     # 审查特定表
```

## 实现

调用 `db-optimizer` agent 进行全面的数据库审查。

## 输出

包含性能等级和优化建议的审查报告。
