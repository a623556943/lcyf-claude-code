---
name: product-instant-rate
description: |
  【模块定位】即展产品费率管理

  【支持的代理】
  - java-developer: 实现即展产品费率管理逻辑
  - planner: 规划即展产品费率管理方案

  【触发关键词】
  即展, instant rate, 快速费率

  【必须调用】
  java-developer: 任务涉及"即展产品费率管理" → MUST
  planner: 规划"即展产品费率管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（即展产品费率管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品费率管理-即展产品费率.md

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

# 产品费率管理-即展产品费率

> **文档目的**: 说明即展产品费率相关入口与职责，便于定位即展费率查询和导出能力。
> **更新时间**: 2026-01-28

---

## 模块职责

提供即展产品费率相关能力，包括产品类别树、产品列表与服务费查询、数量统计与导出。

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
| 产品类别树 | 查询产品类别树与数量 | `ProductJzController` | `IProductJzService` |
| 即展产品列表 | 查询产品分页与数量 | `ProductJzController` | `IProductJzService` |
| 服务费查询 | 获取产品服务费 | `ProductJzController` | `IProductJzService` |
| 产品导出 | 导出即展产品列表 | `ProductJzController` | `IProductJzService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductJzController.java` | `adapter/web/config/` | 即展产品类别、列表、服务费与导出 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductJzService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 即展产品业务服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 即展产品列表查询
**触发条件**: 即展产品查询
**入口**: `ProductJzController.queryProductPage()`

```
1. Controller 接收查询条件
2. Service 返回分页数据
3. 返回统一结果
```

### 流程2: 产品服务费查询
**触发条件**: 查询服务费
**入口**: `ProductJzController.queryProductServiceFee()`

```
1. Controller 校验必要参数
2. Service 返回服务费信息
3. 返回统一结果
```

## 数据模型

- `ProductJzPageQuery` 查询参数
- `JzProductView` 产品分页视图
- `ProductCategoryDto` 产品分类
- `FeeDefDetailsVo` 服务费信息（来源于 finance 模块 DTO）

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 即展产品 DTO/Query |
| finance-api | Maven 依赖 | 服务费信息对象 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductServiceApi` | 费率与服务费查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductServiceApi` | `getProductServiceMainInfoAndFeeById(...)` | 获取费率/服务费组合信息 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 查询入口 | 统一由 `ProductJzController` 提供 | 便于即展业务统一维护 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增即展维度 | 扩展 Query/Service → Controller |
| 增加导出字段 | 扩展导出逻辑与字段映射 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 服务费查询为空 | 检查费率与产品关系配置 |
| 导出失败 | 检查导出权限与数据量 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-instant-rate
