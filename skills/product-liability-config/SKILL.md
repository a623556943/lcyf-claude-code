---
name: product-liability-config
description: |
  【模块定位】产品责任配置

  【支持的代理】
  - java-developer: 实现产品责任配置逻辑
  - planner: 规划产品责任配置方案

  【触发关键词】
  责任配置, liability, 产品责任

  【必须调用】
  java-developer: 任务涉及"产品责任配置" → MUST
  planner: 规划"产品责任配置"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品责任配置）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品配置-责任配置.md

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

# 产品配置-责任配置

> **文档目的**: 说明责任配置的入口、流程与依赖，便于维护责任类型与责任项。
> **更新时间**: 2026-01-28

---

## 模块职责

提供责任类型与责任项的维护入口，支持责任分页查询、导入、编辑与删除。

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
| 责任类型查询 | 查询责任类型 | `DutyController` | `IDutyService` |
| 责任分页查询 | 分页获取责任列表 | `DutyController` | `IDutyService` |
| 责任导入/模板下载 | 下载模板与导入责任 | `DutyController` | `IDutyService` |
| 责任新增/编辑/删除 | 维护责任项 | `DutyController` | `IDutyService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `DutyController.java` | `adapter/web/config/` | 责任类型、责任项维护入口 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IDutyService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/productV2/` | 责任配置业务服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 责任分页查询
**触发条件**: 责任列表查询
**入口**: `DutyController.page()`

```
1. Controller 接收分页查询参数
2. MapUtils.flat 统一整理查询条件
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 责任导入
**触发条件**: 上传责任模板
**入口**: `DutyController.importDuty()`

```
1. Controller 接收文件
2. Service 解析导入文件并写入
3. 返回导入结果
```

## 数据模型

- `DutyAddCmd`/`DutyUpdateCmd` 责任新增与编辑命令
- `DutyInfoDto`/`DutyPageDto` 责任信息与分页
- `DutyTypeDto` 责任类型

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 责任相关 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductApi` | 查询产品风险/责任信息 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductApi` | `getProductRisk(...)` | 查询产品风险与计划关系 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 导入/模板下载 | Controller 统一入口 | 降低责任配置维护成本 |
| 查询条件整理 | `MapUtils.flat` | 统一请求参数格式 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增责任字段 | 扩展 DTO/Cmd → Service → Controller |
| 增加责任导入规则 | 扩展 Service 解析逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 导入失败 | 检查模板格式与服务端日志 |
| 责任列表为空 | 校验查询参数与租户过滤条件 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-liability-config
