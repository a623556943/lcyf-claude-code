---
name: product-basic-config
description: |
  【模块定位】产品基础配置

  【支持的代理】
  - java-developer: 实现产品基础配置逻辑
  - planner: 规划产品基础配置方案

  【触发关键词】
  基础配置, basic config, 产品配置

  【必须调用】
  java-developer: 任务涉及"产品基础配置" → MUST
  planner: 规划"产品基础配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品基础配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品配置-产品基础配置.md

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

# 产品配置-产品基础配置

> **文档目的**: 说明产品基础信息配置的职责、入口与依赖，便于定位配置维护入口。
> **更新时间**: 2026-01-28

---

## 模块职责

维护产品基础信息（产品编码、名称、上架状态、所属保司等），提供列表、详情、新增与删除等能力。

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
| 产品基础信息分页查询 | 通过查询参数分页获取产品基础信息 | `ProductBaseInfoController` | `IProductBaseInfoService` |
| 产品基础信息详情 | 根据ID查询详情 | `ProductBaseInfoController` | `IProductBaseInfoService` |
| 产品基础信息新增/删除 | 新增或删除基础信息 | `ProductBaseInfoController` | `IProductBaseInfoService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductBaseInfoController.java` | `adapter/web/config/` | 产品基础信息分页、详情、新增、删除与列表 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductBaseInfoService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/productV2/` | 产品基础信息业务服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 产品基础信息分页查询
**触发条件**: 配置页面查询
**入口**: `ProductBaseInfoController.page()`

```
1. Controller 接收分页查询参数
2. TenantMapUtils.flat 统一补充租户与删除标记
3. Service 返回分页结果
4. CommonResult.success 返回响应
```

### 流程2: 新增产品基础信息
**触发条件**: 新增产品
**入口**: `ProductBaseInfoController.add()`

```
1. Controller 校验新增参数
2. Service 执行业务创建
3. 返回成功结果
```

## 数据模型

- `ProductBaseInfoDto` 作为基础信息传输对象
- `ProductBaseInfoAddCmd` 作为新增命令对象
- `ProductBaseInfoSearchBean`/`ProductBaseInfoPageQuery` 作为查询条件载体

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 基础信息 DTO 与 Cmd 定义 |
| lcyf-framework-commons | Maven 依赖 | `CommonResult`/`PageResult` 统一返回 |
| lcyf-framework-starter-tenant | 工具类 | `TenantMapUtils.flat` 补充租户参数 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductApi`/`ProductV2Api` | 提供产品基础信息查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductApi` | `getProductBaseInfo(...)` | 获取产品基础信息 |
| `ProductV2Api` | `getProductBaseItem(...)` | 获取产品基础配置子项 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 查询参数处理 | `TenantMapUtils.flat` | 统一补充租户与删除标记 |
| 返回体 | `CommonResult`/`PageResult` | 统一返回结构，便于前端处理 |
| 校验 | `@Validated`/`@Valid` | 控制层参数校验前置 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增基础信息字段 | 扩展 Cmd/Dto → Service → Controller |
| 新增查询条件 | 扩展 Query/Service 查询逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 分页参数如何传递 | 前端直传参数，Controller 使用 `TenantMapUtils.flat` |
| 基础信息放在哪里 | `product-api` 的 DTO/Cmd 定义，`product-factory` 实现 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-basic-config
