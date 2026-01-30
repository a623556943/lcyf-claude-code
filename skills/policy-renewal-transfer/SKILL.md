---
name: renewal-transfer
description: |
  续保转保（Renewal & Transfer）业务管理
  
  【模块定位】保单到期前的续保/转保计划生成、状态管理和链接获取。
  
  【支持的代理】
  - java-developer: 实现续保转保逻辑
  - planner: 规划续保转保流程
  
  【触发关键词】
  续保、转保、续保计划、转保计划、保单续期、产品切换、续保链接
  
  【必须调用】
  Java-developer: 任务涉及"续保"、"转保" → MUST
  Planner: 规划"续保体系"、"续保流程" → MUST

---

# 续保转保业务模块文档

> 本文档描述 policy-module 中的续保（Renewal）和转保（Transfer）业务模块，包括计划生成、状态管理和链接获取。

## 1. 模块概述

续保转保模块负责在保单到期前生成续保/转保计划，引导客户完成保险产品的持续购买。

### 1.1 核心概念

| 概念 | 说明 |
|------|------|
| 续保 | 同一产品继续投保，保障延续 |
| 转保 | 切换到另一产品，可能有优惠 |
| 续期订单 | 见独立文档，已有续期订单文档 |

### 1.2 核心功能

| 功能 | 描述 |
|------|------|
| 计划生成 | 保单生效后自动生成续保/转保计划 |
| 状态管理 | 管理计划的可续保/待续保/已续保状态 |
| 链接获取 | 生成续保/转保投保链接 |
| 条件判断 | 根据产品配置和黑名单判断是否可续保 |

---

## 2. 数据模型

### 2.1 续保计划表（policy_renewal_plan_details）

```java
// PolicyRenewalPlanDetailsDo
rnewPlanCode            // 续保计划编码（RP + 雪花ID）
mainOrderNoFirstYear    // 首年主订单号
mainOrderNoLastYear     // 上年度主订单号
contNoFirstYear         // 首年保单号
contNoLastYear          // 上年度保单号
applyFormIdFirstYear    // 首年投保单ID
applyFormIdLastYear     // 上年度投保单ID

// 可续保时间窗口
allowRnewStartTime      // 可续保开始时间
allowRnewEndTime        // 可续保结束时间

// 状态
rnewStatus              // 续保状态（cantRenewal/waitRenewal/alreadyRenewal）
rnewRefuseReason        // 不可续保原因

// 配置信息
configVersion           // 生成时产品配置版本号

// 关联信息
innerProductCode        // 内部产品编码
insuranceCompanyCode    // 保险公司编码
channelCodeTob          // 渠道编码
channelCodeToa          // 团队编码
```

### 2.2 转保计划表（policy_transfer_plan_details）

```java
// PolicyTransferPlanDetailsDo
transferPlanCode        // 转保计划编码
transferStatus          // 转保状态（notApply/alreadyApply/cantTransfer）
transferRefuseReason    // 不可转保原因

// 目标产品信息
targetInnerProductCode  // 目标产品编码
targetInnerProductName  // 目标产品名称

// 其他字段与续保计划类似
```

### 2.3 状态枚举

#### 续保状态（RenewalStatusEnum）

```java
CANT_RENEWAL("cantRenewal", "不可续保"),
WAIT_RENEWAL("waitRenewal", "待续保"),
ALREADY_RENEWAL("alreadyRenewal", "已续保")
```

#### 转保状态（TransferStatusEnum）

```java
NOT_APPLY("notApply", "未投保"),
ALREADY_APPLY("alreadyApply", "已投保"),
CANT_TRANSFER("cantTransfer", "不可转保")
```

---

## 3. API 接口

### 3.1 续保计划接口

**Controller**: `PolicyRenewalPlanDetailsController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /policyRenewalPlanDetails/page | 分页查询续保计划 |
| GET | /policyRenewalPlanDetails/export | 导出续保计划 |
| GET | /policyRenewalPlanDetails/details | 查询续保计划详情 |
| GET | /policyRenewalPlanDetails/renewalUrl | 获取续保链接 |
| GET | /policyRenewalPlanDetails/channel/page | 渠道分页查询 |

### 3.2 转保计划接口

**Controller**: `PolicyTransferPlanDetailsController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /policyTransferPlanDetails/page | 分页查询转保计划 |
| GET | /policyTransferPlanDetails/export | 导出转保计划 |
| GET | /policyTransferPlanDetails/details | 查询转保计划详情 |
| GET | /policyTransferPlanDetails/transferUrl | 获取转保链接 |
| GET | /policyTransferPlanDetails/channel/page | 渠道分页查询 |

### 3.3 核心系统查询接口

