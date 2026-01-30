---
name: product-main-rate
description: |
  【模块定位】产品主费率管理

  【支持的代理】
  - java-developer: 实现产品主费率管理逻辑
  - planner: 规划产品主费率管理方案

  【触发关键词】
  主费率, main rate, 产品费率

  【必须调用】
  java-developer: 任务涉及"产品主费率管理" → MUST
  planner: 规划"产品主费率管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品主费率管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品费率管理-产品主费率.md

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

# 产品费率管理-产品主费率

> **文档目的**: 说明主费率维护入口与职责，便于定位主费率查询与销售状态维护。
> **更新时间**: 2026-01-28

---

## 模块职责

维护产品主费率信息（总公司级费率）与销售状态，提供分页查询、上下架与定时销售状态维护入口。

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
| 主费率分页查询 | 查询总公司费率分页/全量 | `ProductServiceMainInfoController` | `IProductServiceMainInfoService` |
| 销售状态维护 | 开售/停售/下架/定时状态 | `ProductServiceMainInfoController` | `IProductServiceMainInfoService` |
| 置顶产品 | 主费率产品置顶管理 | `ProductServiceMainInfoController` | `IProductServiceMainInfoService` |
| 定时状态任务 | 定时变更销售状态 | `ProductSchedule` | `IProductServiceMainInfoService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductServiceMainInfoController.java` | `adapter/web/config/` | 主费率分页、销售状态与置顶维护 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductServiceMainInfoService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 主费率与销售状态维护 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 主费率分页查询
**触发条件**: 费率列表查询
**入口**: `ProductServiceMainInfoController.page()`

```
1. Controller 接收分页参数
2. TenantMapUtils.flat 统一补充租户参数
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 定时销售状态变更
**触发条件**: 定时任务触发
**入口**: `ProductSchedule.modifyProductServiceMainTimedStatus()`

```
1. 定时任务触发
2. 调用主费率服务修改销售状态
3. 完成状态变更
```

## 数据模型

- `ProductServiceMainInfoDto` 主费率信息
- `ProductServiceFeeInfoDto` 费率信息组合视图
- `ProductServiceMainInfoFeeAddCmd`/`ProductServiceMainInfoFeeUpdateCmd` 主费率维护命令
- `TimedServiceMainCmd` 定时状态变更参数

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 主费率 DTO/Cmd 定义 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| lcyf-framework-operatelog | 注解 | 操作日志 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductServiceApi` | 提供主费率查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductServiceApi` | `getProductServiceMainInfoByInnerProductCode(...)` | 查询主费率 |
| `ProductServiceApi` | `getProductServiceMainInfoAndFeeById(...)` | 查询主费率及费率信息 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 销售状态定时变更 | `ProductSchedule` | 自动化管理开售/停售/下架 |
| 多租户查询 | `TenantMapUtils.flat` | 统一租户参数处理 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增主费率维度 | 扩展 DTO/Cmd → Service → Controller |
| 增加状态类型 | 扩展枚举与 Service 处理逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 定时状态未生效 | 检查 XXL-Job 配置与 `ProductSchedule` 日志 |
| 查询结果为空 | 校验租户参数与销售状态条件 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-main-rate
