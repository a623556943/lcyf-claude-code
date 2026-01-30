---
name: product-insurance-rules
description: |
  【模块定位】产品投保规则配置

  【支持的代理】
  - java-developer: 实现产品投保规则配置逻辑
  - planner: 规划产品投保规则配置方案

  【触发关键词】
  投保规则, insurance rules, 规则

  【必须调用】
  java-developer: 任务涉及"产品投保规则配置" → MUST
  planner: 规划"产品投保规则配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品投保规则配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品投保配置-投保规则.md

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

# 产品投保配置-投保规则

> **文档目的**: 说明投保规则与规则集的维护入口，便于排查规则配置与失败日志。
> **更新时间**: 2026-01-28

---

## 模块职责

维护投保规则项与规则集，并提供规则校验失败日志查询入口。

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
| 规则项维护 | 规则项分页、详情、新增、编辑、删除 | `RuleController` | `IRuleService` |
| 规则集维护 | 规则集分页、详情、新增、编辑、删除 | `RulesetController` | `IRulesetService` |
| 规则失败日志 | 规则失败日志分页与详情 | `RuleFailLogController` | `IRuleFailLogService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `RuleController.java` | `adapter/web/config/` | 规则项维护入口 |
| `RulesetController.java` | `adapter/web/config/` | 规则集维护入口 |
| `RuleFailLogController.java` | `adapter/web/config/` | 规则失败日志查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IRuleService.java` | `lcyf-framework/lcyf-framework-starter-rule/src/main/java/com/lcyf/cloud/framework/rule/engine/service/` | 规则项服务 |
| `IRulesetService.java` | `lcyf-framework/lcyf-framework-starter-rule/src/main/java/com/lcyf/cloud/framework/rule/engine/service/` | 规则集服务 |
| `IRuleFailLogService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 规则失败日志服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 规则项维护
**触发条件**: 新增或编辑规则项
**入口**: `RuleController.add()` / `update()`

```
1. Controller 校验规则参数
2. RuleService 处理规则新增或编辑
3. 返回统一结果
```

### 流程2: 规则失败日志查询
**触发条件**: 排查规则失败原因
**入口**: `RuleFailLogController.page()`

```
1. Controller 接收查询条件
2. MapUtils.flat 统一整理参数
3. Service 返回分页日志
4. 返回统一结果
```

## 数据模型

- `RuleDto`/`RuleAddCmd`/`RuleUpdateCmd` 规则项
- `RulesetDto`/`RulesetAddCmd`/`RulesetUpdateCmd` 规则集
- `RuleFailLogDto` 规则失败日志

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| lcyf-framework-starter-rule | 依赖服务 | 规则项/规则集能力 |
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
| 规则能力复用 | 基于规则引擎模块 | 统一规则建模与执行 |
| 失败日志独立入口 | 单独日志查询 | 便于问题排查 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增规则类型 | 扩展规则引擎配置与校验逻辑 |
| 新增日志筛选条件 | 扩展日志查询参数与服务 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 规则项无法生效 | 检查规则集关联与启用状态 |
| 日志查询为空 | 检查查询条件与租户过滤 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-insurance-rules
