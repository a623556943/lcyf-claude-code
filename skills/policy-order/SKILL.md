---
name: order
description: |
  订单（Order）业务管理
  
  【模块定位】订单全生命周期管理，包括创建、支付、承保、出单等环节。
  
  【支持的代理】
  - java-developer: 实现订单业务逻辑
  - planner: 规划订单流程
  
  【触发关键词】
  订单、订单创建、订单查询、订单状态、订单支付、订单流转、订单管理
  
  【必须调用】
  Java-developer: 任务涉及"订单操作"、"订单管理" → MUST
  Planner: 规划"订单流程"、"订单体系" → MUST

---

# 订单业务模块文档

> 本文档描述 policy-module 中的订单（Order）业务模块，包括订单创建、查询、修改、状态流转和链接获取。

## 1. 模块概述

订单业务模块是保单销售的核心，负责订单的全生命周期管理，包括创建、支付、承保、出单等环节。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 订单创建 | 支持首期/续期订单创建 |
| 订单查询 | 多维度查询（订单号、保单号、客户信息等） |
| 订单修改 | 状态更新、信息修正 |
| 状态流转 | 基于状态机的订单状态管理 |
| 链接获取 | 继续投保、支付、回执、回访等链接 |
| MQ同步 | 订单数据异步同步 |

### 1.2 目录结构

```
lcyf-module-policy/
├── lcyf-module-policy-adapter/
│   ├── mq/comsumer/OrderConsumer.java        # MQ消费者
│   ├── web/order/OrderController.java        # REST API
│   └── rpc/PolicyOrderApiImpl.java           # RPC实现
└── lcyf-module-policy-biz/
    ├── service/order/
    │   ├── IPolicyOrderDetailsService.java   # 订单服务接口
    │   └── impl/PolicyOrderDetailsServiceImpl.java  # 服务实现
    ├── service/application/
    │   └── impl/PolicyOrderApplicationServImpl.java # 应用服务
    └── infrastructure/
        ├── entity/order/PolicyOrderDetailsDo.java   # 主表实体
        ├── entity/order/PolicyOrderPayDetailsDo.java # 支付详情
        ├── entity/order/PolicyOrderStateMachineRelDo.java # 状态机
        ├── gateway/order/PolicyOrderDetailsGateway.java # 数据访问
        └── mapper/PolicyOrderDetailsMapper.java      # Mapper
```

---

## 2. 数据模型

### 2.1 数据库表结构

#### 主表：policy_order_details

| 字段分类 | 主要字段 | 说明 |
|---------|--------|------|
| **订单标识** | main_order_no | 主订单号 |
| | inner_order_no | 内部订单号（子订单） |
| | apply_form_id | 投保单ID |
| | prt_no | 保司承保前的唯一流水号 |
| **订单状态** | order_status | 订单状态（0-9） |
| | main_order_status | 主订单状态 |
| | order_type | 订单类型（1=首期，2=续期） |
| | order_type_child | 二级子订单类型 |
| **产品信息** | insurance_company_code | 保司编码 |
| | inner_product_code | 内部产品编码 |
| | product_code | 保司产品编码 |
| | cont_no | 保单号 |
| **保费信息** | sum_prem | 总保费 |
| | prem | 保费 |
| | pay_price | 支付金额 |
| **渠道信息** | channel_code | 渠道编号 |
| | channel_code_to_a | toA渠道编码 |
| | agent_code | 代理人编号 |
| | account_code | 出单账号 |
| **支付信息** | pay_status | 支付状态 |
| | pay_type | 支付方式 |
| | pay_time | 支付时间 |
| **URL标志** | get_pay_url_flag | 是否支持获取支付链接 |
| | get_continue_insurance_url_flag | 是否支持获取继续保险链接 |
| | get_receipt_url_flag | 是否支持获取回执链接 |
| | get_visit_url_flag | 是否支持获取访问链接 |
| | get_cancel_url_flag | 是否支持获取撤单链接 |
| | get_surrender_url_flag | 是否支持获取退保链接 |
| | get_single_record_url_flag | 是否支持获取单录链接 |
| **回执回访** | receipt_status | 回执状态 |
| | receipt_verify_type | 回执验证方式 |
| | return_visit_status | 回访状态 |
| **双录单录** | dual_record_status | 双录状态 |
| | single_record_status | 单录状态 |
| **续保转保** | rnew_flag | 是否为续保单 |
| | rnew_cont_no | 续保单关联的原保单号 |
| | rnew_plan_code | 续保计划编码 |
| | transfer_plan_code | 转保计划编码 |
| **云服系统** | lcyf_order_sn | 云服订单号 |
| | lcyf_source_system | 云服订单来源系统 |
| | lcyf_data_sync_version | 云服数据同步版本号 |

