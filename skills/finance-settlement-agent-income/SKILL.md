---
name: settlement-agent-income
description: |
  【模块定位】代理人收入管理

  【支持的代理】
  - java-developer: 实现代理人收入管理

  【触发关键词】
  代理人收入、代发佣金、收入查询、收入导出、结算确认

  【必须调用】
  java-developer: 任务涉及"代理人收入" → MUST
---

# Finance模块 业务逻辑详细文档（代理人收入）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责代发佣金个人收入明细与即展代理人收入的查询、导出、结算确认与导入确认。

## 核心功能

### Controller
- `FeeAccountIncomeController.java` - 代发佣金收入（团队/渠道）入口
- `FeeChannelAccountIncomeController.java` - 渠道账号收入入口
- `FeeTeamAccountIncomeController.java` - 即展代理人收入入口

### Service
- `IFeeSettleOrderInfoService.java` - 代发佣金/个人收入明细相关服务接口
- `FeeSettleOrderInfoServiceImpl.java` - 代发佣金确认/导入/导出逻辑

## 功能清单

| 功能 | 描述 |
|------|------|
| 代发佣金团队分页 | 代发佣金团队个人收入分页 |
| 代发佣金团队导出 | 代发佣金团队个人收入导出 |
| 代发佣金团队确认 | 代发佣金团队个人收入结算确认 |
| 代发佣金团队导入 | 代发佣金团队结算确认导入/模板 |
| 渠道代发分页 | 渠道代发佣金收入分页 |
| 渠道账号分页 | 渠道账号收入分页 |
| 即展代理人分页 | 即展代理人收入分页 |
| 即展收入汇总 | 即展本人收入汇总 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 团队/渠道入口分离 | team/channel 两套接口 | 区分代发佣金团队与渠道代发场景 |
| 即展入口隔离 | jzClient 路径 | 即展代理人收入与渠道收入隔离 |
| 结算确认校验 | 状态+完成时间+备注 | 保证结算确认数据完整性 |

---

**文档版本**: V1.0
