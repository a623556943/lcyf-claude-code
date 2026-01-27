---
description: 增量修复Maven/Gradle构建错误和编译错误。适合构建失败、编译错误或依赖问题时使用。
---

# /lcyf-build-fix

## 元数据
- **使用 Agents:** java-developer
- **遵循 Rules:** 06-Java编码规范, 07-SpringBoot最佳实践, 08-MyBatis规范

## 命令说明
增量修复Maven/Gradle构建错误和编译错误

## 执行流程

### 1. 运行构建
根据项目类型执行构建命令：
- Maven: `mvn clean compile -U`
- Gradle: `gradle clean build`

### 2. 解析错误输出
- 按文件分组错误
- 按严重程度排序
- 识别错误类型：
  - 编译错误（语法错误、类型错误）
  - 依赖问题（缺少依赖、版本冲突）
  - 注解处理错误（Lombok、MyBatis-Plus）
  - 资源文件错误（配置文件、Mapper XML）

### 3. 修复每个错误
对每个错误执行：

a) **显示错误上下文**
   - 显示错误代码前后5行
   - 高亮错误位置
   - 显示错误信息

b) **分析问题**
   - 识别根本原因
   - 检查是否影响其他文件
   - 评估修复风险

c) **提出修复方案**
   - 给出具体修复代码
   - 说明修复理由
   - 标注潜在副作用

d) **应用修复**
   - 使用Edit工具修改代码
   - 保持代码风格一致
   - 更新相关注释

e) **验证修复**
   - 重新运行构建
   - 确认错误已解决
   - 检查是否引入新错误

### 4. 停止条件
遇到以下情况立即停止：
- 修复引入新错误
- 同一错误尝试3次后仍未解决
- 用户请求暂停
- 检测到循环依赖问题

### 5. 生成修复报告
```
构建修复报告
==============
开始时间: 2025-01-26 10:30
结束时间: 2025-01-26 10:45

修复统计
--------
已修复: 8个错误
剩余: 2个错误
新增: 0个错误

详细列表
--------
1. 已修复 UserController.java:45 - 缺少@Valid注解
2. 已修复 OrderServiceImpl.java:120 - 返回类型不匹配
3. 已修复 ProductMapper.xml:30 - SQL语法错误
4. 未修复 PaymentService.java:88 - 循环依赖（需要架构调整）

建议
----
- 剩余错误需要模块重构，建议联系architect agent
```

## 常见错误类型及修复策略

### 编译错误
- **未找到符号**: 检查import、拼写、依赖
- **类型不匹配**: 检查泛型、类型转换
- **方法未定义**: 检查继承、接口实现

### 依赖问题
- **ClassNotFoundException**: 检查pom.xml依赖
- **版本冲突**: 使用dependencyManagement统一版本
- **循环依赖**: 需要架构调整，联系architect agent

### 注解处理错误
- **Lombok编译失败**: 检查IDE插件、Maven插件配置
- **MyBatis-Plus代码生成失败**: 检查数据库连接、配置

### 配置错误
- **application.yml语法错误**: YAML格式检查
- **Mapper XML错误**: SQL语法、resultMap配置

## 注意事项
- **一次只修复一个错误**，确保安全
- **每次修复后验证**，避免连锁反应
- **保留错误日志**，便于回溯
- **遇到架构问题立即停止**，不要强行修改

## 示例用法

```
用户: /lcyf-build-fix

Claude:
正在运行构建...
mvn clean compile -U

检测到5个编译错误：

1. UserController.java:45 - 缺少@Valid注解
   错误: @RequestBody参数缺少验证注解
   修复: 添加@Valid注解
   应用修复...
   已修复

2. OrderServiceImpl.java:120 - 返回类型不匹配
   ...
```

## 关联命令

- `/lcyf-code-review` - 修复完成后进行审查
- `/lcyf-new-feature` - 新功能开发

## 关联Agent

- java-developer
- architect (循环依赖问题时)