#### 支付详情表：policy_order_pay_details

| 字段 | 说明 |
|------|------|
| inner_order_no | 内部订单号 |
| pay_channel | 支付渠道 |
| pay_trade_no | 支付流水号 |
| pay_amount | 支付金额 |
| pay_status | 支付状态 |
| pay_time | 支付时间 |

#### 状态机关系表：policy_order_state_machine_rel

| 字段 | 说明 |
|------|------|
| inner_order_no | 订单号 |
| state_machine_code | 状态机状态编码 |
| state_machine_desc | 状态机当前状态描述 |
| state_machine_next_event | 状态机下一个事件 |

### 2.2 核心枚举

#### 订单状态

```java
// OrderStatusEnum
0 - 草稿
1 - 待支付
2 - 支付中
3 - 支付失败
4 - 待承保
5 - 承保失败
6 - 待出单
7 - 出单失败
8 - 已出单（终态）
9 - 已撤销
```

#### 订单类型

```java
// OrderTypeEnum
1 - 首期订单
2 - 续期订单
```

---

## 3. API 接口

### 3.1 订单创建接口

**基础路径**: `/api/v1/policy`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /cx/createOrder | 创建订单（橙芯） |

### 3.2 订单查询接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /auth/queryOrder/info | 查询订单完整信息 |
| GET | /auth/queryOrder/simple | 查询订单基础信息 |
| GET | /auth/queryOrder/byContNo | 按保单号查询订单 |
| GET | /auth/queryOrder/byApplyFormId | 按投保单ID查询订单 |
| GET | /auth/cx/page/order | 分页查询（橙芯） |
| GET | /auth/lcyf/page/order | 分页查询（云服） |

### 3.3 链接获取接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /cx/getMoreUrl | 获取链接（橙芯） |
| GET | /standard/getMoreUrl | 获取链接（标准） |

**链接类型（moreUrlType）**:

| 类型ID | 说明 | 字段标志 |
|--------|------|---------|
| 1 | 继续投保 | get_continue_insurance_url_flag |
| 2 | 支付 | get_pay_url_flag |
| 3 | 撤单 | get_cancel_url_flag |
| moreUrl1 | 继续投保（标准） | - |
| moreUrl2 | 支付（标准） | - |
| moreUrl3 | 撤单（标准） | - |
| moreUrl4 | 回执 | get_receipt_url_flag |
| moreUrl5 | 回访 | get_visit_url_flag |
| moreUrl6 | 退保 | get_surrender_url_flag |
| moreUrl7 | 单录链接 | get_single_record_url_flag |

---

## 4. 核心流程

### 4.1 订单创建流程

```
┌─────────────────────────────────────────────────────────────────┐
│  前端提交 OrderCreateCmd                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ POST /cx/createOrder
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrderController.createOrder()                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyOrderDetailsService.createOrder()                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 参数验证与幂等性检查                                  │   │
│  │ 2. 生成订单号                                           │   │
│  │    - mainOrderNo: MO + yyyyMMdd + 雪花ID后6位           │   │
│  │    - innerOrderNo: IO + yyyyMMdd + 雪花ID后6位          │   │
│  │ 3. PolicyOrderDetailsAssembler 组装DO对象               │   │
│  │ 4. PolicyOrderDetailsGateway.save()                     │   │
│  │ 5. 同步订单与保单数据                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 mainOrderNo 或 innerOrderNo                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 订单查询流程

```
┌─────────────────────────────────────────────────────────────────┐
│  查询请求（Map 参数）                                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrderController.getOrderByBeanSearch*()                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyOrderDetailsService.getOrderByBeanSearch*()             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyOrderDetailsGateway.selectPage()                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 使用 BeanSearcher 框架                                   │   │
│  │ 1. 动态组装 SQL（基于 @DbField 注解）                    │   │
│  │ 2. 应用数据权限（@BsDataTableScope）                     │   │
│  │ 3. 执行分页查询                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 PageResult<OrderDetailsCXView/LcyfView>                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 订单状态流转流程

