# Database Design Skill

---
name: database-design
description: lcyf 项目的 MySQL 数据库设计模式、索引策略和查询优化
version: 1.0.0
---

## Overview

Comprehensive database design guidance focusing on:
- MySQL table design and normalization
- Index strategy and optimization
- Query performance tuning
- Pagination best practices

## Core Principles

### 1. Table Design
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

### 2. Index Strategy
- Primary key: Always BIGINT AUTO_INCREMENT
- Foreign keys: Always indexed
- Frequently queried columns: Add indexes
- Composite indexes: Most selective column first
- Avoid over-indexing: Slows INSERT/UPDATE

### 3. Query Optimization
- Use EXPLAIN to analyze queries
- Avoid SELECT *
- Use LIMIT for large result sets
- Implement pagination correctly
- Identify N+1 query problems

### 4. Pagination Pattern
```java
// Mybatis-plus pagination
IPage<User> page = userMapper.selectPage(
    new Page<>(pageNum, pageSize),
    new LambdaQueryWrapper<User>()
        .eq(User::getIsDeleted, 0)
        .orderByDesc(User::getCreatedAt)
);
```

## Related Resources
- db-optimizer agent
- database-design-rules
- MySQL official documentation
