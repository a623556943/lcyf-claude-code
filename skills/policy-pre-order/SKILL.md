---
name: pre-order
description: |
  预订单（PreOrder）业务管理
  
  【模块定位】投保链接的预生成管理，支持代理人、渠道等信息的预配置。
  
  【支持的代理】
  - java-developer: 实现预订单逻辑
  - planner: 规划预订单流程
  
  【触发关键词】
  预订单、预生成、投保链接、代理人、渠道配置、预订单过期
  
  【必须调用】
  Java-developer: 任务涉及"预订单"、"投保链接" → SHOULD

---

# 预订单业务模块文档

> 本文档描述 policy-module 中的预订单（PreOrder）业务模块，包括预订单创建、查询和与正式订单的转换。

## 1. 模块概述

预订单模块用于支持投保链接的预生成，允许在正式投保前预先创建订单记录，存储代理人、渠道等信息，供投保页面使用。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 预订单创建 | 支持寿险/非车险预订单创建 |
| 预订单查询 | 按预订单号、第三方订单号查询 |
| 投保链接生成 | 动态生成带预订单号的投保链接 |
| 正式订单关联 | 预订单与正式订单的绑定 |
| 过期管理 | 定时清理过期预订单 |

### 1.2 目录结构

```
lcyf-module-policy/
├── lcyf-module-policy-adapter/
│   ├── schedule/PreOrderDeleteSchedule.java     # 过期预订单定时任务
│   └── web/order/
│       ├── PreOrderController.java              # V1 API (已标记 @Deprecated)
│       └── PreOrderControllerV2.java            # V2 API (当前版本)
└── lcyf-module-policy-biz/
    ├── service/order/
    │   ├── IPolicyPreOrderInfoService.java      # 预订单服务接口
    │   └── impl/PolicyPreOrderInfoServiceImpl.java # 服务实现
    └── infrastructure/
        ├── entity/order/PolicyPreOrderInfoDo.java   # 预订单实体
        ├── gateway/order/PolicyPreOrderInfoGateway.java # 数据访问
        ├── mapper/PolicyPreOrderInfoMapper.java      # Mapper
        └── assembler/order/PolicyPreOrderInfoAssembler.java # 对象转换
```

---

## 2. 数据模型

### 2.1 预订单表（policy_pre_order_info）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键（雪花ID） |
| pre_order_no | varchar(64) | 预订单号（PRE_ORDER_xxx） |
| main_order_no | varchar(64) | 主订单号（与正式订单的关联键） |
| out_trade_no | varchar(64) | 第三方订单号 |
| insure_url | varchar(500) | 投保链接（包含 {preOrderNo} 参数） |
| product_code | varchar(64) | 保司产品编码 |
| inner_product_code | varchar(64) | 内部产品编码 |
| inner_product_plan_code | varchar(64) | 产品计划编码 |
| supplier_code | varchar(64) | 供应商编码 |
| license_plate | varchar(32) | 销售机构（DFDD/LCBD/MSBD） |
| app_code | varchar(32) | 应用编码（LCYF/JZ/CX） |
| appnt_name | varchar(64) | 投保人姓名 |
| insured_name | varchar(64) | 被保人姓名 |
| channel_code | varchar(64) | 渠道编号 |
| channel_name | varchar(128) | 渠道名称 |
| channel_code_toa | varchar(64) | 团队编码 |
| channel_toa_name | varchar(128) | 团队名称 |
| mga_code | varchar(64) | MGA代理编码 |
| mga_name | varchar(128) | MGA代理名称 |
| agent_code | varchar(64) | 代理人编号 |
| agent_name | varchar(128) | 代理人姓名 |
| account_code | varchar(64) | 出单人编号 |
| account_name | varchar(128) | 出单人姓名 |
| prem | decimal(18,2) | 总保费 |
| amnt | decimal(18,2) | 总保额 |
| insure_type | varchar(32) | 保险类型 |
| request_body | text | 业务请求报文（JSON） |
| status | int | 状态（0=正常，1=失效） |
| expiration_time | datetime | 失效时间 |
| ext1-ext4 | varchar(200) | 扩展字段 |
| tenant_code | varchar(32) | 租户编码 |
| create_time | datetime | 创建时间 |

