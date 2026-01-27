---
description: 审查数据库设计和SQL操作的规范性、性能和安全性。适合数据库变更、SQL优化或性能问题排查。
---

# /lcyf-db-review

## 概述

审查数据库设计和SQL操作的规范性、性能和安全性。

## 用法

```
/lcyf-db-review
/lcyf-db-review --module=system
/lcyf-db-review --check-sql       # 检查SQL性能
/lcyf-db-review --check-schema    # 检查表结构
```

## 审查内容

### 1. 表结构设计

**检查项**:
- [ ] 表名命名规范（模块前缀+业务名）
- [ ] 字段名命名规范（小写+下划线）
- [ ] 必备字段完整（id, create_time, update_time, deleted等）
- [ ] 字段类型合理

```sql
-- ✅ 正确
CREATE TABLE system_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BIT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

-- ❌ 问题: 缺少审计字段
CREATE TABLE user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    PRIMARY KEY (id)
);
```

### 2. 索引设计

**检查项**:
- [ ] 主键索引存在
- [ ] 常用查询字段有索引
- [ ] 无冗余索引
- [ ] 复合索引顺序合理

### 3. SQL性能

**检查项**:
- [ ] 避免SELECT *
- [ ] 避免N+1查询
- [ ] 分页查询优化
- [ ] 使用参数化查询

```java
// ❌ N+1问题
List<User> users = userMapper.selectList();
for (User user : users) {
    Dept dept = deptMapper.selectById(user.getDeptId()); // 循环查询
}

// ✅ 批量查询
List<User> users = userMapper.selectList();
Set<Long> deptIds = users.stream().map(User::getDeptId).collect(toSet());
Map<Long, Dept> deptMap = deptMapper.selectBatchIds(deptIds)
    .stream().collect(toMap(Dept::getId, identity()));
```

### 4. 安全性

**检查项**:
- [ ] 无SQL注入风险
- [ ] 敏感字段加密
- [ ] 软删除使用

## 输出格式

```markdown
# 数据库审查报告

## 审查范围
- 表数量: 25
- Mapper数量: 20
- SQL语句: 150

## 问题汇总

| 类型 | 数量 | 严重性 |
|------|------|--------|
| 表结构 | 3 | 中 |
| 索引 | 2 | 低 |
| SQL性能 | 5 | 中 |
| 安全性 | 1 | 高 |

## 详细问题

### 安全性问题

#### 1. SQL注入风险
- **位置**: UserMapper.xml:45
- **问题**: 使用字符串拼接
- **SQL**: `SELECT * FROM user WHERE name = '${name}'`
- **修复**: 改为 `#{name}`

### SQL性能问题

#### 1. N+1查询
- **位置**: OrderService.java:30
- **问题**: 循环查询用户信息
- **影响**: 性能下降，数据库压力
- **修复**: 使用批量查询

#### 2. 缺少分页
- **位置**: ReportMapper.java:15
- **问题**: 全量查询无LIMIT
- **影响**: 大数据量时OOM风险
- **修复**: 添加分页参数

### 索引问题

#### 1. 缺少索引
- **表**: system_user
- **字段**: status
- **使用场景**: 状态筛选查询
- **建议**: `CREATE INDEX idx_user_status ON system_user(status)`

## 慢查询分析

| SQL | 执行时间 | 建议 |
|-----|----------|------|
| SELECT * FROM order WHERE... | 2.5s | 添加索引 |
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --module | 指定模块 | 全部 |
| --check-sql | 检查SQL性能 | true |
| --check-schema | 检查表结构 | true |
| --explain | 执行EXPLAIN分析 | false |

## 关联命令

- `/lcyf-code-review` - 综合代码审查
- `/lcyf-new-feature` - 新功能开发

## 关联Agent

- java-developer

## 关联Skill

- java-full-stack

## 关联规则

- 08-MyBatis规范
- 10-数据库设计规范
- 05-性能优化
