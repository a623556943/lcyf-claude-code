---
description: 执行代码质量审查，包括规范检查、架构合规性分析。适合代码提交前或PR审查时使用。
---

# /lcyf-code-review

## 概述

执行代码质量审查，包括规范检查和架构合规性分析。

## 用法

```bash
/lcyf-code-review
/lcyf-code-review --scope=changed    # 只审查变更的文件（推荐）
/lcyf-code-review --scope=module --module=system  # 审查指定模块
/lcyf-code-review --scope=all        # 审查整个项目（耗时）
/lcyf-code-review --help             # 显示帮助信息
```

## 审查范围

### 默认范围
- Git暂存区的文件
- 未提交的修改

### 可选范围
- `--scope=changed` - 变更的文件
- `--scope=module` - 指定模块
- `--scope=all` - 整个项目

## 审查内容

### 1. 代码规范检查

**执行Agent**: code-reviewer

**检查项**:
- 命名规范
- 代码格式
- 注释规范
- 代码复杂度

### 2. 架构合规性

**检查项**:
- 分层架构遵守
- 模块边界
- 依赖方向

### 3. 代码质量

**检查项**:
- 代码重复
- 圈复杂度
- 可读性

## 输出格式

```markdown
# 代码审查报告

## 审查范围
- 文件数量: 5
- 代码行数: 320

## 问题汇总

| 级别 | 数量 | 状态 |
|------|------|------|
| 严重 | 0 | 通过 |
| 重要 | 2 | 警告 |
| 一般 | 5 | 警告 |
| 建议 | 3 | 信息 |

## 详细问题

### 重要问题

#### 1. 缺少输入验证
- **位置**: UserController.java:45
- **问题**: create方法未验证参数
- **建议**: 添加@Valid注解

#### 2. 代码重复
- **位置**: OrderService, PaymentService
- **问题**: 相似的分页逻辑
- **建议**: 提取通用方法

## 质量指标

| 指标 | 值 | 标准 | 状态 |
|------|-----|------|------|
| 代码重复率 | 3% | <=5% | 通过 |
| 圈复杂度 | 8 | <=10 | 通过 |
| 方法长度 | 35 | <=50 | 通过 |

## 结论
审查通过/未通过，请修复重要问题后重新提交
```

## 问题分级

| 级别 | 说明 | 处理要求 |
|------|------|----------|
| 严重 | 功能缺陷、严重违规 | 必须修复 |
| 重要 | 性能问题、规范违规 | 强烈建议修复 |
| 一般 | 代码风格、可读性 | 建议修复 |
| 建议 | 优化建议 | 可选 |

## 参数

| 参数 | 说明 | 可选值 | 默认值 | 必需 |
|------|------|--------|--------|------|
| --scope | 审查范围 | changed \| module \| all | changed | 否 |
| --module | 指定模块（scope=module时需要） | system \| sales \| finance 等 | - | 条件必需 |
| --fix | 自动修复简单问题 | true \| false | false | 否 |
| --severity | 最低严重程度过滤 | critical \| high \| medium \| low | low | 否 |

### 参数校验规则

**--scope 参数**:
```bash
# ✓ 正确
/lcyf-code-review --scope=changed
/lcyf-code-review --scope=module --module=system
/lcyf-code-review --scope=all

# ✗ 错误示例
/lcyf-code-review --scope=invalid
# 错误提示: 参数错误: scope 值无效
#           期望: changed | module | all
#           实际: invalid
#           提示: 查看帮助 /lcyf-code-review --help

/lcyf-code-review --scope=module
# 错误提示: 参数缺失: scope=module 时必须指定 --module 参数
#           示例: /lcyf-code-review --scope=module --module=system
#           可用模块: system, sales, finance, product-factory
```

**--module 参数**:
```bash
# ✓ 正确
/lcyf-code-review --scope=module --module=system

# ✗ 错误示例
/lcyf-code-review --scope=module --module=unknown
# 错误提示: 模块不存在: unknown
#           可用模块:
#             • system (基础系统服务)
#             • sales (销售模块)
#             • finance (财务模块)
#             • product-factory (产品工厂)
#           提示: 检查拼写或运行 /lcyf-learn modules 查看所有模块
```

**--fix 参数**:
```bash
# ✓ 正确
/lcyf-code-review --fix
/lcyf-code-review --fix=true
/lcyf-code-review --fix=false

# ✗ 错误示例
/lcyf-code-review --fix=yes
# 错误提示: 参数错误: --fix 值无效
#           期望: true | false (或省略值默认为true)
#           实际: yes
```

### 智能提示

执行命令时，系统会自动提示：

```bash
/lcyf-code-review --scope=

💡 智能提示:
  可用选项:
  • changed  - 只审查变更的文件（推荐，快速）
  • module   - 审查指定模块（需要 --module=xxx）
  • all      - 审查整个项目（耗时较长）

  当前Git状态:
  • 已修改: 5个文件
  • 涉及模块: system, sales

  建议: 使用 --scope=changed
```

```bash
/lcyf-code-review --scope=module --module=

💡 智能提示:
  可用模块:
  • system           - 基础系统服务 (23个文件)
  • sales            - 销售模块 (45个文件)
  • finance          - 财务模块 (31个文件)
  • product-factory  - 产品工厂 (18个文件)

  最近修改的模块:
  • system (5个文件变更)
  • sales (2个文件变更)
```

## 关联命令

- `/lcyf-new-feature` - 新功能开发

## 关联规则

- 02-编码风格
- 06-Java编码规范
- 07-SpringBoot最佳实践
