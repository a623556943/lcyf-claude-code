---
name: settlement-channel-income
description: |
  【模块定位】渠道收入查询与导出

  【支持的代理】
  - java-developer: 实现渠道收入管理

  【触发关键词】
  渠道收入、收入查询、收入导出

  【必须调用】
  java-developer: 任务涉及"渠道收入" → MUST
---

# Finance模块 业务逻辑详细文档（渠道收入）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责管理端与渠道侧的渠道收入查询与导出，包含数据权限控制与渠道身份过滤。

## 核心功能

### Controller
- `FeeChannelIncomeController.java` - 管理端渠道收入入口，含数据权限过滤
- `FeeChannelIncomeChannelController.java` - 渠道侧渠道收入入口

### Service
- `IFeeChannelIncomeService.java` - 渠道收入服务接口
- `FeeChannelIncomeServiceImpl.java` - 分页/导出/渠道侧导出逻辑

## 功能清单

| 功能 | 描述 |
|------|------|
| 渠道收入分页 | 管理端渠道收入分页查询 |
| 渠道收入详情 | 管理端渠道收入详情查询 |
| 渠道收入导出 | 管理端渠道收入导出 |
| 渠道侧分页 | 渠道侧渠道收入分页查询 |
| 渠道侧导出 | 渠道侧渠道收入导出 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 数据权限 | `@EnableDataPermission` | 管理端分页/导出需按权限过滤 |
| 渠道侧导出 | 二次校验渠道身份 | 使用 `ChannelApi.getUserChannelInfo` 确认权限 |
| 导出实现 | 异步导出任务 + OSS | 统一导出流程与下载能力 |

---

**文档版本**: V1.0
