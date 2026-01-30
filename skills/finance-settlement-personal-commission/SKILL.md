---
name: settlement-personal-commission
description: |
  【模块定位】个人收入与佣金结算单管理

  【支持的代理】
  - java-developer: 实现个人收入与佣金结算

  【触发关键词】
  个人收入、佣金结算、结算确认、收入查询

  【必须调用】
  java-developer: 任务涉及"个人收入"、"佣金结算" → MUST
---

# Finance模块 业务逻辑详细文档（个人收入及佣金结算单）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责个人收入单与佣金结算单的分页、导出与导入确认，并在导入时批量更新结算状态。

## 核心功能

### Controller
- `PersonalIncomeController.java` - 个人收入查询入口
- `PersonalSettleOrderController.java` - 佣金结算单分页/导出/导入确认

### Service
- `IPersonalIncomeService.java` - 个人收入服务接口
- `PersonalIncomeServiceImpl.java` - 个人收入分页与详情
- `IPersonalSettleOrderService.java` - 佣金结算单服务接口
- `PersonalSettleOrderServiceImpl.java` - 导出/导入确认/批量结算

## 功能清单

| 功能 | 描述 |
|------|------|
| 个人收入分页 | 个人收入分页查询 |
| 个人收入详情 | 个人收入详情查询 |
| 佣金结算单分页 | 佣金结算单分页查询 |
| 佣金结算单导出 | 佣金结算单导出 |
| 结算确认模板 | 下载结算确认模板 |
| 结算确认导入 | 导入结算确认并更新状态 |
| 收入明细查询 | 查询登录用户收入明细 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 导入行数限制 | 最大 1000 条 | 降低导入校验与事务压力 |
| 业务类型校验 | 业务类型一致性校验 | 避免结算错配 |
| 按类型批量更新 | 新单/保全/补差额分支 | 业务规则需要不同更新范围 |

---

**文档版本**: V1.0