```
┌─────────────────────────────────────────────────────────────────┐
│  事件触发（支付成功/失败等）                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyOrderApplicationServ.modifyOrder*()                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyOrderStateMachineRelService.createOrModify()            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 更新 policy_order_state_machine_rel 表               │   │
│  │    - state_machine_code (当前状态)                      │   │
│  │    - state_machine_next_event (下一个事件)              │   │
│  │ 2. IPolicyOrderDetailsService.modifyOrderStatus()       │   │
│  │    - 更新 policy_order_details.order_status             │   │
│  │ 3. calculateAndModifyMainOrderStatus()                  │   │
│  │    - 计算并更新主订单状态                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**状态流转示例**:

```
草稿(0) → 待支付(1) → 支付中(2) → 待承保(4) → 待出单(6) → 已出单(8)
                           ↓
                      支付失败(3)
```

### 4.4 链接获取流程

```
┌─────────────────────────────────────────────────────────────────┐
│  前端请求获取链接                                                │
│  GET /getMoreUrl?mainOrderNo=xxx&moreUrlType=2                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrderController.getMoreUrl()                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyOrderDetailsService.getMoreUrl()                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 根据订单号查询订单详情                                │   │
│  │ 2. 检查对应URL标志位（getPayUrlFlag等）                  │   │
│  │ 3. 根据类型调用不同渠道API获取链接                       │   │
│  │    - 继续投保：拼接投保链接                             │   │
│  │    - 支付：调用支付网关                                 │   │
│  │    - 回执：生成回执链接                                 │   │
│  │    - 回访：生成回访链接                                 │   │
│  │ 4. 返回处理后的链接                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 URL 字符串                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 MQ 同步流程

```
┌─────────────────────────────────────────────────────────────────┐
│  订单数据变更                                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyOrderApplicationServ 发送MQ消息                         │
│  Topic: topic%delay_sync_data                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrderConsumer.syncOrderDelayConsumer()                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 根据 msgAction 执行对应操作                              │   │
│  │ - delay:order:payWaitToFail → 支付中转支付失败          │   │
│  │ - 其他业务动作                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OrderDataSyncSendRecordService 记录同步状态                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 订单号生成规则

```java
// 主订单号格式: MO + yyyyMMdd + 雪花ID后6位
String mainOrderNo = "MO" +
    LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(12);
// 示例: MO20260128123456

// 子订单号格式: IO + yyyyMMdd + 雪花ID后6位
String innerOrderNo = "IO" +
    LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(12);
// 示例: IO20260128123456
```

### 5.2 订单与保单的关联

```
policy_order_details (订单表)
    ├── main_order_no (主订单号)
    ├── inner_order_no (子订单号)
    └── apply_form_id (投保单ID)
            ↓
policy_details (保单表)
    ├── apply_form_id (投保单ID，关联键)
    ├── main_order_no (关联主订单号)
    └── inner_order_no (关联子订单号)
```

### 5.3 MQ 消息结构

```java
// MqMessage<JSONObject>
{
    "msgAction": "delay:order:payWaitToFail",  // 消息动作
    "tag": "order_sync",                       // 标签
    "content": {                               // 消息内容
        "innerOrderNo": "IO20260128123456",
        "orderStatus": "3",
        // ... 其他字段
    }
}
```

---

## 6. 开发注意事项

### 6.1 订单创建幂等性

使用订单号进行幂等性检查：
```java
PolicyOrderDetailsDto existOrder = get(innerOrderNo);
if (existOrder != null) {
    log.warn("订单已存在: {}", innerOrderNo);
    return innerOrderNo;
}
```

### 6.2 主订单状态计算

主订单状态根据所有子订单状态计算：
- 所有子订单都成功 → 主订单成功
- 任一子订单失败 → 主订单失败
- 其他情况 → 取最低状态

### 6.3 URL 标志位设置

URL 标志位根据订单状态和产品配置动态计算：
```java
// 支付链接
getPayUrlFlag = (orderStatus == WAIT_PAY || orderStatus == PAYING)
                && productConfig.supportOnlinePay();