**Controller**: `PolicyRenewalHxController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /inner/renewalDetail | 查询续保计划详情（给中介核心） |

---

## 4. 核心流程

### 4.1 续保/转保计划生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│  触发条件：                                                      │
│  1. 新保单生效时（PolicyService）                                │
│  2. 产品续保配置变更时（MQ消息）                                  │
│  3. 黑名单变更时（MQ消息）                                       │
│  4. 定时任务更新（scheduleModifyRenewalPlanStatus）              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyRenewalApplicationService                               │
│  .generatePolicyRenewalAndTransferPlanWhenNewPolicy()           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  RenewalGenerateHelper.generatePolicyRenewalPlan()              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 检查续保功能开关                                      │   │
│  │    lcyf.cloud.policy.isEnableRenewalPlan                │   │
│  │ 2. 验证保单状态（需待生效或已生效）                       │   │
│  │ 3. 检查保单到期日前90天是否需要生成                       │   │
│  │ 4. 获取产品续保配置                                      │   │
│  │ 5. 根据配置判断生成续保还是转保计划                       │   │
│  │ 6. 查询黑名单判断是否可续保                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│ 生成续保计划               │ │ 生成转保计划               │
│ RenewalPlanDetailsGateway │ │ TransferPlanDetailsGateway│
│ .save()                   │ │ .save()                   │
└───────────────────────────┘ └───────────────────────────┘
```

### 4.2 续保/转保链接生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│  前端请求获取续保链接                                            │
│  GET /renewalUrl?rnewPlanCode=xxx                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyRenewalPlanDetailsService.getRenewalUrl(rnewPlanCode)   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询续保计划                                          │   │
│  │ 2. 校验状态是否可续保（waitRenewal）                      │   │
│  │ 3. 获取产品投保链接模板                                   │   │
│  │ 4. 拼接参数（applyFormId、渠道、产品等）                  │   │
│  │ 5. 加密签名                                              │   │
│  │ 6. 返回完整链接                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回续保链接 URL                                                │
│  如：https://xxx.com/insure?token=xxx&source=renewal            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 续保计划状态更新流程

```
┌─────────────────────────────────────────────────────────────────┐
│  定时任务触发 scheduleModifyRenewalPlanStatus()                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. 查询 waitRenewal 状态且已超过续保窗口的计划                   │
│     WHERE rnew_status = 'waitRenewal'                           │
│       AND allow_rnew_end_time < NOW()                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 更新状态为 cantRenewal（不可续保）                           │
│     rnew_refuse_reason = '已超过续保时间窗口'                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 新保单触发续保计划生成

```
PolicyApi.savePolicy() 保单保存
    ↓
事务提交后
    ↓
TransactionSynchronization.afterCommit()
    ↓
PolicyRenewalApplicationService.generatePolicyRenewalAndTransferPlanWhenNewPolicy()
    ↓
查询产品续保配置（ProductApi.getRenewalConfig）
    ↓
    ├── 支持续保 → 生成 PolicyRenewalPlanDetails
    │   - rnewPlanCode = RP + 雪花ID
    │   - rnewStatus = waitRenewal
    │   - allowRnewStartTime = 保单止期 - 90天
    │   - allowRnewEndTime = 保单止期
    │
    └── 支持转保 → 生成 PolicyTransferPlanDetails
        - transferPlanCode = TP + 雪花ID
        - transferStatus = notApply
        - targetInnerProductCode = 配置的目标产品
```

### 5.2 黑名单影响续保状态

```
风控系统触发 MQ 消息
Topic: topic%blacklist_modify
    ↓
PolicyRenewalApplicationService.modifyWhenBlackListModify()
    ↓
查询受影响的续保计划（按客户身份证号）
    ↓
    ├── 客户加入黑名单 → 更新 rnewStatus = cantRenewal
    │                   rnewRefuseReason = '客户在黑名单中'
    │
    └── 客户移出黑名单 → 重新计算是否可续保
                        可能恢复 rnewStatus = waitRenewal
```

### 5.3 产品配置变更影响续保计划

```
产品中心触发 MQ 消息
Topic: topic%product_renewal_config_change
    ↓
PolicyRenewalApplicationService.modifyWhenProductRenewalConfigChange()
    ↓
查询受影响的续保计划（按产品编码）
    ↓
    ├── 产品关闭续保 → 更新 rnewStatus = cantRenewal
    │                 rnewRefuseReason = '产品已关闭续保'
    │
    └── 产品开启续保 → 重新生成续保计划
```

### 5.4 续保完成后的数据更新

```
用户通过续保链接完成投保
    ↓
新保单生成，proposalType = 2（续保）
    ↓
新保单的 applyFormId 写入原保单的 rnewApplyFormId
    ↓
原保单的续保计划更新
    - rnewStatus = alreadyRenewal
    - rnewApplyFormId = 新保单的applyFormId
```

---

## 6. 开发注意事项

### 6.1 续保计划编码生成规则

```java
// 续保计划编码
String rnewPlanCode = "RP" + IdUtil.getSnowflakeNextIdStr();
// 示例: RP1234567890123456

