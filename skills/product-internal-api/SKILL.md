---
name: product-internal-api
description: |
  【模块定位】产品内部接口

  【支持的代理】
  - java-developer: 实现产品内部接口逻辑
  - planner: 规划产品内部接口方案

  【触发关键词】
  产品内部接口, internal api, 内部调用

  【必须调用】
  java-developer: 任务涉及"产品内部接口" → MUST
  planner: 规划"产品内部接口"相关方案 → MUST
---

# Product 模块 业务逻辑详细文档（产品内部接口）

**文档创建时间**: 2026-01-30
**文档版本**: V1.0
**参考格式**: 产品内部接口.md

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

# 产品内部接口

> **文档目的**: 说明产品模块内部调试与内部工具接口，便于识别非对外接口。
> **更新时间**: 2026-01-28

---

## 模块职责

提供内部调试与工具接口，用于 JSON 转换、接口调试等内部用途。

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
| JSON 转换测试 | 内部 JSON 转换调试 | `InsureInnerController` | `DynamicJsonEngine` |
| 接口调试 | 内部测试接口调用 | `InsureInnerController` | `Forest` 客户端 |

## 核心入口文件

### Controller 层
| 文件 | 路径 | 职责 |
|------|------|------|
| `InsureInnerController.java` | `adapter/web/insure/` | 内部调试接口 |

### Service 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 内部调试使用工具类或组件 |

### Gateway 层
| 文件 | 路径 | 职责 |
|------|------|------|
| 未发现明确证据/以源码为准 | - | 相关网关未在当前证据中出现 |

### 实体层
| 文件 | 对应表 | 说明 |
|------|--------|------|
| 未发现明确证据/以源码为准 | - | 相关实体未在当前证据中出现 |

## 核心流程

### 流程1: JSON 转换调试
**触发条件**: 内部测试 JSON 转换
**入口**: `InsureInnerController.doJsonTranslate()`

```
1. Controller 接收转换参数
2. 初始化 DynamicJsonEngine
3. 调用转换并返回结果
```

### 流程2: 外部接口测试调用
**触发条件**: 内部调试调用外部接口
**入口**: `InsureInnerController.test()`

```
1. Controller 组装测试请求
2. Forest 发起请求
3. 返回调试结果
```

## 数据模型

- `JsonTransTestQuery` JSON 转换测试参数

### 核心实体关系
未发现明确证据/以源码为准

### 状态流转
未发现明确证据/以源码为准

## 依赖关系

### 依赖的模块
| 模块 | 调用方式 | 用途 |
|------|----------|------|
| lcyf-framework-commons | Maven 依赖 | 统一返回体 |
| lcyf-framework-transform-engine | 引擎 | JSON 动态转换 |
| forest | HTTP 客户端 | 内部调试调用（代码中直接使用） |

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
| 内部调试独立入口 | `inner` 路径 | 避免影响正式接口 |
| 初始化引擎 | `@PostConstruct` | 保证转换引擎可用 |

## 扩展指南

| 场景 | 操作步骤 |
|------|----------|
| 新增调试接口 | 扩展 Controller 调试方法 |
| 替换调试引擎 | 调整工具组件与调用逻辑 |

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 调试接口无返回 | 检查方法返回值与注释状态 |
| 调用失败 | 检查外部接口地址与网络环境 |


---

**文档生成时间**: 2026-01-30
**文档版本**: V1.0
**模块标识**: product-internal-api
