# 数据库设计规范

lcyf 项目中必须遵守的数据库设计规范。

## 表命名

- 使用小写加下划线：`sys_user`、`order_item`
- 集合表使用复数：`users`、`orders`
- 系统表使用 `sys_` 前缀

## 字段设计

- **ID 字段**: BIGINT AUTO_INCREMENT
- **字符串**: 短字符串使用 VARCHAR(n)，不要用 TEXT
- **日期**: TIMESTAMP 或 DATETIME
- **布尔值**: TINYINT（0/1）
- **必需**: 所有表都必须包含 created_at 和 updated_at

## 索引策略

- **主键**: AUTO_INCREMENT BIGINT
- **外键**: 必须建立索引
- **频繁查询的列**: 添加索引
- **复合索引**: 最有选择性的列放在前面
- **避免过度索引**

## 必需字段

每个表都 **必须** 包含：
- `id` (BIGINT AUTO_INCREMENT PRIMARY KEY)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- `is_deleted` (TINYINT DEFAULT 0) 用于软删除

## 性能规则

- 使用 EXPLAIN 分析查询
- 避免 SELECT *
- 为大型数据集实现分页
- 适当使用 LIMIT
- 识别 N+1 查询问题

## 约束

- 为业务键定义 UNIQUE 约束
- 使用 FOREIGN KEY 约束
- 在适当的地方使用 NOT NULL
- 使用 CHECK 约束进行验证

---

遵循这些规则以确保数据库设计质量和性能。
