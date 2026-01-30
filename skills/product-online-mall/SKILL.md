---
name: product-online-mall
description: |
  【模块定位】产品在线商城管理

  【支持的代理】
  - java-developer: 实现产品在线商城管理逻辑
  - planner: 规划产品在线商城管理方案

  【触发关键词】
  在线商城, online mall, 商城

  【必须调用】
  java-developer: 任务涉及"产品在线商城管理" → MUST
  planner: 规划"产品在线商城管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品在线商城管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品在线商城管理.md

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

# 产品在线商城管理

> **文档目的**: 说明在线商城模板维护与查询入口，便于定位渠道/外部/内部商城配置。
> **更新时间**: 2026-01-28

---

## 模块职责

提供在线商城产品模板的查询、保存与恢复入口，覆盖渠道端、外部 H5 与内部 H5 三类入口。

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
| 渠道在线商城模板 | 默认/自定义/新增列表与保存 | `OnlineMallTemplateController` | `IOnlineMallTemplateService` |
| 外部 H5 在线商城 | 对外 H5 商城列表 | `ProductLcyfOuterController` | `IOnlineMallTemplateService` |
| 内部 H5 在线商城 | 内部商城列表 | `OnlineMallTemplateInnerController` | `IOnlineMallTemplateService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `OnlineMallTemplateController.java` | `adapter/web/lcyf/` | 渠道在线商城模板管理 |
| `ProductLcyfOuterController.java` | `adapter/web/lcyf/outer/` | 外部 H5 商城列表与推广链接 |
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

### 流程1: 渠道在线商城模板查询
**触发条件**: 渠道端查询在线商城产品
**入口**: `OnlineMallTemplateController.queryDefaultOnlineMallList()` / `queryCustomOnlineMallList()`

```
1. Controller 获取用户与渠道上下文
2. Service 查询默认/自定义模板
3. 返回在线商城模板数据
```

### 流程2: 保存在线商城模板
**触发条件**: 渠道端保存模板
**入口**: `OnlineMallTemplateController.saveOnlineMallTemplate()`

```
1. Controller 校验用户上下文与参数
2. Service 保存模板配置
3. 返回操作结果
```

## 数据模型

- `OnlineMallTemplateDto` 在线商城模板
- `OnlineMallSaveCmd` 模板保存命令
- `OnlineMallAllProductDto` 商城产品列表

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 商城 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| lcyf-framework-security | 登录上下文 | 用户/渠道上下文获取 |

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
| 模板区分默认/自定义 | 多入口查询 | 适配渠道差异化展示 |
| 内外 H5 入口分离 | 内外接口独立 | 降低外部访问风险 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增商城展示维度 | 扩展 DTO/Query → Service → Controller |
| 支持更多渠道 | 扩展用户/渠道上下文解析逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 查询无数据 | 检查渠道与用户上下文是否合法 |
| 保存失败 | 检查模板参数与权限配置 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-online-mall
