---
name: product-state-machine
description: |
  【模块定位】产品投保状态机

  【支持的代理】
  - java-developer: 实现产品投保状态机逻辑
  - planner: 规划产品投保状态机方案

  【触发关键词】
  状态机, state machine, 投保流程

  【必须调用】
  java-developer: 任务涉及"产品投保状态机" → MUST
  planner: 规划"产品投保状态机"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品投保状态机）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品投保配置-状态机.md

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

# 产品投保配置-状态机

> **文档目的**: 说明投保状态机配置入口与职责，便于定位状态机定义与查询。
> **更新时间**: 2026-01-28

---

## 模块职责

维护投保状态机定义配置，提供状态机新增、编辑与查询入口。

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
| 状态机新增 | 新增状态机定义 | `StateMachineController` | `IStateMachineDefService` |
| 状态机编辑 | 编辑状态机定义 | `StateMachineController` | `IStateMachineDefService` |
| 状态机查询 | 根据产品或保司编码查询 | `StateMachineController` | `IStateMachineDefService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `StateMachineController.java` | `adapter/web/config/` | 状态机定义新增、编辑、查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IStateMachineDefService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 状态机定义服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 状态机新增
**触发条件**: 新增状态机定义
**入口**: `StateMachineController.add()`

```
1. Controller 校验新增参数
2. Service 创建状态机定义
3. 返回操作结果
```

### 流程2: 状态机查询
**触发条件**: 查询状态机定义
**入口**: `StateMachineController.get()`

```
1. Controller 接收产品编码或保司编码
2. Service 查询状态机定义
3. 返回查询结果
```

## 数据模型

- `StatemachineDefDto` 状态机定义
- `StatemachineDefAddCmd`/`StatemachineDefUpdateCmd` 状态机维护命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 状态机 DTO/Cmd |
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
| 状态机定义集中配置 | 独立控制层管理 | 统一投保流程配置入口 |
| 状态机分层概念 | README 中区分投保状态机与 Web 状态机 | 便于流程与页面配置协作 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增状态字段 | 扩展 DTO/Cmd → Service → Controller |
| 增加查询条件 | 扩展查询接口与服务 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 查询不到状态机 | 检查产品编码或保司编码是否正确 |
| 新增后未生效 | 检查状态机配置是否发布或被引用 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-state-machine
