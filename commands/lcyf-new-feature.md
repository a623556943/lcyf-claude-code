---
description: 完整的新功能开发流程，从需求分析、架构设计到代码实现和知识沉淀。适合实现复杂功能、需要规划的任务。
---

# /lcyf-new-feature

## 概述

完整的新功能开发流程，从需求分析到代码交付。

## 用法

```
/lcyf-new-feature <功能描述>
/lcyf-new-feature 添加用户导出功能
/lcyf-new-feature 实现订单取消流程
```

## 执行流程

```
1. 需求分析
   └── planner: 理解需求，拆分任务

2. 架构设计
   └── architect: 确定技术方案

3. 代码实现
   └── java-developer: 实现代码

4. 知识沉淀
   └── continuous-learning skill: 提取可复用模式
```

## 阶段详情

### 阶段1: 需求分析

**执行Agent**: planner

**输出**:
- 任务分解清单
- 依赖关系图
- 风险评估

**示例输出**:
```markdown
## 任务计划: 用户导出功能

### 概述
- 目标: 实现用户列表的Excel导出
- 预计任务: 5个子任务
- 模块: system

### 任务分解
1. [ ] 创建导出DTO
2. [ ] 实现导出Service方法
3. [ ] 添加导出Controller接口
4. [ ] 添加导出权限

### 依赖关系
- 任务3依赖任务2
- 任务4依赖任务2
```

### 阶段2: 架构设计

**执行Agent**: architect

**检查项**:
- [ ] 符合模块边界
- [ ] 符合分层架构
- [ ] 无循环依赖

### 阶段3: 代码实现

**执行Agent**: java-developer

**工作流**:
```
理解需求 → 编写代码 → 验证功能
```

### 阶段4: 知识沉淀

**学习内容**:
- 可复用的代码模式
- 问题解决方案
- 最佳实践

## 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| 功能描述 | 要实现的功能 | 添加用户导出功能 |
| --module | 指定模块 | --module system |
| --skip-test | 跳过测试（不推荐） | --skip-test |

## 关联命令

- `/lcyf-code-review` - 代码审查
- `/lcyf-learn` - 知识沉淀

## 关联Agent

- planner
- architect
- java-developer
- knowledge-manager

## 关联规则

- 00-总则
- 06-Java编码规范
- 07-SpringBoot最佳实践
