---
name: product-rate-settlement
description: |
  【模块定位】产品费率结算说明配置

  【支持的代理】
  - java-developer: 实现产品费率结算说明配置逻辑
  - planner: 规划产品费率结算说明配置方案

  【触发关键词】
  费率结算, rate settlement, 结算说明

  【必须调用】
  java-developer: 任务涉及"产品费率结算说明配置" → MUST
  planner: 规划"产品费率结算说明配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品费率结算说明配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品费率结算说明配置.md

---

## 目录

- [一、模块职责](#一模块职责)
- [二、目录结构](#二目录结构)
- [三、功能清单](#三功能清单)
- [四、核心流程](#四核心流程)
- [五、数据模型](#五数据模型)
- [六、依赖关系](#六依赖关系)
- [七、RPC接口](#七rpc接口)
- [八、关键设计决策](#八关键设计决策)

---

# 产品费率结算说明配置

> **文档目的**: 说明结算说明配置与审核入口，便于定位结算说明维护与审核流程。
> **更新时间**: 2026-01-28

---

## 模块职责

提供产品费率结算说明的维护与审核入口，支持审核日志、状态统计与编辑前校验。

## 目录结构

```
lcyf-module-base/
└── lcyf-module-product-api/
    └── src/main/java/com/lcyf/cloud/module/product/api/
        ├── api/
        ├── constants/
        ├── enums/
        └── pojo/

lcyf-module-product-factory/
├── lcyf-module-product-biz/
│   └── src/main/java/com/lcyf/cloud/module/product/biz/
│       ├── service/
│       └── infrastructure/
└── lcyf-module-product-adapter/
    └── src/main/java/com/lcyf/cloud/module/product/adapter/
        ├── web/
        ├── rpc/
        ├── mq/consumer/
        └── schedule/
```

## 功能清单

| 功能 | 描述 | 入口 Controller | 核心 Service |
|------|------|-----------------|--------------|
| 结算说明审核 | 审核分页、详情、撤销、审核执行 | `FeeSettleExplainController` | `IFeeSettleExplainAuditService` |
| 结算说明查询 | 查询主费率结算说明 | `FeeSettleExplainController` | `IFeeSettleExplainService` |
| 编辑前校验 | 编辑前校验与状态统计 | `FeeSettleExplainController` | `IFeeSettleExplainAuditService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `FeeSettleExplainController.java` | `adapter/web/config/` | 结算说明审核与查询入口 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IFeeSettleExplainService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 结算说明查询与维护 |
| `IFeeSettleExplainAuditService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 结算说明审核与日志 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 结算说明审核
**触发条件**: 结算说明审核流程操作
**入口**: `FeeSettleExplainController.doAudit()` / `submitAudit()`

```
1. Controller 接收审核命令
2. AuditService 处理审核状态
3. 返回审核结果
```

### 流程2: 结算说明详情查询
**触发条件**: 费率维护查询结算说明
**入口**: `FeeSettleExplainController.queryByMainServiceInfoId()`

```
1. Controller 接收主费率ID
2. Service 返回最新结算说明
3. 返回查询结果
```

## 数据模型

- `FeeSettleExplainAuditPageDto` 审核分页
- `FeeSettleExplainAuditDetailsDto` 审核详情
- `FeeSettleExplainDetailsDto` 结算说明详情
- `FeeSettleExplainAuditCmd`/`FeeSettleExplainAuditRevokeCmd`/`FeeSettleExplainSubmitCmd` 审核命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 结算说明 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductServiceApi` | 结算说明查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductServiceApi` | `getProductSettleExplain(...)`/`getFeeSettleExplain(...)` | 获取结算说明 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 审核与查询分离 | AuditService 与 Service 分工 | 降低审核与查询耦合 |
| 审核状态统计 | 提供 statusCount | 便于审计与监控 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增审核规则 | 扩展审核服务与命令对象 |
| 新增结算说明字段 | 扩展 DTO/Service/查询逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 审核记录为空 | 检查审核提交是否成功 |
| 编辑前校验失败 | 检查批次状态与主费率ID |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-rate-settlement
