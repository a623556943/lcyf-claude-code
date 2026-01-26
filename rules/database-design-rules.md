# Database Design Rules

Always-follow guidelines for database design in lcyf projects.

## Table Naming

- Use lowercase with underscores: `sys_user`, `order_item`
- Plural for collection tables: `users`, `orders`
- Prefix system tables with `sys_`

## Column Design

- ID columns: BIGINT AUTO_INCREMENT
- Strings: VARCHAR(n), not TEXT for short strings
- Dates: TIMESTAMP or DATETIME
- Boolean: TINYINT (0/1)
- Always include created_at and updated_at

## Index Strategy

- Primary key: AUTO_INCREMENT BIGINT
- Foreign keys: Always indexed
- Frequently queried columns: Add indexes
- Composite indexes: Most selective column first
- Avoid over-indexing

## Required Fields

Every table MUST have:
- `id` (BIGINT AUTO_INCREMENT PRIMARY KEY)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- `is_deleted` (TINYINT DEFAULT 0) for soft delete

## Performance Rules

- Use EXPLAIN to analyze queries
- Avoid SELECT *
- Implement pagination for large datasets
- Use LIMIT appropriately
- Identify N+1 query problems

## Constraints

- Define UNIQUE constraints for business keys
- Use FOREIGN KEY constraints
- Set NOT NULL where appropriate
- Use CHECK constraints for validation

---

遵循这些规则以确保数据库设计质量。
