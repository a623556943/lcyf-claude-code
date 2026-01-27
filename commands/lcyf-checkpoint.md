---
description: 在开发流程中创建、验证或列出检查点，用于追踪开发进度和质量。适合功能开发过程中的阶段性记录。
---

# /lcyf-checkpoint

## 元数据
- **使用 Agents:** tdd-guide, code-reviewer
- **遵循 Rules:** 00-总则, 03-测试要求, 04-Git工作流

## 命令说明
在开发流程中创建、验证或列出检查点，用于追踪开发进度和质量

## 使用方式

```
/lcyf-checkpoint create <名称>    # 创建检查点
/lcyf-checkpoint verify <名称>    # 验证检查点
/lcyf-checkpoint list              # 列出所有检查点
/lcyf-checkpoint clear             # 清理旧检查点
```

## 创建检查点 (create)

### 执行步骤

1. **运行快速验证**
   ```bash
   # 运行快速检查确保当前状态干净
   mvn clean test -Dtest=*Test
   ```

2. **创建Git提交或暂存**
   ```bash
   # 如果有未提交的更改，创建临时提交
   git add .
   git commit -m "checkpoint: <名称>"

   # 或者创建stash
   git stash push -m "checkpoint: <名称>"
   ```

3. **记录检查点**
   在 `.lcyf/checkpoints.log` 中记录：
   ```
   2025-01-26 10:30 | 功能开始 | abc123f | 所有测试通过
   ```

4. **报告检查点信息**
   ```
   检查点已创建: 功能开始
   时间: 2025-01-26 10:30
   Git SHA: abc123f
   测试状态: 23/23 通过
   覆盖率: 85%
   ```

## 验证检查点 (verify)

### 对比当前状态与检查点

1. **读取检查点信息**
   从 `.lcyf/checkpoints.log` 读取检查点数据

2. **对比变更**
   ```bash
   # 对比文件变更
   git diff <checkpoint-sha> --stat

   # 运行测试
   mvn test

   # 检查覆盖率
   mvn jacoco:report
   ```

3. **生成对比报告**
   ```
   检查点对比: 功能开始 vs 当前
   ================================
   时间差: 2小时15分钟
   Git SHA: abc123f -> def456a

   文件变更
   --------
   新增文件: 3
   修改文件: 8
   删除文件: 0

   测试状态
   --------
   检查点: 23/23 通过 (85% 覆盖率)
   当前:   28/28 通过 (87% 覆盖率)
   变化:   +5 测试, +2% 覆盖率

   构建状态
   --------
   检查点: PASS
   当前:   PASS

   代码质量
   --------
   Checkstyle: 无新增警告
   PMD: 无新增问题

   结论: 进展良好
   ```

## 列出检查点 (list)

显示所有检查点及状态：

```
检查点列表
==========
1. 功能开始
   时间: 2025-01-26 08:00
   SHA:  abc123f
   状态: ← 3次提交之前

2. 核心完成
   时间: 2025-01-26 10:30
   SHA:  def456a
   状态: ← 1次提交之前

3. 重构完成
   时间: 2025-01-26 14:00
   SHA:  ghi789b
   状态: → 当前位置

4. 测试完成
   时间: 2025-01-26 16:00
   SHA:  jkl012c
   状态: ← 准备合并
```

## 清理检查点 (clear)

保留最近5个检查点，删除旧的：

```bash
# 备份检查点日志
cp .lcyf/checkpoints.log .lcyf/checkpoints.log.bak

# 保留最近5个
tail -n 5 .lcyf/checkpoints.log > .lcyf/checkpoints.log.tmp
mv .lcyf/checkpoints.log.tmp .lcyf/checkpoints.log

echo "已清理旧检查点，保留最近5个"
```

## 典型工作流

### 场景1: 功能开发流程

```
[开始]
  ↓
/lcyf-checkpoint create "功能开始"
  ↓
[实现核心逻辑]
  ↓
/lcyf-checkpoint create "核心完成"
  ↓
/lcyf-checkpoint verify "核心完成"  # 验证质量
  ↓
[重构优化]
  ↓
/lcyf-checkpoint create "重构完成"
  ↓
[编写测试]
  ↓
/lcyf-checkpoint create "测试完成"
  ↓
/lcyf-checkpoint verify "功能开始"  # 对比起点
  ↓
[创建PR]
```

### 场景2: Bug修复流程

```
[发现Bug]
  ↓
/lcyf-checkpoint create "修复前"
  ↓
[修复Bug]
  ↓
/lcyf-checkpoint verify "修复前"  # 确认改进
  ↓
[回归测试]
  ↓
/lcyf-checkpoint create "修复完成"
```

## 检查点目录结构

```
.lcyf/
├── checkpoints.log           # 检查点日志
├── checkpoints.log.bak       # 备份
└── checkpoint-reports/       # 对比报告
    ├── 2025-01-26-功能开始.md
    └── 2025-01-26-核心完成.md
```

## 注意事项

- **创建检查点前先验证**: 确保当前状态是稳定的
- **定期创建检查点**: 在关键节点创建（如完成核心功能、重构完成）
- **使用有意义的名称**: 便于理解检查点的目的
- **不要过度使用**: 太多检查点会增加管理复杂度
- **结合Git使用**: 检查点不替代Git提交，而是补充

## 关联命令

- `/lcyf-verify` - 创建检查点前运行验证
- `/lcyf-tdd` - 检查测试覆盖率变化
- `/lcyf-code-review` - 检查点之间的代码质量对比

## 关联Agent

- tdd-guide
- code-reviewer

## 关联Skill

- verification-loop
