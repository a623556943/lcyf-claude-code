---
name: product-health-disclosure
description: |
  【模块定位】产品健康告知配置

  【支持的代理】
  - java-developer: 实现产品健康告知配置逻辑
  - planner: 规划产品健康告知配置方案

  【触发关键词】
  健康告知, health disclosure, 告知

  【必须调用】
  java-developer: 任务涉及"产品健康告知配置" → MUST
  planner: 规划"产品健康告知配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品健康告知配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品投保配置-健康告知.md

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

# 产品投保配置-健康告知

> **文档目的**: 说明健康告知与智能核保配置的维护入口，便于定位健告配置与相关校验。
> **更新时间**: 2026-01-28

---

## 模块职责

维护健康告知配置与智能核保配置，提供分页查询、详情与新增编辑入口。

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
| 健告配置查询 | 健告配置分页与详情 | `ImpartConfigController` | `IImpartConfigService` |
| 健告配置维护 | 健告新增、编辑、删除与批量删除 | `ImpartConfigController` | `IImpartConfigService` |
| 智能核保配置维护 | 智能核保配置分页、新增、编辑、删除 | `SmartUnderwriteConfigController` | `ISmartUnderwriteConfigService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ImpartConfigController.java` | `adapter/web/config/` | 健康告知配置维护 |
| `SmartUnderwriteConfigController.java` | `adapter/web/config/` | 智能核保配置维护 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IImpartConfigService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 健告配置服务 |
| `ISmartUnderwriteConfigService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 智能核保配置服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 健告配置分页查询
**触发条件**: 健告配置列表查询
**入口**: `ImpartConfigController.page()`

```
1. Controller 接收查询参数
2. MapUtils.flat 统一整理查询条件
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 健告配置新增
**触发条件**: 新增健告配置
**入口**: `ImpartConfigController.add()`

```
1. Controller 校验新增参数
2. Service 创建健告配置
3. 返回操作结果
```

## 数据模型

- `ImpartConfigDto` 健告配置
- `ImpartConfigAddCmd`/`ImpartConfigUpdateCmd` 健告维护命令
- `SmartUnderwriteConfigDto` 智能核保配置
- `SmartUnderwriteConfigAddCmd`/`SmartUnderwriteConfigUpdateCmd` 智能核保维护命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 健告与核保 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 未发现明确证据/以源码为准 | - | - |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | - |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 配置集中维护 | 控制层统一 CRUD | 降低配置分散导致的维护成本 |
| 批量删除 | 提供批量删除接口 | 便于清理历史配置 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增健告字段 | 扩展 DTO/Cmd → Service → Controller |
| 新增核保配置维度 | 扩展 DTO/Cmd → Service → Controller |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 健告列表为空 | 检查租户与查询条件 |
| 核保配置更新失败 | 检查参数校验与业务日志 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-health-disclosure
