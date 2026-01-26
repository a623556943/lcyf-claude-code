# 数据库设计技能

---
name: database-design
description: lcyf 项目的 MySQL 数据库设计模式、索引策略和查询优化
version: 1.0.0
---

## 概览

全面的数据库设计指导，重点关注：
- MySQL 表设计和规范化
- 索引策略和优化
- 查询性能调优
- 分页最佳实践

## 核心原则

### 1. 表设计
```sql
CREATE TABLE sys_user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT DEFAULT 0,
  INDEX idx_status_deleted (status, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. 索引策略
- 主键：始终使用 BIGINT AUTO_INCREMENT
- 外键：必须建立索引
- 频繁查询的列：添加索引
- 复合索引：将最有选择性的列放在前面
- 避免过度索引：会减慢 INSERT/UPDATE

### 3. 查询优化
- 使用 EXPLAIN 分析查询
- 避免 SELECT *
- 对大型结果集使用 LIMIT
- 正确实现分页
- 识别 N+1 查询问题

### 4. 分页模式
```java
// Mybatis-plus 分页
IPage<User> page = userMapper.selectPage(
    new Page<>(pageNum, pageSize),
    new LambdaQueryWrapper<User>()
        .eq(User::getIsDeleted, 0)
        .orderByDesc(User::getCreatedAt)
);
```

## 相关资源
- db-optimizer agent
- database-design-rules
- MySQL 官方文档
