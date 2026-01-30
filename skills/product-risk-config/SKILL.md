---
name: product-risk-config
description: |
  【模块定位】产品险种配置

  【支持的代理】
  - java-developer: 实现产品险种配置逻辑
  - planner: 规划产品险种配置方案

  【触发关键词】
  险种配置, risk config, 险种

  【必须调用】
  java-developer: 任务涉及"产品险种配置" → MUST
  planner: 规划"产品险种配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品险种配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品配置-险种配置.md

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

# 产品配置-险种配置

> **文档目的**: 说明险种配置维护入口与依赖，便于定位险种维护与关联产品信息。
> **更新时间**: 2026-01-28

---

## 模块职责

提供险种配置的新增、编辑、查询与关联产品险种列表等能力。

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
| 险种分页/列表 | 分页查询与列表查询 | `RiskController` | `IRiskService` |
| 险种详情 | 根据险种编码查询详情 | `RiskController` | `IRiskService` |
| 险种新增/编辑/删除 | 维护险种信息 | `RiskController` | `IRiskService` |
| 关联险种查询 | 查询产品关联险种与费率套餐 | `RiskController` | `IRiskService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `RiskController.java` | `adapter/web/config/` | 险种配置维护与关联查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IRiskService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/productV2/` | 险种配置业务服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `RiskGateway.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/infrastructure/gateway/` | RPC 查询险种使用（见 ProductV2ApiImpl） |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 险种新增/编辑
**触发条件**: 维护险种配置
**入口**: `RiskController.add()` / `update()`

```
1. Controller 校验参数
2. Service 执行新增或编辑
3. 返回统一结果
```

### 流程2: 关联险种查询
**触发条件**: 查询产品关联险种
**入口**: `RiskController.queryProductPlanRiskInfoList()`

```
1. Controller 接收产品编码
2. Service 查询产品关联险种列表
3. 返回关联结果
```

## 数据模型

- `RiskAddCmd`/`RiskUpdateCmd` 维护命令
- `RiskInfoDto`/`RiskPageDto` 险种信息
- `ProductPlanRiskRelationDto` 产品与险种关联关系
- `RiskSearchBean` 险种查询结果

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 险种相关 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductApi`/`ProductV2Api` | 险种信息查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductApi` | `getProductRisk(...)`/`getRiskInfo(...)` | 获取险种与产品关联信息 |
| `ProductV2Api` | `getByInnerRiskCode(...)` | 批量险种查询 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 关联查询 | 提供产品关联险种列表接口 | 支撑产品配置与费率配置联动 |
| 查询参数整理 | `MapUtils.flat` | 统一请求参数格式 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增险种字段 | 扩展 DTO/Cmd → Service → Controller |
| 新增关联查询 | 扩展 Service → Controller |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 险种列表为空 | 检查产品编码与查询条件 |
| 关联险种缺失 | 检查产品-险种关联关系维护 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-risk-config
