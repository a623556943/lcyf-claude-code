---
name: document
description: |
  保单（Policy）业务管理
  
  【模块定位】保单全生命周期管理，包括寿险保单和非车险（财产险）保单。
  
  【支持的代理】
  - java-developer: 实现保单业务逻辑
  - planner: 规划保单流程
  - architect: 系统设计
  
  【触发关键词】
  保单、保单查询、保单保存、保单录入、保单状态、保单管理、保单同步
  
  【必须调用】
  Java-developer: 任务涉及"保单操作"、"保单管理" → MUST
  Planner: 规划"保单流程"、"保单体系" → MUST

---

# 保单业务模块文档

> 本文档描述 policy-module 中的保单（Policy）业务模块，包括保单查询、保存、前端录入和 MQ 同步。

## 1. 模块概述

保单业务模块是整个系统的核心，负责保单全生命周期管理，包括寿险保单和非车险（财产险）保单。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 保单录入 | 前端录入保单信息（含投保人、被保人、受益人、险种等） |
| 保单查询 | 多维度查询（保单号、投保单ID、客户信息等） |
| 保单保存 | 支持新增、修改、物理删除 |
| MQ同步 | 接收外部系统保单数据同步 |
| 状态管理 | 一级/二级状态流转管理 |
| 数据聚合 | PolicyPublicDetails 公共信息聚合 |

### 1.2 保单领域类型

| 类型 | 值 | 说明 |
|------|---|------|
| 寿险 | 1 | 人寿保险，表前缀 policy_ |
| 非车险 | 2 | 财产保险，表前缀 policy_property_ |

---

## 2. 数据模型

### 2.1 核心数据表

#### 寿险保单表结构

| 表名 | 实体 | 说明 |
|------|------|------|
| policy_details | PolicyDetailsDo | 保单主表 |
| policy_risk_info | PolicyRiskInfoDo | 险种信息表 |
| policy_applicant_details | PolicyApplicantDetailsDo | 投保人信息表 |
| policy_insured_details | PolicyInsuredDetailsDo | 被保人信息表 |
| policy_beneficiary_details | PolicyBeneficiaryDetailsDo | 受益人信息表 |
| policy_duty_info | PolicyDutyInfoDo | 责任信息表 |
| policy_public_details | PolicyPublicDetailsDo | 保单公共信息表（聚合） |
| policy_customer | PolicyCustomerDo | 客户表 |
| policy_underwrite_info | PolicyUnderwriteInfoDo | 核保信息表 |

#### 非车险保单表结构

| 表名 | 实体 | 说明 |
|------|------|------|
| policy_property_details | PolicyPropertyDetailsDo | 财险保单主表 |
| policy_property_risk_info | PolicyPropertyRiskInfoDo | 财险险种表 |
| policy_property_applicant_details | - | 财险投保人表 |
| policy_property_insured_details | - | 财险被保人表 |
| policy_property_beneficiary_details | - | 财险受益人表 |

### 2.2 PolicyDetails 主表关键字段

```java
// PolicyDetailsDo
applyFormId             // 投保单ID（内部唯一标识）
policyDomainType        // 保单领域类型（1=寿险，2=非车）
mainOrderNo             // 主订单号
innerOrderNo            // 子订单号
contNo                  // 保单号（保司侧）
prtNo                   // 投保单号（保司侧）
contType                // 保单类型

// 产品信息
innerProductCode        // 内部产品编码
innerProductName        // 内部产品名称
productCode             // 保司产品编码
insuranceCompanyCode    // 保险公司编码

// 保费信息
prem                    // 首期保费
actualPrem              // 实收保费
sumPrem                 // 总保费
amnt                    // 保额

// 时间信息
cvalidate               // 保单起期
expireDate              // 保单止期
polApplyDate            // 投保日期
signingDate             // 签单日期

// 状态信息
proposalStatusFirst     // 一级状态
proposalStatusSecondary // 二级状态
payStatus               // 支付状态

// 客户信息
appntNo                 // 投保人客户号
insuredNo               // 被保人客户号（逗号分隔）

// 渠道信息
channelCodeTob          // B端渠道
channelCodeToa          // A端渠道（团队）
salesmanCode            // 业务员编码

// 续保信息
rnewApplyFormId         // 续保关联投保单ID
proposalType            // 交易类型（1=新契约，2=续保）

// 电子化信息
receiptStatus           // 回执状态
visitStatus             // 回访状态
doubleRecordStatus      // 双录状态
singleRecordStatus      // 单录状态
```

