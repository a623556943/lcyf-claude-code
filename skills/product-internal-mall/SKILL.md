---
name: product-internal-mall
description: |
  【模块定位】内部系统在线商城接口

  【支持的代理】
  - java-developer: 实现内部系统在线商城接口逻辑
  - planner: 规划内部系统在线商城接口方案

  【触发关键词】
  内部商城, internal mall

  【必须调用】
  java-developer: 任务涉及"内部系统在线商城接口" → MUST
  planner: 规划"内部系统在线商城接口"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（内部系统在线商城接口）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 其他系统调用接口-内部系统在线商城.md

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

# 其他系统调用接口-内部系统在线商城

> **文档目的**: 说明内部系统调用的在线商城入口，便于定位内部 H5 商城访问路径。
> **更新时间**: 2026-01-28

---

## 模块职责

提供内部系统查询在线商城产品列表的入口。

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
| 内部商城列表 | 内部 H5 在线商城产品列表 | `OnlineMallTemplateInnerController` | `IOnlineMallTemplateService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `OnlineMallTemplateInnerController.java` | `adapter/web/inner/` | 内部 H5 商城列表 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IOnlineMallTemplateService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/lcyf/` | 在线商城模板服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 内部在线商城列表
**触发条件**: 内部系统查询商城
**入口**: `OnlineMallTemplateInnerController.queryDefaultOnlineMallList()`

```
1. Controller 设置租户忽略
2. Service 查询在线商城列表
3. 返回查询结果
```

## 数据模型

- `OnlineMallTemplateDto` 在线商城模板

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 商城 DTO 定义 |
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
| 内部访问隔离 | 内部接口独立 | 便于内部系统调用 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增过滤条件 | 扩展 Controller 参数与 Service 查询 |
| 支持更多场景 | 扩展商城模板查询逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 查询为空 | 检查用户编码与产品分类参数 |
| 返回异常 | 检查租户忽略配置 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-internal-mall
