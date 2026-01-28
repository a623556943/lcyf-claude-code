---
description: 新功能开发流程，从需求分析、架构设计到代码实现。
---

# /lcyf-new-feature

新功能开发流程，聚焦需求分析、架构设计和代码实现。

## 用法

```bash
/lcyf-new-feature <功能描述>
/lcyf-new-feature 添加用户导出功能
/lcyf-new-feature 实现订单取消流程
```

## 执行流程

1. **planner** 分析需求，拆分任务
2. **java-developer** 实现功能代码

## 后续步骤（需手动触发）

完成开发后，建议执行：
- 代码审查: `/lcyf-code-review`
- 知识沉淀: `/lcyf-learn extract`

## 关联规则

- 00-总则
- 06-Java编码规范
- 07-SpringBoot最佳实践

---

## 执行指令

当用户执行此命令时，启动 planner agent 来协调整个开发流程。

### planner agent 职责

1. **优先使用 jetbrains mcp 检索项目工程**（调用 `mcp__jetbrains__*` 工具），如无法使用再使用 Glob/Grep 等其他方式
2. 分析需求，拆分为可执行的子任务
3. 输出结构化的任务计划（带预览）
4. 等待用户确认后，依次调用其他 agent 执行任务:
   - java-developer (代码实现)
5. 显示进度状态，输出完整的执行报告
6. 提醒用户手动执行后续步骤

### java-developer agent 职责

1. **优先使用 jetbrains mcp 检索项目工程**（调用 `mcp__jetbrains__*` 工具），如无法使用再使用 Glob/Grep 等其他方式
2. 根据 planner 的任务计划实现功能代码
3. 保证代码符合 LCYF 编码规范和 Spring Boot 最佳实践
5. 提供实现完成报告

### 执行流程

```
阶段1: 需求分析
  ├─ planner 分析需求
  ├─ 生成任务计划
  └─ 等待用户确认 ✋
       ├─ [y] 继续执行
       ├─ [n] 取消
       └─ [edit] 调整计划

阶段2: 开始执行 (用户确认后)
  ├─ java-developer 实现代码
  │   └─ 显示进度: ▶ java-developer (进行中)
  └─ 完成提醒
```

### 执行要求

**必须做**:
- 启动 planner agent 进行需求分析
- 输出详细的任务计划（包含：目标、任务分解、风险评估、验收标准）
- **等待用户确认**后再执行
- 执行过程中显示进度状态
- 任务完成后提醒用户执行代码审查和知识沉淀

**禁止做**:
- 未经用户确认就直接执行
- 跳过任何阶段
- 自动触发 code-reviewer 或 knowledge-manager