### 2.3 PolicyRiskInfo 险种关键字段

```java
// PolicyRiskInfoDo
applyFormId             // 投保单ID（关联主表）
innerRiskCode           // 内部险种编码
innerRiskPlanCode       // 内部险种计划编码
riskCode                // 保司险种编码
riskPlanCode            // 保司险种计划编码

// 主附险标识
subRiskFlag             // M=主险，R=附加险
sequenceNo              // 险种序号（主险为1）

// 保费保额
prem                    // 保费
amnt                    // 保额

// 保障期间
insureStartDate         // 险种起期
insureEndDate           // 险种止期
indemStartDate          // 责任起期
indemEndDate            // 责任止期

// 缴费信息
payEndYear              // 缴费期间（年）
payIntv                 // 缴费频次（0=一次性，1=月，12=年）

// 关联数据
dutyInfoList            // 责任信息列表
beneficiaryDetailsList  // 受益人列表
```

---

## 3. API 接口

### 3.1 Dubbo RPC 接口

**接口定义**: `PolicyApi.java`

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| savePrePolicy | PolicySaveCmd | Boolean | 保存预保单（订单创建时） |
| savePolicy | PolicySaveCmd | Boolean | 保存正式保单（承保成功后） |
| createOrModifyPolicyImageDetail | PolicyImageDetailCmd | Boolean | 保存保单图片详情 |

**实现类**: `PolicyApiImpl.java`

### 3.2 REST API 接口

**Controller**: `PolicyController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/policy/auth/queryPolicy/info | 查询保单完整信息 |
| GET | /api/v1/policy/auth/queryPolicy/info/simple | 查询保单基础信息 |
| GET | /api/v1/policy/auth/queryByLcyf | 云服查询保单列表 |
| GET | /api/v1/policy/auth/toa/page/policyPublic | 即展保单列表查询 |
| GET | /api/v1/policy/auth/toa/policyPublic/export | 即展保单导出 |

### 3.3 查询参数

```java
// 支持的查询条件
applyFormId             // 投保单ID（精确匹配）
contNo                  // 保单号
prtNo                   // 投保单号
innerOrderNo            // 订单号
innerProductCode        // 产品编码
insuranceCompanyCode    // 保险公司
channelCodeTob          // 渠道
channelCodeToa          // 团队
appntName               // 投保人姓名
appntIdCardNo           // 投保人身份证号
insuredName             // 被保人姓名
insuredIdCardNo         // 被保人身份证号
proposalStatusFirst     // 一级状态
polApplyDate            // 投保日期范围
cvalidate               // 保单起期范围
```

---

## 4. 核心流程

### 4.1 前端录入保单流程

```
┌─────────────────────────────────────────────────────────────────┐
│  前端提交 PolicyDetailsAddCmd                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyDetailsController.add()                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyDetailsService.create()                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. PolicyDetailsAssembler 转换 Cmd → Do                  │   │
│  │ 2. PolicyDetailsGateway.save() 保存主表                  │   │
│  │ 3. 创建 PolicyPublicDetailsDo 并保存（聚合表）           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyCustomerServiceImpl.createPolicyApplicantDetailsAddCmd() │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 按五要素查询客户（姓名/证件号/手机号/性别/生日）        │   │
│  │ 2. 若客户不存在，新增客户                                │   │
│  │ 3. 将客户号写回 policy_details 的 appnt_no              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  保存关联数据                                                    │
│  - PolicyRiskInfoGateway.save() 保存险种                         │
│  - PolicyInsuredDetailsGateway.save() 保存被保人                 │
│  - PolicyBeneficiaryDetailsGateway.save() 保存受益人             │
│  - PolicyDutyInfoGateway.save() 保存责任信息                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 applyFormId                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 MQ 同步保单流程

