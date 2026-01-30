---
name: product-team-sales
description: |
  【模块定位】团队产品销售管理

  【支持的代理】
  - java-developer: 实现团队产品销售管理逻辑
  - planner: 规划团队产品销售管理方案

  【触发关键词】
  团队产品, team sales, 团队管理

  【必须调用】
  java-developer: 任务涉及"团队产品销售管理" → MUST
  planner: 规划"团队产品销售管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（团队产品销售管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品销售管理-团队产品管理.md

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

# 产品销售管理-团队产品管理

> **文档目的**: 说明团队产品销售管理入口与职责，便于定位团队可见产品与特殊费率设置。
> **更新时间**: 2026-01-28

---

## 模块职责

维护团队产品的可见性与特殊费率配置，提供团队管理端的查询与设置入口。

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
| 团队可见产品 | 团队管理端产品列表与详情 | `ChannelToAProductController` | `IChannelToAProductService` |
| 团队可见设置 | 设置产品可见/不可见 | `ChannelToAProductController` | `IChannelToAProductService` |
| 团队特殊费率 | 设置与查询特殊费率 | `ChannelToAProductController` | `IChannelToAProductService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ChannelToAProductController.java` | `adapter/web/sales/` | 团队产品可见与费率维护 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IChannelToAProductService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/sales/team/` | 团队产品销售服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 团队可见产品设置
**触发条件**: 团队管理端设置可见性
**入口**: `ChannelToAProductController.setChannelProductVisible()`

```
1. Controller 校验参数
2. Service 更新团队产品可见性
3. 返回设置结果
```

### 流程2: 团队特殊费率设置
**触发条件**: 团队特殊费率维护
**入口**: `ChannelToAProductController.setChannelSpecialFee()`

```
1. Controller 校验日期有效性
2. Service 保存特殊费率
3. 返回设置结果
```

## 数据模型

- `ChannelToAProductAdminView` 团队产品视图
- `ChannelToAProductFeeDetailsDto` 团队产品详情
- `ChannelToAVisibleProductSetCmd`/`ChannelToASpecialUpdateFeeCmd` 团队配置命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 团队销售 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductSalesApi` | 团队销售能力 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductSalesApi` | `getChannelProductsToaList(...)` | 团队产品列表 |
| `ProductSalesApi` | `getChannelProductToa(...)` | 团队产品信息 |
| `ProductSalesApi` | `initTeamSalesProduct(...)` | 初始化团队产品 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 团队与渠道分离 | 独立控制器 | 适配不同销售组织 |
| 特殊费率校验 | 日期有效性检查 | 防止费率配置错误 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增团队规则 | 扩展 Cmd/Service → Controller |
| 新增筛选条件 | 扩展查询参数 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 团队产品为空 | 检查团队编码与产品可见配置 |
| 特殊费率不生效 | 检查生效时间范围与配置状态 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-team-sales
