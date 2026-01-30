---
name: settlement-team-income
description: |
  【模块定位】即展团队收入管理

  【支持的代理】
  - java-developer: 实现团队收入管理

  【触发关键词】
  团队收入、即展收入、收入查询、收入导出

  【必须调用】
  java-developer: 任务涉及"团队收入" → MUST
---

# Finance模块 业务逻辑详细文档（团队收入）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责即展团队收入的查询与导出，并将当前登录用户的团队编码作为查询条件。

## 核心功能

### Controller
- `FeeTeamIncomeController.java` - 管理端即展收入入口，固定 appCode=即展
- `FeeChannelIncomeTeamController.java` - 即展团队收入入口，固定 channelCodeToa

### Service
- `IFeeChannelIncomeService.java` - 团队收入服务接口
- `FeeChannelIncomeServiceImpl.java` - 即展收入导出与团队收入导出逻辑

## 功能清单

| 功能 | 描述 |
|------|------|
| 即展收入分页 | 管理端即展收入分页查询 |
| 即展收入详情 | 管理端即展收入详情查询 |
| 即展收入导出 | 管理端即展收入导出 |
| 团队收入分页 | 即展团队收入分页查询 |
| 团队收入详情 | 即展团队收入详情查询 |
| 团队收入导出 | 即展团队收入导出 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 即展入口隔离 | appCode=JI_ZHAN | 区分管理端即展收入与渠道侧渠道收入 |
| 团队侧过滤 | channelCodeToa 固定 | 仅允许当前团队范围的数据查询 |
| 导出实现 | 异步导出任务 + OSS | 大数据量导出统一处理 |

---

**文档版本**: V1.0
