# /lcyf-API审查

## 概述

审查REST API设计的规范性、一致性和安全性。

## 用法

```
/lcyf-API审查
/lcyf-API审查 --module=system
/lcyf-API审查 --file=UserController.java
```

## 审查内容

### 1. URL设计

**检查项**:
- [ ] 使用名词复数
- [ ] 使用小写字母和连字符
- [ ] 资源层级合理
- [ ] 版本控制一致

```
✅ /api/v1/users
✅ /api/v1/users/{id}/orders
❌ /api/v1/getUsers
❌ /api/v1/user_list
```

### 2. HTTP方法

**检查项**:
- [ ] GET用于查询
- [ ] POST用于创建
- [ ] PUT用于更新
- [ ] DELETE用于删除

### 3. 请求参数

**检查项**:
- [ ] 参数验证完整
- [ ] 命名规范一致
- [ ] 分页参数标准

```java
// ✅ 正确
@GetMapping("/page")
public CommonResult<PageResult<UserDTO>> page(
    @Valid UserPageQuery query) {}

// ❌ 缺少验证
@GetMapping("/page")
public CommonResult<PageResult<UserDTO>> page(
    UserPageQuery query) {}
```

### 4. 响应格式

**检查项**:
- [ ] 统一返回CommonResult
- [ ] 错误码规范
- [ ] 响应数据脱敏

### 5. 安全性

**检查项**:
- [ ] 权限注解配置
- [ ] 敏感数据保护
- [ ] 接口限流配置

## 输出格式

```markdown
# API审查报告

## 审查范围
- Controller数量: 5
- API接口数量: 32

## 问题汇总

| 类型 | 数量 |
|------|------|
| URL设计 | 3 |
| HTTP方法 | 1 |
| 参数验证 | 5 |
| 响应格式 | 2 |
| 安全性 | 4 |

## 详细问题

### URL设计问题

#### 1. 使用动词
- **位置**: OrderController.java:25
- **问题**: `/api/orders/getList`
- **建议**: 改为 `/api/orders`

### 参数验证问题

#### 1. 缺少@Valid注解
- **位置**: UserController.java:30
- **问题**: create方法参数未验证
- **建议**: 添加@Valid注解

### 安全性问题

#### 1. 缺少权限控制
- **位置**: ReportController.java:15
- **问题**: 导出接口无权限校验
- **建议**: 添加@PreAuthorize注解

## API文档检查

| 接口 | @Operation | @Parameter | 状态 |
|------|------------|------------|------|
| GET /users | ✅ | ✅ | 通过 |
| POST /users | ✅ | ❌ | 不通过 |
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --module | 指定模块 | 全部 |
| --file | 指定文件 | 全部 |
| --fix | 自动修复 | false |

## 关联命令

- `/lcyf-代码审查` - 综合代码审查
- `/lcyf-新功能` - 新功能开发

## 关联Agent

- 03-Java开发专家
- 05-代码审查专家

## 关联规则

- 09-API设计规范