```
┌─────────────────────────────────────────────────────────────────┐
│  外部系统发送 MQ 消息                                            │
│  Topic: topic%saas_sync_data_preservation                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PreservationConsumer.saasSyncDataPreservationConsumer()        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 版本检查（dataSyncCheck）                             │   │
│  │ 2. Redis 分布式锁防重                                    │   │
│  │    key: sync_preservation:{orderSn}:{version}           │   │
│  │ 3. 解析消息 PreservationSaasSyncMsgDto                   │   │
│  │ 4. 调用 IPreservationConsumerService                     │   │
│  │ 5. 回复 ACK                                              │   │
│  │ 6. 通知财务系统（如涉及收费）                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPreservationConsumerService.lcyfPreservationDataSync()        │
│  - 按 applyFormId 查询保单                                       │
│  - 若存在则更新，不存在则新增                                     │
│  - 保存/更新相关联表（险种、被保人等）                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 保单状态变更流程

```
┌─────────────────────────────────────────────────────────────────┐
│  触发事件：支付成功 / 承保成功 / 保全生效 等                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  发送 MQ 消息                                                    │
│  Topic: topic%saas_policy_status_change                         │
│  Payload: PolicyStatusChangeMsgDto                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyPublicApplicationServiceImpl.modifyWhenPolicyStatusChange│
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 更新 policy_public_details 状态字段                   │   │
│  │    - proposalStatusFirst (一级状态)                      │   │
│  │    - proposalStatusSecondary (二级状态)                  │   │
│  │    - receiptStatus (回执状态)                            │   │
│  │    - visitStatus (回访状态)                              │   │
│  │    - doubleRecordStatus (双录状态)                       │   │
│  │    - singleRecordStatus (单录状态)                       │   │
│  │ 2. 更新对应的 policy_details 或 policy_property_details  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 保单查询流程（多维度）

```
┌─────────────────────────────────────────────────────────────────┐
│  前端查询请求（Map 参数）                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyController.queryByLcyf()                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyPublicDetailsService.queryPolicyPublicByBeanSearchLcyf()│
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyPublicDetailsGateway.queryPolicyPublicByBeanSearchLcyf() │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 使用 BeanSearcher 框架                                   │   │
│  │ 1. 动态组装 SQL（基于 @DbField 注解）                    │   │
│  │ 2. 应用数据权限（@BsDataTableScope）                     │   │
│  │ 3. 字段加密处理（@DbCryptoTable）                        │   │
│  │ 4. 分页查询                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 PageResult<PolicyPublicDetailsLcyfView>                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 保单保存时的数据流转

```
OrderService.createOrder() 创建订单
    ↓
PolicyApi.savePrePolicy()  保存预保单（status=待生效）
    ↓
支付成功 → 调用保司承保接口
    ↓
承保成功回调
    ↓
PolicyApi.savePolicy()  更新为正式保单
    ↓ (同步更新)
1. policy_details.proposalStatusFirst = TAKE_EFFECT（已生效）
2. policy_public_details.proposalStatusFirst = TAKE_EFFECT
3. policy_order_details.orderStatus = SUCCESS
    ↓
触发后续流程（生成续保计划/转保计划）
```

### 5.2 保单与订单的关联关系

```
policy_order_details (订单主表)
    ├── main_order_no (主订单号)
    └── inner_order_no (子订单号)
            ↓
policy_details (保单主表)
    ├── main_order_no (关联主订单号)
    ├── inner_order_no (关联子订单号)
    └── apply_form_id (投保单ID，唯一标识)
            ↓
policy_risk_info (险种表，一对多)
    └── apply_form_id (关联)
            ↓
policy_insured_details (被保人表，一对多)
    └── apply_form_id (关联)
            ↓
policy_beneficiary_details (受益人表，一对多)
    └── apply_form_id (关联)
