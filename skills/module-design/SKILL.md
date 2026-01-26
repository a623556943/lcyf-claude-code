# 模块设计技能

---
name: module-design
description: lcyf 项目的多模块依赖管理和接口设计
version: 1.0.0
---

## 概览

多模块架构指导：
- 依赖管理策略
- 接口设计和契约
- 破坏性变更检测
- 版本兼容性

## 核心原则

### 1. 模块结构
```
lcyf-framework           # 基础框架
├── lcyf-module-base     # 共享 DTO 和接口
├── lcyf-module-finance  # 财务领域
├── lcyf-module-policy   # 保单领域
└── lcyf-module-sales    # 销售领域
```

### 2. 依赖规则
- 无循环依赖
- 依赖接口，不依赖实现
- 共享接口放在 `lcyf-module-base`
- 版本管理在父 POM 中

### 3. 接口契约
```java
/**
 * 保单服务接口。
 * @since 1.0.0
 * @version 1.0.0
 */
public interface PolicyService {
    Policy getPolicy(Long policyId);
}
```

### 4. 破坏性变更检测
- 主版本号增量用于破坏性变更
- 删除前先弃用
- 提供迁移指南
- 通知依赖模块

## 相关资源
- module-coordinator agent
- Maven 依赖插件
- 模块架构指南