### 2.2 核心枚举

#### 预订单状态

```java
// PreOrderStatusEnum
0 - 正常（有效）
1 - 失效（已过期）
```

#### 销售机构

```java
// LicensePlateEnum
DFDD - 东方代代
LCBD - 乐橙保代
MSBD - 民生保代
```

#### 应用编码

```java
// AppCodeEnum
LCYF - 乐橙云服
JZ   - 即展
CX   - 橙芯
```

---

## 3. API 接口

### 3.1 预订单创建接口（V2 版本）

**基础路径**: `/api/v2/order/preOrder`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /property/create | 创建非车险预订单 |
| POST | /life/create | 创建寿险预订单 |

### 3.2 预订单创建接口（V1 版本，已弃用）

**基础路径**: `/api/v1/order/preOrder`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /property/create | 创建非车险预订单（productCode） |
| POST | /property/create2 | 创建非车险预订单（innerProductCode） |
| POST | /life/create | 创建寿险预订单（productCode） |
| POST | /life/create2 | 创建寿险预订单（innerProductCode） |

### 3.3 预订单查询接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /get/details/{preOrderNo} | 获取预订单详情（Base64解码） |
| GET | /auth/get/info | 后台管理查询预订单 |
| GET | /inner/info/hx/{preOrderNo} | 核心系统查询 |
| GET | /auth/get/insureUrl | 获取投保链接 |

### 3.4 预订单分页查询接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /auth/page/preOrder/jz | 即展：分页查询 |
| GET | /auth/page/preOrder/lcyf | 乐橙云服：分页查询 |
| GET | /auth/page/preOrder/cx | 橙芯：分页查询 |
| GET | /inner/page/preOrder/hx | 核心系统：分页查询 |

---

## 4. 核心流程

### 4.1 寿险预订单创建流程（V2）

```
┌─────────────────────────────────────────────────────────────────┐
│  外部系统提交 PreOrder4LifeCmd                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ POST /api/v2/order/preOrder/life/create
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PreOrderControllerV2.createPreOrder4Life()                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. MD5 密钥验证                                          │   │
│  │    MD5(productCode + licensePlate) == secretKey         │   │
│  │ 2. 参数校验                                              │   │
│  │    - appCode 非空                                        │   │
│  │    - insureUrl 包含 {preOrderNo} 参数                   │   │
│  │ 3. 设置租户上下文                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyPreOrderInfoService.createPreOrder4LifeV2()             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询产品信息                                          │   │
│  │    ProductApi.getProductAllInfoDtoByProductCode()        │   │
│  │ 2. 查询是否已存在预订单                                   │   │
│  │    preOrderInfoGateway.selectByPreOrderNo(innerOrderNo)  │   │
│  │ 3. 填充预订单基本信息 (fillPolicyAndRisk4Life)           │   │
│  │    - 生成预订单号：PRE_ORDER + 雪花ID                    │   │
│  │    - 设置产品信息                                        │   │
│  │    - 组装投保人/被保人                                   │   │
│  │    - 验证和组装风险信息                                  │   │
│  │ 4. 获取代理人信息 (getAllAgentInfo4LifeV2)               │   │
│  │    - AgentApi.getAgentV2(originId)                      │   │
│  │    - 获取 agentInfo, mgaAgentInfo, channelInfo          │   │
│  │ 5. 填充 request_body (JSON格式)                         │   │
│  │ 6. 保存预订单                                            │   │
│  │    preOrderInfoGateway.saveOrUpdate()                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回预订单号 preOrderNo                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 预订单查询流程

```
┌─────────────────────────────────────────────────────────────────┐
│  投保页面请求预订单信息                                          │
│  GET /get/details/{preOrderNo}                                  │
│  注意：preOrderNo 需 Base64 解码                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PreOrderController.getDetails()                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyPreOrderInfoService.getInfo(preOrderNo)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Base64 解码 preOrderNo                               │   │
│  │ 2. 查询预订单                                            │   │
│  │    preOrderInfoGateway.selectByPreOrderNo()             │   │
│  │ 3. 检查预订单状态（status=0 为有效）                     │   │
│  │ 4. 返回预订单详情                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 PolicyPreOrderInfoDto                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 预订单与正式订单关联流程