// 转保计划编码
String transferPlanCode = "TP" + IdUtil.getSnowflakeNextIdStr();
// 示例: TP1234567890123456
```

### 6.2 续保时间窗口计算

```java
// 默认90天窗口
LocalDateTime expireDate = policy.getExpireDate();
LocalDateTime allowRnewStartTime = expireDate.minusDays(90);
LocalDateTime allowRnewEndTime = expireDate;

// 可通过产品配置自定义天数
Integer renewalDays = productConfig.getRenewalAdvanceDays();
if (renewalDays != null) {
    allowRnewStartTime = expireDate.minusDays(renewalDays);
}
```

### 6.3 功能开关配置

```yaml
lcyf:
  cloud:
    policy:
      isEnableRenewalPlan: false  # 续保计划是否启用，默认关闭
```

**注意**：生产环境需配合产品配置共同判断。

### 6.4 续保计划与保单的关联

```
原保单 (applyFormIdFirstYear/LastYear)
    ↓
续保计划 (PolicyRenewalPlanDetails)
    ↓ (用户完成续保)
新保单 (rnewApplyFormId)
    ↓
新保单的 proposalType = 2（续保）
新保单记录 applyFormIdFirstYear = 原保单的applyFormIdFirstYear
新保单记录 applyFormIdLastYear = 原保单的applyFormId
```

这样形成续保链路，可追溯整个续保历史。

### 6.5 续保链接安全性

续保链接包含加密 token，包含信息：
- 续保计划编码
- 渠道信息
- 用户身份标识
- 时间戳
- 签名

**有效期**：链接包含时间戳，超过有效期（如24小时）需重新获取。

### 6.6 续保与转保互斥

一个保单只能生成续保或转保计划，不能同时存在两种：
- 产品配置为"续保"→ 生成续保计划
- 产品配置为"转保"→ 生成转保计划
- 产品配置为"不可续"→ 不生成计划

### 6.7 多年期保单处理

对于缴费期间大于1年的保单：
- 每年到期前生成续期支付提醒（续期订单模块）
- 最后一年到期前生成续保/转保计划

```java
if (policy.getPayEndYear() > 1 && currentYear < policy.getPayEndYear()) {
    // 生成续期支付计划
    generateRenewalPayPlan();
} else {
    // 生成续保/转保计划
    generateRenewalOrTransferPlan();
}
```

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| 续保Controller | `adapter/web/renewalPlan/PolicyRenewalPlanDetailsController.java` |
| 转保Controller | `adapter/web/renewalPlan/PolicyTransferPlanDetailsController.java` |
| 续保Service | `biz/service/IPolicyRenewalPlanDetailsService.java` |
| 转保Service | `biz/service/IPolicyTransferPlanDetailsService.java` |
| 应用Service | `biz/service/policy/IPolicyRenewalApplicationService.java` |
| 应用ServiceImpl | `biz/service/impl/policy/PolicyRenewalApplicationServiceImpl.java` |
| 生成Helper | `biz/service/impl/policy/RenewalGenerateHelper.java` |
| 参数Helper | `biz/service/impl/PolicyRenewalTransferParamHelper.java` |
| 续保Gateway | `biz/infrastructure/gateway/PolicyRenewalPlanDetailsGateway.java` |
| 转保Gateway | `biz/infrastructure/gateway/PolicyTransferPlanDetailsGateway.java` |
| 续保Entity | `biz/infrastructure/entity/PolicyRenewalPlanDetailsDo.java` |
| 转保Entity | `biz/infrastructure/entity/PolicyTransferPlanDetailsDo.java` |
| 续保Mapper | `biz/infrastructure/mapper/PolicyRenewalPlanDetailsMapper.java` |
| 转保Mapper | `biz/infrastructure/mapper/PolicyTransferPlanDetailsMapper.java` |
| 核心系统API | `adapter/web/saas/PolicyRenewalHxController.java` |

---

## 8. 扩展开发指引

### 8.1 新增续保条件判断

若需添加新的续保条件（如年龄限制）：

1. **修改 RenewalGenerateHelper**
   - 在 `generatePolicyRenewalPlan()` 方法中添加判断逻辑
   - 不满足条件时设置 `rnewStatus = cantRenewal`
   - 设置 `rnewRefuseReason = 'xxx'`

2. **添加枚举值**
   - `RenewalRefuseReasonEnum` 添加拒绝原因

### 8.2 新增触发场景

若需添加新的续保计划生成触发：

1. **创建 MQ 消费者**
   - 监听新的 Topic
   - 调用 `PolicyRenewalApplicationService` 方法

2. **实现处理逻辑**
   - 查询受影响的保单
   - 调用 `RenewalGenerateHelper.generatePolicyRenewalPlan()`

### 8.3 自定义续保链接模板

若需自定义续保链接格式：

1. **修改产品配置**
   - 在产品中心配置续保链接模板

2. **修改 IPolicyRenewalPlanDetailsService**
   - `getRenewalUrl()` 方法读取产品配置
   - 按模板拼接参数