```

### 5.3 PolicyPublicDetails 聚合逻辑

`PolicyPublicDetails` 是保单的聚合视图，包含：
- policy_details 的核心字段
- policy_applicant_details 的投保人姓名
- policy_insured_details 的被保人姓名（逗号拼接）
- policy_order_details 的订单状态
- 各种链接展示标志（支付/回执/回访等）

**数据同步时机**：
1. 保单创建时
2. 保单状态变更时
3. 电子化状态变更时（回执/回访/双录/单录）

---

## 6. 开发注意事项

### 6.1 投保单 ID（applyFormId）生成规则

```java
// 格式: yyyyMMdd + 雪花ID后12位
String applyFormId = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(7);
// 示例: 20260128123456789012
```

### 6.2 保单号（contNo）来源

- **前端录入**：用户手工输入
- **MQ同步**：外部系统传入
- **承保回调**：保司返回

### 6.3 客户号（appntNo/insuredNo）处理

保单保存时会按五要素查询客户：
- 姓名（name）
- 证件号（idCardNo）
- 手机号（mobile）
- 性别（sex）
- 生日（birthday）

若客户不存在则自动创建，客户号格式：
```java
// 格式: C + yyyyMMdd + 雪花ID后10位
String customerNo = "C" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(9);
```

### 6.4 主附险关系处理

通过 `subRiskFlag` 和 `sequenceNo` 标识：
- `subRiskFlag = M` 且 `sequenceNo = 1`：主险
- `subRiskFlag = R` 且 `sequenceNo > 1`：附加险

**重要规则**：
- 主险必须且只能有一个
- 附加险依赖主险，主险退保则附加险自动失效

### 6.5 保单状态一致性

保单订单状态存储在多处，需保证一致性：
1. `policy_details.proposalStatusFirst/Secondary`
2. `policy_public_details.proposalStatusFirst/Secondary`
3. `policy_order_details.orderStatus`

**建议**：修改的时候请注意同步修改

### 6.6 MQ 消费幂等性

使用 Redis 分布式锁 + 版本号防止重复消费：
```java
String contNoKey = POLICY_SYNC_CONT_NO_PREFIX + contNo;
boolean locked = redissonObject.trySetValue(contNoKey, currentTime, 15000L);
if (!locked) {
    log.error("重复消费");
    return;
}
```

### 6.7 数据加密存储

敏感字段使用 AES 加密存储：
- 身份证号（idCardNo）
- 手机号（mobile）
- 银行账号（bankAccount）

**注意**：
- Entity 使用 `@TableField(typeHandler = CryptoTypeHandler.class)` 注解
- 查询时需解密，插入时需加密

### 6.8 BeanSearcher 查询优化

使用 BeanSearcher 时注意：
- 避免 `select *`，使用 `@DbField` 明确指定字段
- 复杂查询使用 `where` 子句预过滤
- 分页查询控制 `pageSize`，避免大结果集

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| API接口 | `api/api/PolicyApi.java` |
| RPC实现 | `adapter/rpc/PolicyApiImpl.java` |
| Controller | `adapter/web/policy/PolicyController.java` |
| Service | `biz/service/policy/IPolicyDetailsService.java` |
| ServiceImpl | `biz/service/impl/policy/PolicyDetailsServiceImpl.java` |
| Gateway | `biz/infrastructure/gateway/PolicyDetailsGateway.java` |
| Entity | `biz/infrastructure/entity/PolicyDetailsDo.java` |
| RiskEntity | `biz/infrastructure/entity/PolicyRiskInfoDo.java` |
| PublicEntity | `biz/infrastructure/entity/PolicyPublicDetailsDo.java` |
| MQ Consumer | `adapter/mq/comsumer/PreservationConsumer.java` |
| Assembler | `biz/infrastructure/assembler/policy/PolicyDetailsAssembler.java` |
| Mapper | `biz/infrastructure/mapper/PolicyDetailsMapper.java` |
| Dto | `common-dto/dto/policy/PolicyDetailsDto.java` |
| RiskDto | `common-dto/dto/policy/PolicyRiskInfoDto.java` |
| Cmd | `api/pojo/cmd/policy/PolicyDetailsAddCmd.java` |

---

## 8. 扩展开发指引

### 8.1 新增保单字段

1. **修改 Entity**
   - `PolicyDetailsDo.java` 添加字段
   - 添加 `@TableField` 注解

2. **修改 Dto**
   - `PolicyDetailsDto.java` 添加字段

3. **修改 Assembler**
   - `PolicyDetailsAssembler.java` 添加映射（或使用 MapStruct 自动映射）

4. **修改数据库**
   - 执行 ALTER TABLE 添加列

5. **同步 PublicDetails**
   - 若需在聚合表展示，同步修改 `PolicyPublicDetailsDo`

### 8.2 新增查询维度

1. **修改 View**
   - `PolicyPublicDetailsLcyfView.java` 添加字段
   - 添加 `@DbField` 注解

2. **修改查询条件**
   - Controller 接收新参数
   - Gateway 传递给 BeanSearcher

3. **添加索引**（性能优化）
   - 在数据库表添加对应索引

### 8.3 新增 MQ 消费

1. **定义 MQ 常量**
   - `PolicyMQConstants` 添加 Topic/Tag

2. **创建消费者 Bean**
   - `PreservationConsumer` 添加 `@Bean` 方法
   - 实现 `Consumer<Message<T>>` 接口

3. **实现消费逻辑**
   - 版本检查 → 防重 → 业务处理 → 回复 ACK
