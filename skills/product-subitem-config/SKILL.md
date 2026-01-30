---
name: product-subitem-config
description: |
  【模块定位】产品子项配置

  【支持的代理】
  - java-developer: 实现产品子项配置逻辑
  - planner: 规划产品子项配置方案

  【触发关键词】
  子项配置, subitem config, 产品子项

  【必须调用】
  java-developer: 任务涉及"产品子项配置" → MUST
  planner: 规划"产品子项配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品子项配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品配置-产品子项配置.md

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

# 产品配置-产品子项配置

> **文档目的**: 说明产品子项配置的入口、流程与依赖，覆盖生效/草稿/历史与配置首页。
> **更新时间**: 2026-01-28

---

## 模块职责

维护产品子项配置（基础信息、险种与计划、销售规则、双录、续保等），支撑配置首页、草稿与历史版本查询。

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
| 配置首页数据 | 查询产品配置首页数据 | `ProductConfigControllerV2` | `IProductConfigApplicationService` |
| 子项新增/编辑 | 基础信息、险种计划、销售规则、双录、续保等子项 | `ProductConfigControllerV2` | `IProductConfigApplicationService` |
| 子项查询 | 生效配置、最新配置、历史配置查询 | `ProductConfigControllerV2` | `IProductConfigApplicationService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductConfigControllerV2.java` | `adapter/web/config/` | 子项新增/编辑、详情、历史、配置首页 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductConfigApplicationService.java` | `biz/service/productV2/` | 子项配置聚合服务 |
| `IProductConfigDraftService.java` | `biz/service/productV2/` | 草稿版本管理 |
| `IProductConfigHistoryService.java` | `biz/service/productV2/` | 历史版本管理 |
| `IProductDevConfigService.java` | `biz/service/productV2/` | 研发配置子项维护 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

### MQ Consumer
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductConfigConsumer.java` | `adapter/mq/consumer/` | 子项指定时间生效、产品数据变更同步处理 |

## 核心流程

### 流程1: 子项配置新增或编辑
**触发条件**: 配置页面保存子项
**入口**: `ProductConfigControllerV2` 子项新增接口

```
1. Controller 解析子项类型并校验参数
2. ApplicationService 按子项类型处理草稿或生效配置
3. 返回配置结果
```

### 流程2: 查询生效或历史配置
**触发条件**: 查看配置详情或历史版本
**入口**: `ProductConfigControllerV2.getItemInfoEffect()` / `itemHistoryList()`

```
1. Controller 接收产品编码与子项类型
2. ApplicationService/Draft/History 服务返回对应版本
3. 返回查询结果
```

## 数据模型

- `ProductConfigHomePageDto` 配置首页数据
- `ProductConfigHistoryDto` 历史配置记录
- `ProductBaseConfigItem`、`RiskAndPlanItem`、`ProductSaleRuleConfigItem` 等子项模型
- `ProductDoubleRecordConfigItem`、`RenewalContinueConfigItem`、`ProductRenewalConfigItem` 子项模型
- `ProductDevBizConfigItem` 研发配置模型

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 子项枚举与 DTO/Item 定义 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体与校验支持 |
| lcyf-framework-starter-tenant | 工具类 | 租户透传支持 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductApi` | 提供子项生效配置查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductApi` | `getProductEffectConfigItem(...)` | 查询子项生效配置 |
| `ProductApi` | `getProductConfigAllEffectItem(...)` | 查询所有子项生效配置 |
| `ProductApi` | `getProductHistoryConfig(...)` | 查询历史配置 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 子项类型识别 | `ProductConfigItemTypeEnum` | 统一子项类型与处理逻辑映射 |
| 草稿与生效分离 | 草稿/生效/历史多版本 | 支撑配置回溯与发布策略 |
| 部分子项暂未实现 | 接口直接抛出异常 | 明确实现边界，避免误用 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增子项类型 | 枚举新增 → Item DTO → ApplicationService 处理 → Controller 接口 |
| 增加历史查询维度 | 扩展 HistoryQuery → HistoryService → Controller |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 部分子项接口返回暂未实现 | 属于当前版本范围限制，需补齐 Service 与 Controller 实现 |
| 子项查询不到生效配置 | 检查草稿与生效版本是否存在，并确认子项类型是否正确 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-subitem-config
