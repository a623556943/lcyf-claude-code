---
name: product-channel-sales
description: |
  【模块定位】渠道产品销售管理

  【支持的代理】
  - java-developer: 实现渠道产品销售管理逻辑
  - planner: 规划渠道产品销售管理方案

  【触发关键词】
  渠道销售, channel sales, 渠道产品

  【必须调用】
  java-developer: 任务涉及"渠道产品销售管理" → MUST
  planner: 规划"渠道产品销售管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（渠道产品销售管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品销售管理-渠道产品销售管理.md

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

# 产品销售管理-渠道产品销售管理

> **文档目的**: 说明渠道产品销售管理入口与职责，便于定位渠道产品可见与费率配置。
> **更新时间**: 2026-01-28

---

## 模块职责

维护渠道产品销售可见性、特殊费率与 MGA 产品规则，提供渠道管理端的查询与设置入口。

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
| 渠道可见产品 | 查询可见产品与详情 | `ProductSaleController` | `IChannelTobProductService` |
| 渠道可见设置 | 设置产品可见/不可见 | `ProductSaleController` | `IChannelTobProductService` |
| 渠道特殊费率 | 设置与查询特殊费率 | `ProductSaleController` | `IChannelTobProductService` |
| MGA 产品规则 | MGA 产品列表与规则设置 | `ProductSaleController` | `IChannelTobMgaProductService` |
| 渠道管理端模板 | 渠道模板可见产品与导出 | `ChannelProductInfoController` | `IChannelTobProductService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductSaleController.java` | `adapter/web/sales/` | 渠道产品可见、费率、MGA 规则 |
| `ChannelProductInfoController.java` | `adapter/web/sales/channel/` | 渠道模板可见产品与导出 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IChannelTobProductService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/sales/` | 渠道产品销售服务 |
| `IChannelTobMgaProductService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/sales/` | MGA 产品规则服务 |
| `IFeeSettleExplainService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 结算说明查询服务 |
| `IProductConfigApplicationService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/productV2/` | 产品基础信息子项查询 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 渠道可见产品设置
**触发条件**: 管理端设置产品可见
**入口**: `ProductSaleController.setChannelProductVisible()`

```
1. Controller 校验设置参数
2. Service 更新渠道产品可见性
3. 返回设置结果
```

### 流程2: 渠道特殊费率设置
**触发条件**: 配置渠道特殊费率
**入口**: `ProductSaleController.setChannelSpecialFee()`

```
1. Controller 校验日期有效性
2. Service 保存特殊费率
3. 返回设置结果
```

## 数据模型

- `ChannelTobProductAdminView` 渠道产品视图
- `ChannelTobProductDto` 渠道产品
- `ChannelVisibleProductSetCmd`/`ChannelSpecialUpdateFeeCmd` 渠道配置命令
- `ChannelTobMgaProductDto`/`ChannelTobMgaProductPageQuery` MGA 产品

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 渠道销售 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| lcyf-framework-security | 登录上下文 | 登录信息获取 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductSalesApi` | 渠道与团队销售能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductSalesApi` | `initChannelSalesProduct(...)` | 初始化渠道销售产品 |
| `ProductSalesApi` | `modifyChannelSalesProductBizStatus(...)` | 修改渠道业务规则 |
| `ProductSalesApi` | `getChannelProductsTobList(...)` | 渠道产品列表 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 渠道与 MGA 分离 | 独立服务管理 | 适配多类销售模式 |
| 特殊费率校验 | 日期有效性检查 | 防止费率配置错误 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增渠道规则 | 扩展 Cmd/Service → Controller |
| 新增导出字段 | 扩展导出逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 渠道产品为空 | 检查渠道编码与产品可见配置 |
| MGA 规则无法设置 | 检查 MGA 产品与规则参数 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-channel-sales
