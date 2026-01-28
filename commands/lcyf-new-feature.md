---
description: 完整的新功能开发流程，从需求分析、架构设计到代码实现和知识沉淀。
---

# /lcyf-new-feature

完整的新功能开发流程。

## 用法

```bash
/lcyf-new-feature <功能描述>
/lcyf-new-feature 添加用户导出功能
/lcyf-new-feature 实现订单取消流程
```

## 执行流程

1. **planner** 分析需求，拆分任务
2. **architect** 完成架构设计
3. **java-developer** 实现功能代码

## 关联规则

- 00-总则
- 06-Java编码规范
- 07-SpringBoot最佳实践

---

## 执行指令

当用户执行此命令时，立即启动 planner agent 来协调整个开发流程。

### planner agent 职责

1. 分析需求，拆分为可执行的子任务
2. 输出结构化的任务计划
3. 自动依次调用其他 agent 执行任务:
   - architect (架构设计)
   - java-developer (代码实现)
   - code-reviewer (代码审查)
   - knowledge-manager (知识沉淀)
4. 输出完整的执行报告

### 执行要求

**必须做**:
- 立即启动 planner agent，无需询问或等待
- planner 自动调用所有后续 agent
- 按顺序执行，上一阶段完成才能进入下一阶段

**禁止做**:
- 只输出计划而不执行
- 等待用户确认
- 跳过任何阶段