```
┌─────────────────────────────────────────────────────────────────┐
│  用户完成投保，生成正式订单                                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  订单创建流程中                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 从预订单中获取代理人、渠道等信息                       │   │
│  │ 2. 生成正式订单                                          │   │
│  │    - mainOrderNo = MO + 日期 + 雪花ID                   │   │
│  │    - innerOrderNo = IO + 日期 + 雪花ID                  │   │
│  │ 3. 关联预订单                                            │   │
│  │    IPolicyPreOrderInfoService                           │   │
│  │    .modifyMainOrderNoByPreOrderNo(preOrderNo, mainOrderNo) │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  更新预订单的 main_order_no 字段                                 │
│  SQL: UPDATE policy_pre_order_info                              │
│       SET main_order_no = #{mainOrderNo}                        │
│       WHERE pre_order_no = #{preOrderNo}                        │
│       AND main_order_no IS NULL                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 预订单过期管理流程

```
┌─────────────────────────────────────────────────────────────────┐
│  定时任务触发 PreOrderDeleteSchedule                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────────┐             ┌─────────────────────────┐
│  modifyExpiredPreOrderStatus()       │  deleteExpiredPreOrder()  │
│  更新过期预订单状态                   │  删除过期预订单           │
│  ┌───────────────────┐               │  ┌───────────────────┐   │
│  │ 条件：             │               │  │ 条件：             │   │
│  │ status = 0         │               │  │ expiration_time    │   │
│  │ expiration_time    │               │  │   < 一周前         │   │
│  │   < 当前时间       │               │  │ pre_order_no != '' │   │
│  │                   │               │  │                   │   │
│  │ 操作：             │               │  │ 操作：             │   │
│  │ SET status = 1    │               │  │ DELETE 记录        │   │
│  └───────────────────┘               │  └───────────────────┘   │
└─────────────────────────┘             └─────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 预订单号生成规则

```java
// 格式: PRE_ORDER_ + 雪花ID
String preOrderNo = "PRE_ORDER_" + IdUtil.getSnowflakeNextIdStr();
// 示例: PRE_ORDER_1234567890123456789
```

### 5.2 投保链接动态替换

```java
// 原始链接模板
String insureUrl = "https://xxx.com/insure?preOrderNo={preOrderNo}&channel=xxx";

// 替换预订单号
String finalUrl = insureUrl.replace("{preOrderNo}", preOrderNo);
// 结果: https://xxx.com/insure?preOrderNo=PRE_ORDER_xxx&channel=xxx
```

### 5.3 代理人信息获取流程

```
预订单请求
    ↓
判断 originId 是否存在
    ├── 存在 → getAllAgentInfo4LifeV2()
    │           ↓
    │       AgentApi.getAgentV2(originId)
    │           ↓
    │       返回 agentInfo, mgaAgentInfo, channelInfo, salesmanInfo
    │
    └── 不存在 → getAllAgentInfo4Life()
                ↓
            HxSystemApi 查询（云服系统）
                ↓
            根据 licensePlate 判断销售机构
                ├── DFDD → 东方代代
                ├── LCBD → 乐橙保代
                └── MSBD → 民生保代
```

### 5.4 request_body JSON 结构

```json
{
    "preOrderNo": "PRE_ORDER_xxx",
    "productCode": "xxx",
    "innerProductCode": "xxx",
    "appntName": "张三",
    "appntIdNo": "110xxx",
    "appntMobile": "138xxx",
    "insuredName": "李四",
    "insuredIdNo": "110xxx",
    "prem": 1000.00,
    "amnt": 100000.00,
    "riskList": [
        {
            "riskCode": "001",
            "riskName": "主险",
            "prem": 800.00
        }
    ],
    "agentInfo": {
        "agentCode": "A001",
        "agentName": "代理人"
    },
    "channelInfo": {
        "channelCode": "C001",
        "channelName": "渠道"
    }
}
```

---

## 6. 开发注意事项

### 6.1 MD5 密钥验证

外部系统调用创建接口时需要提供密钥：
```java
// 密钥生成规则
String expectedKey = DigestUtils.md5Hex(productCode + licensePlate);

// 验证
if (!expectedKey.equals(secretKey)) {
    throw new BusinessException("密钥验证失败");
}
```

