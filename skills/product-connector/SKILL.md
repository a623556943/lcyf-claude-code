---
name: product-connector
description: |
  【模块定位】产品投保连接器

  【支持的代理】
  - java-developer: 实现产品投保连接器逻辑
  - planner: 规划产品投保连接器方案

  【触发关键词】
  连接器, connector, 适配器

  【必须调用】
  java-developer: 任务涉及"产品投保连接器" → MUST
  planner: 规划"产品投保连接器"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品投保连接器）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品投保配置-连接器.md

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

# 产品投保配置-连接器

> **文档目的**: 说明连接器、加解密器与参数处理器的配置入口与日志查询方式，便于快速定位投保对接配置。
> **更新时间**: 2026-01-28

---

## 模块职责

维护投保对接所需的连接器、加解密器与参数处理器配置，并提供连接器请求日志查询入口。

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
| 加解密器管理 | 加解密器分页、详情、新增、编辑、删除 | `ConnectorController` | `IEncryptorService` |
| 参数处理器管理 | 参数处理器分页、详情、新增、编辑、删除 | `ConnectorController` | `ITransformProcessorService` |
| 连接器管理 | 连接器分页、详情、新增、编辑、删除 | `ConnectorController` | `IConnectorService` |
| 连接器请求日志 | 请求日志分页与详情 | `ConnectorRequestLogController` | `IConnectorRequestLogService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ConnectorController.java` | `adapter/web/config/` | 连接器、加解密器、参数处理器配置维护 |
| `ConnectorRequestLogController.java` | `adapter/web/config/` | 连接器请求日志查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IEncryptorService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 加解密器配置服务 |
| `ITransformProcessorService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 参数处理器配置服务 |
| `IConnectorService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 连接器配置服务 |
| `IConnectorRequestLogService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 连接器请求日志服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 连接器分页查询
**触发条件**: 配置页面查询连接器
**入口**: `ConnectorController.page()`

```
1. Controller 接收查询参数
2. MapUtils.flat 统一整理查询条件
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 新增连接器配置
**触发条件**: 新增连接器
**入口**: `ConnectorController.add()`

```
1. Controller 校验新增参数
2. Service 创建连接器配置
3. 返回操作结果
```

## 数据模型

- `ConnectorDto` 连接器配置
- `ConnectorAddCmd`/`ConnectorUpdateCmd` 连接器维护命令
- `EncryptorDto` 加解密器配置
- `EncryptorAddCmd`/`EncryptorUpdateCmd` 加解密器维护命令
- `TransformProcessorDto` 参数处理器配置
- `TransformProcessorAddCmd`/`TransformProcessorUpdateCmd` 参数处理器维护命令
- `ConnectorRequestLogDto` 连接器请求日志

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 连接器相关 DTO/Cmd |
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| bean-searcher | 组件注入 | 连接器查询支持 |

### 被依赖的模块
| 模块 | 调用方式 | 提供能力 |
|------|----------|------|
| 其他业务模块 | Dubbo `ProductFactoryApi`（已废弃） | 获取连接器配置 |

## RPC 接口

### 对外提供的接口
| 接口 | 方法 | 用途 |
|------|------|------|
| `ProductFactoryApi`（已废弃） | `getConnectorConfigByInnerProductPlanCode(...)` | 获取产品连接器配置 |

### 调用的外部接口
| 接口 | 方法 | 来源模块 |
|------|------|----------|
| 未发现明确证据/以源码为准 | - | - |

## 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 参数处理 | `MapUtils.flat` | 统一请求参数格式 |
| 连接器日志独立查询 | 单独日志入口 | 便于排查对接问题 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增连接器字段 | 扩展 DTO/Cmd → Service → Controller |
| 新增日志筛选维度 | 扩展日志查询参数与服务 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 连接器查询为空 | 检查租户与查询条件 |
| 请求日志为空 | 确认连接器调用是否产生记录 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-connector
