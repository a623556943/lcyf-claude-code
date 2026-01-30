---
name: settlement-orange-core
description: |
  【模块定位】橙芯结算单管理

  【支持的代理】
  - java-developer: 实现结算单管理

  【触发关键词】
  结算单、橙芯结算、结算确认、上游对账

  【必须调用】
  java-developer: 任务涉及"结算单"、"结算管理" → MUST
---

# Finance模块 业务逻辑详细文档（橙芯结算单）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责财务结算单的管理端与渠道侧查询、结算确认与导入，并包含上游对账单的任务创建与状态管理。

## 核心功能

### Controller
- `FeeSettleOrderInfoController.java` - 结算单管理端入口
- `FeeChannelSettleOrderInfoController.java` - 渠道侧结算单入口
- `FinanceUpstreamReconciliationOrderController.java` - 上游对账单入口

### Service
- `IFeeSettleOrderInfoService.java` - 结算单服务接口
- `IUpstreamReconciliationOrderService.java` - 上游对账服务接口

## 功能清单

| 功能 | 描述 |
|------|------|
| 结算单分页 | 结算单分页查询 |
| 结算单导出 | 结算单列表导出 |
| 结算单详情 | 结算单详情查询 |
| 新增结算单 | 新增结算单 |
| 编辑结算单 | 编辑结算单 |
| 删除结算单 | 删除结算单 |
| 结算确认 | 结算确认 |
| 结算确认导入 | 下载模板/导入结算确认 |
| 渠道结算单分页 | 渠道侧结算单分页 |
| 渠道结算单导出 | 渠道侧结算单导出 |
| 上游对账分页 | 上游对账单分页 |
| 创建对账任务 | 上传上游结算单创建对账任务 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 管理端与渠道侧入口拆分 | auth/client 分离 | 区分渠道侧权限与管理端权限 |
| 上游对账独立入口 | 独立对账 Controller | 支撑上游对账任务与状态管理 |
| 结算确认导入 | 专用模板/导入接口 | 保障批量确认一致性 |

---

**文档版本**: V1.0
