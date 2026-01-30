---
name: product-single-recording-risk
description: |
  【模块定位】单录风控产品管理

  【支持的代理】
  - java-developer: 实现单录风控产品管理逻辑
  - planner: 规划单录风控产品管理方案

  【触发关键词】
  单录风控, single recording risk, 风控产品

  【必须调用】
  java-developer: 任务涉及"单录风控产品管理" → MUST
  planner: 规划"单录风控产品管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（单录风控产品管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 单录风控产品管理.md

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

# 单录风控产品管理

> **文档目的**: 说明单录风控产品管理入口与职责，便于定位风险控制产品维护。
> **更新时间**: 2026-01-28

---

## 模块职责

维护单录风控产品可见与配置，提供分页查询与设置入口。

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
| 风控产品分页 | 单录风控产品分页查询 | `RiskConProductSingleRecordController` | `IRiskConProductSingleRecordService` |
| 风控产品设置 | 单录风控产品设置更新 | `RiskConProductSingleRecordController` | `IRiskConProductSingleRecordService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `RiskConProductSingleRecordController.java` | `adapter/web/risk/` | 单录风控产品查询与设置 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IRiskConProductSingleRecordService.java` | `biz/service/risk/` | 单录风控产品配置服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 单录风控产品分页查询
**触发条件**: 风控产品列表查询
**入口**: `RiskConProductSingleRecordController.page()`

```
1. Controller 接收查询参数
2. TenantMapUtils.flat 统一整理查询条件
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 单录风控产品设置
**触发条件**: 风控产品设置
**入口**: `RiskConProductSingleRecordController.update()`

```
1. Controller 校验更新参数
2. Service 修改配置
3. 返回更新结果
```

## 数据模型

- `RiskConProductSingleRecordDto` 风控产品配置
- `RiskConProductSingleRecordAddCmd`/`RiskConProductSingleRecordUpdateCmd` 维护命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 风控产品 DTO/Cmd |
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
| 风控配置独立维护 | 单独控制器 | 便于风险控制策略迭代 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增风控策略字段 | 扩展 DTO/Cmd → Service → Controller |
| 增加筛选条件 | 扩展查询参数与服务 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 风控产品列表为空 | 检查牌照与查询参数 |
| 设置不生效 | 检查服务日志与权限配置 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-single-recording-risk
