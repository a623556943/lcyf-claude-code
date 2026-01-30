---
name: product-config-audit
description: |
  【模块定位】产品配置审核

  【支持的代理】
  - java-developer: 实现产品配置审核逻辑
  - planner: 规划产品配置审核方案

  【触发关键词】
  配置审核, config audit, 产品审核

  【必须调用】
  java-developer: 任务涉及"产品配置审核" → MUST
  planner: 规划"产品配置审核"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品配置审核）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品配置-产品配置审核.md

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

# 产品配置-产品配置审核

> **文档目的**: 说明产品配置审核流程的入口、职责与依赖，便于排查审核与撤销问题。
> **更新时间**: 2026-01-28

---

## 模块职责

提供产品配置审核的查询、提交、审核、撤销与配置维护入口，支撑配置生效前的审核流程。

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
| 审核列表/数量 | 审核分页查询与状态统计 | `ProductConfigAuditController` | `IProductConfigAuditService` |
| 审核配置维护 | 查询/更新审核流程配置 | `ProductConfigAuditController` | `IProductConfigAuditService` |
| 审核提交/审核/撤销 | 审核动作入口 | `ProductConfigAuditController` | `IProductConfigAuditService` |
| 审核详情 | 审核批次详情与日志 | `ProductConfigAuditController` | `IProductConfigAuditService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductConfigAuditController.java` | `adapter/web/config/` | 审核流程查询、提交、审核、撤销及配置维护 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductConfigAuditService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/productV2/` | 配置审核业务服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 提交审核
**触发条件**: 配置提交审核
**入口**: `ProductConfigAuditController.submitAudit()`

```
1. Controller 接收审核提交参数
2. Service 执行审核提交与持久化
3. 返回提交结果
```

### 流程2: 执行审核/撤销
**触发条件**: 审核或撤销操作
**入口**: `ProductConfigAuditController.audit()` / `revokeAudit()`

```
1. Controller 校验审核参数
2. Service 更新审核状态与日志
3. 返回操作结果
```

## 数据模型

- `ProductConfigAuditPageDto` 审核分页
- `ProductConfigAuditLogDto` 审核日志
- `ProductConfigHomePageDto` 审核详情
- `ProductAuditConfigDto` 审核流程配置
- `ProductConfigAuditSubmitCmd`/`ProductConfigAuditCmd`/`ProductConfigAuditRevokeCmd` 审核命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 审核 DTO 与 Cmd 定义 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| system-api | Dubbo DTO | 审核候选用户信息 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductApi` | 获取配置与历史数据 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductApi` | `getProductHistoryConfig(...)` | 审核时查询历史配置 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 审核流程配置化 | 通过审核配置接口维护 | 便于调整审核节点 |
| 审核日志留痕 | 审核日志接口 | 追踪审核历史 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增审核节点 | 更新审核流程配置 → Service 适配 |
| 新增统计维度 | 扩展审核分页与统计查询 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 审核数量异常 | 检查审核状态统计接口与查询条件 |
| 审核候选人为空 | 检查用户服务与权限配置 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-config-audit
