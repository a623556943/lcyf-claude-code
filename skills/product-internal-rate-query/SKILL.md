---
name: product-internal-rate-query
description: |
  【模块定位】内部系统费率查询接口

  【支持的代理】
  - java-developer: 实现内部系统费率查询接口逻辑
  - planner: 规划内部系统费率查询接口方案

  【触发关键词】
  费率查询, rate query, 内部费率

  【必须调用】
  java-developer: 任务涉及"内部系统费率查询接口" → MUST
  planner: 规划"内部系统费率查询接口"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（内部系统费率查询接口）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 其他系统调用接口-内部系统费率查询.md

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

# 其他系统调用接口-内部系统费率查询

> **文档目的**: 说明内部系统调用的费率查询入口，便于定位内部费率查询调用方式。
> **更新时间**: 2026-01-28

---

## 模块职责

提供内部系统查询产品费率信息的入口，按产品编码与牌照维度返回子费率列表。

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
| 内部费率查询 | 根据产品编码与牌照查询子费率 | `ProductServiceInnerController` | `IProductServiceInfoService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductServiceInnerController.java` | `adapter/web/inner/` | 内部系统费率查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductServiceInfoService.java` | `biz/service/` | 子费率查询服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 内部费率查询
**触发条件**: 内部系统查询费率
**入口**: `ProductServiceInnerController.getProductServiceListByCodeAndLicense()`

```
1. Controller 接收产品编码与牌照参数
2. 设置租户上下文
3. Service 返回子费率列表
4. 返回统一结果
```

## 数据模型

- `ProductServiceInfoDto` 子费率信息

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 子费率 DTO 定义 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 未发现明确证据/以源码为准 | - | - |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductServiceApi` | `getProductServiceByInnerProductCode(...)` | 内部系统可复用费率查询 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 租户隔离 | 内部接口设置固定租户 | 保证内部调用一致性 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增查询条件 | 扩展参数与 Service 查询逻辑 |
| 支持更多牌照类型 | 扩展 Service 查询规则 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 查询为空 | 检查产品编码与牌照参数是否正确 |
| 结果不完整 | 检查费率关联关系是否配置 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-internal-rate-query
