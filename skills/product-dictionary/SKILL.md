---
name: product-dictionary
description: |
  【模块定位】产品字典管理

  【支持的代理】
  - java-developer: 实现产品字典管理逻辑
  - planner: 规划产品字典管理方案

  【触发关键词】
  产品字典, dictionary, 字典管理

  【必须调用】
  java-developer: 任务涉及"产品字典管理" → MUST
  planner: 规划"产品字典管理"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品字典管理）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品字典管理.md

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

# 产品字典管理

> **文档目的**: 说明产品字典数据维护入口与职责，便于定位字典配置与查询。
> **更新时间**: 2026-01-28

---

## 模块职责

维护产品字典数据，提供分页查询、新增、编辑与查询单字段类型列表入口。

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
| 字典分页查询 | 字典数据分页查询 | `ProductDictDataController` | `IProductDictDataService` |
| 字典新增/编辑 | 新增、编辑字典数据 | `ProductDictDataController` | `IProductDictDataService` |
| 单字段类型查询 | 查询指定字典类型列表 | `ProductDictDataController` | `IProductDictDataService` |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `ProductDictDataController.java` | `adapter/web/dict/` | 字典数据维护与查询 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `IProductDictDataService.java` | `lcyf-module-product-biz/src/main/java/com/lcyf/cloud/module/product/biz/service/` | 字典数据服务 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: 字典分页查询
**触发条件**: 字典列表查询
**入口**: `ProductDictDataController.page()`

```
1. Controller 接收查询参数
2. MapUtils.flat 统一整理查询条件
3. Service 返回分页结果
4. 返回统一结果
```

### 流程2: 字典新增
**触发条件**: 新增字典数据
**入口**: `ProductDictDataController.add()`

```
1. Controller 校验新增参数
2. Service 执行新增
3. 返回操作结果
```

## 数据模型

- `ProductDictDataDto` 字典数据 DTO
- `ProductDictDataAddCmd`/`ProductDictDataUpdateCmd` 字典维护命令

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| product-api | Maven 依赖 | 字典 DTO/Cmd 定义 |
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
| 字典统一管理 | 集中 Controller 维护 | 减少字典分散配置 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增字典类型 | 扩展 DTO/Cmd → Service → Controller |
| 增加查询维度 | 扩展查询参数与服务 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 字典列表为空 | 检查字典类型与查询条件 |
| 查询单字段类型失败 | 校验 companyCode/dictType/dictVersion 参数 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-dictionary
