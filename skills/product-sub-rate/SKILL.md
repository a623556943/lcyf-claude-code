---
name: product-sub-rate
description: |
  【模块定位】产品子费率管理

  【支持的代理】
  - java-developer: 实现产品子费率管理逻辑
  - planner: 规划产品子费率管理方案

  【触发关键词】
  子费率, sub rate, 费率分级

  【必须调用】
  java-developer: 任务涉及"产品子费率管理" → MUST
  planner: 规划"产品子费率管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品子费率管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品费率管理-产品子费率.md

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

# 产品费率管理-产品子费率

> **文档目的**: 说明子费率维护入口与关联结算关系的职责，便于定位子费率查询与维护入口。
> **更新时间**: 2026-01-28

---

## 模块职责

维护产品子费率信息（分公司/渠道维度），提供子费率列表、详情与结算关系维护入口。

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
| 子费率列表 | 子费率分页与列表查询 | `ProductServiceController` | `IProductServiceInfoService` |
| 子费率详情 | 基本信息与结算信息详情 | `ProductServiceController` | `IProductServiceInfoService` |
| 子费率结算关系 | 关联结算关系维护 | `ProductServiceController` | `IProductServiceInfoService` |
| 内部费率查询 | 根据产品与牌照查询子费率 | `ProductServiceInnerController` | `IProductServiceInfoService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductServiceController.java` | `adapter/web/config/` | 子费率维护、详情与结算关系 |
| `ProductServiceInnerController.java` | `adapter/web/inner/` | 内部系统子费率查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductServiceInfoService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 子费率维护与查询 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 子费率列表查询
**触发条件**: 费率维护列表查询
**入口**: `ProductServiceController.pageByCx()`

```
1. Controller 接收查询参数
2. TenantMapUtils.flat 整理参数
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 子费率结算关系维护
**触发条件**: 关联协议或结算关系编辑
**入口**: `ProductServiceController.relationAgreement()`

```
1. Controller 校验参数
2. Service 更新结算关系
3. 返回结果
```

## 数据模型

- `ProductServiceInfoDto` 子费率信息
- `ProductFeeDetailsDto` 子费率详情
- `ProductFeeSettleInfoDto` 子费率结算信息
- `ProductServiceInfoRelationAgreementCmd` 关联协议维护命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 子费率 DTO/Cmd 定义 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductServiceApi` | 子费率查询能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductServiceApi` | `getProductServiceByInnerProductCode(...)` | 查询子费率列表 |
| `ProductServiceApi` | `getProductServiceListByMainId(...)` | 查询主费率下子费率 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 结算关系维护 | 关联协议接口 | 适配多方结算关系 |
| 内部查询 | 内部接口单独维护 | 保障系统内调用稳定性 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增子费率维度 | 扩展 DTO/Cmd → Service → Controller |
| 扩展结算关系字段 | 调整结算 DTO 与持久化逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 子费率列表为空 | 检查查询参数与费率关联关系 |
| 结算关系保存失败 | 检查协议绑定与主费率是否存在 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-sub-rate