### 6.2 投保链接格式要求

投保链接必须包含 `{preOrderNo}` 占位符：
```java
if (!insureUrl.contains("{preOrderNo}")) {
    throw new BusinessException("投保链接必须包含 {preOrderNo} 参数");
}
```

### 6.3 过期时间设置

默认过期时间为当天 23:59:59：
```java
LocalDateTime expirationTime = LocalDateTime.now()
    .with(LocalTime.MAX)
    .minusSeconds(1);
// 结果: 2026-01-28 23:59:59
```

### 6.4 主订单号关联的幂等性

只在 main_order_no 为空时更新，防止覆盖：
```sql
UPDATE policy_pre_order_info
SET main_order_no = #{mainOrderNo}
WHERE pre_order_no = #{preOrderNo}
  AND main_order_no IS NULL  -- 幂等性保证
```

### 6.5 V1 与 V2 版本差异

| 特性 | V1 版本 | V2 版本 |
|------|--------|--------|
| 产品查询 | productCode | innerProductCode |
| 代理人获取 | HxSystemApi | AgentApi.getAgentV2() |
| 出单人信息 | 固定逻辑 | 按 appCode 区分 |
| 状态 | @Deprecated | 当前版本 |

### 6.6 预订单状态检查

查询预订单时需检查状态：
```java
PolicyPreOrderInfoDto preOrder = get(preOrderNo);
if (preOrder == null) {
    throw new BusinessException("预订单不存在");
}
if (preOrder.getStatus() == 1) {
    throw new BusinessException("预订单已失效");
}
```

### 6.7 多租户隔离

预订单支持多租户，通过 tenant_code 隔离：
```java
// 创建时设置租户
TenantContextHolder.setTenantCode(tenantCode);

// 查询时自动过滤
// 由框架自动添加 WHERE tenant_code = 'xxx'
```

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| Controller V2 | `adapter/web/order/PreOrderControllerV2.java` |
| Controller V1 | `adapter/web/order/PreOrderController.java` |
| 定时任务 | `adapter/schedule/PreOrderDeleteSchedule.java` |
| Service | `biz/service/order/IPolicyPreOrderInfoService.java` |
| ServiceImpl | `biz/service/impl/order/PolicyPreOrderInfoServiceImpl.java` |
| Gateway | `biz/infrastructure/gateway/order/PolicyPreOrderInfoGateway.java` |
| Entity | `biz/infrastructure/entity/order/PolicyPreOrderInfoDo.java` |
| Mapper | `biz/infrastructure/mapper/PolicyPreOrderInfoMapper.java` |
| Assembler | `biz/infrastructure/assembler/order/PolicyPreOrderInfoAssembler.java` |
| Dto | `api/pojo/dto/order/PolicyPreOrderInfoDto.java` |
| Cmd（寿险） | `api/pojo/cmd/order/preOrder/PreOrder4LifeCmd.java` |
| Cmd（非车） | `api/pojo/cmd/order/preOrder/PreOrder4PropertyCmd.java` |
| AddCmd | `api/pojo/cmd/order/preOrder/PolicyPreOrderInfoAddCmd.java` |
| UpdateCmd | `api/pojo/cmd/order/preOrder/PolicyPreOrderInfoUpdateCmd.java` |

---

## 8. 扩展开发指引

### 8.1 新增销售机构

1. **添加枚举值**
   - `LicensePlateEnum` 添加新机构

2. **配置代理人获取逻辑**
   - `getAllAgentInfo4Life()` 添加机构处理分支

3. **配置密钥**
   - 通知调用方新机构的密钥规则

### 8.2 新增应用编码

1. **添加枚举值**
   - `AppCodeEnum` 添加新应用

2. **配置出单人逻辑**
   - 在 `createPreOrder4LifeV2()` 添加应用处理

3. **添加分页查询接口**
   - 添加对应的 page 接口

### 8.3 自定义过期策略

1. **修改过期时间计算**
   - 在创建时设置自定义 `expiration_time`

2. **修改定时任务**
   - `PreOrderDeleteSchedule` 调整执行频率

3. **添加状态恢复功能**
   - 实现重新激活过期预订单
