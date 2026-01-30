---
name: product-insurance-api
description: |
  【模块定位】产品投保接口

  【支持的代理】
  - java-developer: 实现产品投保接口逻辑
  - planner: 规划产品投保接口方案

  【触发关键词】
  投保接口, insurance api, 核保

  【必须调用】
  java-developer: 任务涉及"产品投保接口" → MUST
  planner: 规划"产品投保接口"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品投保接口）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品投保接口.md

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

# 产品投保接口

> **文档目的**: 说明产品投保相关入口与对外投保 RPC 接口，便于定位投保初始化能力。
> **更新时间**: 2026-01-28

---

## 模块职责

提供产品投保初始化接口及投保流程相关对外 RPC 服务，支撑产品投保流程启动。

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
| 财险投保初始化 | 非标准投保流程初始化 | `InsurePropertyController` | `IInsurePolicyApplicationServ` |
| 投保 RPC 初始化 | 投保预订单初始化 | `PfPropertyInsureApiImpl` | `IInsurePolicyApplicationServ` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `InsurePropertyController.java` | `adapter/web/insure/` | 财险投保初始化入口 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IInsurePolicyApplicationServ.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/application/` | 投保流程应用服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 非标准投保初始化
**触发条件**: 财险投保初始化调用
**入口**: `InsurePropertyController.initToGetPayInfo()`

```
1. Controller 校验签名与参数
2. ApplicationService 初始化投保流程
3. 返回状态机通用结果
```

### 流程2: RPC 投保预订单初始化
**触发条件**: RPC 初始化投保
**入口**: `PfPropertyInsureApiImpl.initialization()`

```
1. 校验请求参数
2. ApplicationService 执行初始化
3. 返回初始化结果
```

## 数据模型

- `CommonPropertyInsureCmd` 投保请求
- `InitToGetPayInfoCmd` 获取支付信息命令
- `CommonInsureApiCmd` 投保 RPC 请求
- `StatemachineCommonResult` 统一投保结果

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 投保 DTO/结果封装 |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| lcyf-framework-security | 注解 | 签名校验与安全控制 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `PfPropertyInsureApi` | 投保初始化能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `PfPropertyInsureApi` | `initialization(...)` | 投保预订单初始化 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 统一投保结果 | `StatemachineCommonResult` | 对齐状态机结果返回 |
| 安全校验 | `@ValidSign` | 防止非法请求 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增投保接口 | 扩展 ApplicationService → Controller/RPC |
| 新增投保校验 | 扩展校验逻辑与签名策略 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 初始化失败 | 检查参数校验与投保流程配置 |
| 回包为空 | 检查状态机处理链路 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-insurance-api
