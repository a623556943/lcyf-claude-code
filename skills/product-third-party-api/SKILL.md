---
name: product-third-party-api
description: |
  【模块定位】产品第三方对接接口

  【支持的代理】
  - java-developer: 实现产品第三方对接接口逻辑
  - planner: 规划产品第三方对接接口方案

  【触发关键词】
  第三方, third party, 对接接口

  【必须调用】
  java-developer: 任务涉及"产品第三方对接接口" → MUST
  planner: 规划"产品第三方对接接口"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品第三方对接接口）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 第三方对接接口.md

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

# 第三方对接接口

> **文档目的**: 说明第三方对接入口与历史回调接口状态，便于识别现有对接范围。
> **更新时间**: 2026-01-28

---

## 模块职责

提供第三方保司或外部系统的定制接口入口，并保留历史第三方回调接口代码（当前已禁用）。

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
| 招商仁和对接 | 获取电子投保单地址 | `CmrhController` | `ICmrhService` |
| 复星导入 | 复星产品费率导入 | `FosunController` | `PremiumConfigGateway` |
| 第三方通知 | 历史第三方回调接口（已注释禁用） | `ThirdPartyNotifyController` | `PolicyApi` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `CmrhController.java` | `adapter/web/third/` | 招商仁和自定义接口 |
| `FosunController.java` | `adapter/web/third/` | 复星费率导入接口 |
| `ThirdPartyNotifyController.java` | `adapter/web/third/` | 第三方通知接口（历史/已禁用） |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ICmrhService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/custom/cmrh/` | 招商仁和对接服务 |
| `PremiumConfigGateway.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/infrastructure/gateway/` | 复星费率导入持久化 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `PremiumConfigGateway.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/infrastructure/gateway/` | 复星费率导入数据入库 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| `PremiumConfigDo.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/infrastructure/entity/` | 复星费率导入实体 |

## 核心流程

### 流程1: 招商仁和电子投保单地址查询
**触发条件**: 第三方系统查询电子投保单地址
**入口**: `CmrhController.getEApplyForm()`

```
1. Controller 接收投保单号
2. CmrhService 获取电子投保单地址
3. 返回查询结果
```

### 流程2: 复星费率导入
**触发条件**: 上传复星费率文件
**入口**: `FosunController.importPrem()`

```
1. Controller 接收文件并解析
2. 构建费率实体并批量保存
3. 返回导入结果
```

## 数据模型

- `FosunPrem` 复星费率导入行
- `PremiumConfigDo` 费率配置实体

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 第三方对接命令与 DTO |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| policy-api | Dubbo 依赖 | 第三方通知回调处理（历史） |

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
| `PolicyApi` | `queryPolicyByInnerOrderNo(...)` | policy 模块（历史回调处理） |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 历史回调保留 | 代码注释禁用 | 保留历史对接实现供追溯 |
| 导入独立入口 | 复星导入独立接口 | 降低对其他费率配置影响 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增第三方接口 | 新增自定义 Controller 与 Service |
| 新增导入模板 | 扩展导入解析逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 第三方回调无法使用 | 该接口已禁用，仅保留历史代码 |
| 导入失败 | 检查模板格式与解析字段 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-third-party-api
