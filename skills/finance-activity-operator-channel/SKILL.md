---
name: activity-operator-channel
description: |
  【模块定位】运营商活动配置与渠道活动查询

  【支持的代理】
  - java-developer: 实现运营商/渠道活动管理

  【触发关键词】
  运营商活动、渠道活动、活动审核、活动配置

  【必须调用】
  java-developer: 任务涉及"运营商活动"、"渠道活动" → MUST
---

# Finance模块 业务逻辑详细文档（运营商渠道活动）

**文档创建时间**: 2026-01-28
**文档版本**: V1.0

---

## 模块职责

负责运营商活动配置、渠道活动查询，以及活动审核记录的提交、审核与回溯。

## 核心功能

### Controller
- `FeeActivityOperationBaseConfigController.java` - 运营商活动管理入口
- `FeeChannelActivityController.java` - 渠道活动查询入口
- `FeeActivityAuditRecordController.java` - 活动审核与日志入口

### Service
- `IFeeOperationActivityBaseConfigService.java` - 运营商活动服务接口
- `IFeeActivityAuditRecordService.java` - 活动审核服务接口

## 功能清单

| 功能 | 描述 |
|------|------|
| 运营商活动分页 | 运营商活动列表 |
| 运营商活动详情 | 详情/编辑查询 |
| 新增运营商活动 | 新增运营商活动 |
| 渠道活动列表 | 渠道侧活动列表查询 |
| 活动审核提交 | 提交活动审核 |
| 活动审核处理 | 审核/撤销/删除 |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 渠道活动入口 | client/渠道侧独立入口 | 区分运营商管理与渠道查询 |
| 审核记录独立 | 审核与日志分表 | 支撑活动审核链路追溯 |
| 活动范围校验 | Controller 前置校验 | 降低非法活动配置写入风险 |

---

**文档版本**: V1.0