// 回执链接
getReceiptUrlFlag = (proposalStatusFirst == TAKE_EFFECT)
                    && (receiptStatus == WAIT_RECEIPT || receiptStatus == RECEIPTING);
```

### 6.4 订单状态同步

订单状态变更时需同步更新：
1. `policy_order_details.order_status`
2. `policy_order_details.main_order_status`
3. `policy_order_state_machine_rel.state_machine_code`
4. `policy_details.proposalStatusFirst/Secondary`（如已生成保单）

### 6.5 MQ 消费幂等性

使用 Redis 分布式锁防止重复消费：
```java
String lockKey = "order_sync:" + innerOrderNo;
boolean locked = redissonObject.trySetValue(lockKey, currentTime, 15000L);
if (!locked) {
    log.error("重复消费");
    return;
}
```

### 6.6 订单数据同步记录

使用 `order_data_sync_send_record` 表记录 MQ 发送状态：
```java
OrderDataSyncSendRecordDo record = new OrderDataSyncSendRecordDo();
record.setBusinessId(applyFormId);
record.setTopic(TOPIC_SYNC_FINANCE_ORDER);
record.setTag(TAG_NEW_ORDER);
record.setOrderType("1"); // 首期订单
orderDataSyncSendRecordService.save(record);
```

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| Controller | `adapter/web/order/OrderController.java` |
| Service | `biz/service/order/IPolicyOrderDetailsService.java` |
| ServiceImpl | `biz/service/impl/order/PolicyOrderDetailsServiceImpl.java` |
| AppService | `biz/service/application/impl/PolicyOrderApplicationServImpl.java` |
| Gateway | `biz/infrastructure/gateway/order/PolicyOrderDetailsGateway.java` |
| PayGateway | `biz/infrastructure/gateway/order/PolicyOrderPayDetailsGateway.java` |
| StateMachineGateway | `biz/infrastructure/gateway/order/PolicyOrderStateMachineRelGateway.java` |
| Entity | `biz/infrastructure/entity/order/PolicyOrderDetailsDo.java` |
| PayEntity | `biz/infrastructure/entity/order/PolicyOrderPayDetailsDo.java` |
| StateMachineEntity | `biz/infrastructure/entity/order/PolicyOrderStateMachineRelDo.java` |
| Mapper | `biz/infrastructure/mapper/PolicyOrderDetailsMapper.java` |
| MQ Consumer | `adapter/mq/comsumer/OrderConsumer.java` |
| RPC实现 | `adapter/rpc/PolicyOrderApiImpl.java` |
| View（橙芯） | `biz/infrastructure/view/order/OrderDetailsCXView.java` |
| View（云服） | `biz/infrastructure/view/order/OrderDetailsLcyfView.java` |
| Dto | `api/pojo/dto/order/PolicyOrderDetailsDto.java` |
| Cmd | `api/pojo/cmd/order/OrderCreateCmd.java` |

---

## 8. 扩展开发指引

### 8.1 新增订单查询维度

1. **修改 View 类**
   - 添加 `@DbField` 字段

2. **添加索引**
   - 在 `policy_order_details` 表添加索引

3. **修改 Service**（如需特殊处理）
   - 在 `getOrderByBeanSearch*()` 添加逻辑

### 8.2 新增链接类型

1. **添加标志字段**
   - `policy_order_details` 表添加 `get_*_url_flag`

2. **修改链接获取逻辑**
   - `IPolicyOrderDetailsService.getMoreUrl()` 添加类型处理

3. **修改标志位更新**
   - 在订单创建/状态变更时更新标志位

### 8.3 新增MQ消费动作

1. **定义 msgAction**
   - `PolicyMQConstants` 添加常量

2. **实现消费逻辑**
   - `OrderConsumer` 添加 case 分支

3. **记录同步状态**
   - 调用 `OrderDataSyncSendRecordService`
