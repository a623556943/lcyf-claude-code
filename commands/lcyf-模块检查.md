# /lcyf-模块检查

## 概述

检查模块间依赖关系，确保模块边界清晰、无循环依赖。

## 用法

```
/lcyf-模块检查
/lcyf-模块检查 --module=policy     # 检查指定模块
/lcyf-模块检查 --graph             # 生成依赖图
/lcyf-模块检查 --strict            # 严格模式
```

## 检查内容

### 1. 依赖方向

**检查项**:
- [ ] 依赖方向符合规范
- [ ] 无反向依赖
- [ ] 无循环依赖

```
允许的依赖:
base ← system ← sales ← policy ← finance
          ↑
     product-factory

禁止的依赖:
system → sales（反向依赖）
sales → policy → sales（循环依赖）
```

### 2. 跨层调用

**检查项**:
- [ ] Controller不直接调用Mapper
- [ ] 不依赖其他模块的ServiceImpl
- [ ] 通过API接口跨模块调用

```java
// ❌ 禁止: 直接依赖实现类
import com.lcyf.cloud.system.biz.service.impl.UserServiceImpl;

// ✅ 正确: 通过API接口
import com.lcyf.cloud.system.api.UserApi;
```

### 3. POM依赖

**检查项**:
- [ ] 只依赖允许的模块
- [ ] 只依赖api包，不依赖biz包
- [ ] 版本统一

```xml
<!-- ✅ 正确: 依赖api包 -->
<dependency>
    <groupId>com.lcyf.cloud</groupId>
    <artifactId>lcyf-module-system-api</artifactId>
</dependency>

<!-- ❌ 禁止: 依赖biz包 -->
<dependency>
    <groupId>com.lcyf.cloud</groupId>
    <artifactId>lcyf-module-system-biz</artifactId>
</dependency>
```

## 输出格式

```markdown
# 模块依赖检查报告

## 检查概览
- 模块数量: 6
- 依赖关系: 12

## 依赖关系图

```
base ────────────────────────────────────────
  ↑
  │
system ←── product-factory
  ↑
  │
sales ───────────────────────────────────────
  ↑
  │
policy ──────────────────────────────────────
  ↑
  │
finance ─────────────────────────────────────
```

## 问题发现

### 🔴 循环依赖

#### 1. sales ↔ policy
- **详情**: sales依赖policy，policy依赖sales
- **影响**: 编译顺序问题，模块耦合
- **建议**: 提取公共接口到base模块

### 🟠 依赖方向错误

#### 1. system → sales
- **位置**: lcyf-module-system/pom.xml
- **问题**: system模块依赖了sales模块
- **建议**: 通过事件或消息解耦

### 🟡 跨层调用

#### 1. PolicyController → UserMapper
- **位置**: PolicyController.java:35
- **问题**: Controller直接调用其他模块的Mapper
- **建议**: 通过UserApi调用

## 模块依赖矩阵

| 模块 | base | system | sales | finance | policy |
|------|------|--------|-------|---------|--------|
| base | - | | | | |
| system | ✅ | - | ❌ | | |
| sales | ✅ | ✅ | - | | |
| finance | ✅ | ✅ | | - | ✅ |
| policy | ✅ | ✅ | ✅ | | - |

## 修复建议

1. 解决循环依赖: 提取公共接口
2. 修正依赖方向: 使用事件驱动
3. 消除跨层调用: 通过API接口
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --module | 指定模块 | 全部 |
| --graph | 生成依赖图 | false |
| --strict | 严格模式 | false |
| --fix | 自动修复pom | false |

## 关联命令

- `/lcyf-代码审查` - 综合代码审查
- `/lcyf-新功能` - 新功能开发

## 关联Agent

- 04-模块协调专家
- 02-架构专家

## 关联规则

- 11-模块依赖规范
