---
name: master
description: |
  保单大师（Policy Master）聚合查询
  
  【模块定位】保单、保全、续期等综合查询能力，支持多系统数据聚合展示。
  
  【支持的代理】
  - java-developer: 实现聚合查询逻辑
  - planner: 规划聚合查询流程
  - architect: 系统设计
  
  【触发关键词】
  保单大师、聚合查询、多维度查询、续期链路、保全关联、保单综合
  
  【必须调用】
  Java-developer: 任务涉及"保单查询"、"数据聚合" → SHOULD
  Architect: 规划"多系统集成"、"聚合设计" → MUST

---

# 保单大师业务模块文档

> 本文档描述 policy-module 中的保单大师（Policy Master）业务模块，提供保单、保全、续期等综合查询能力。

## 1. 模块概述

保单大师是一个聚合查询模块，将保单、��单、保全、续期等信息整合展示，支持多系统（长城CX/云服Lcyf/BDDS/即展TOA）的差异化查询。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 保单综合查询 | 多维度查询保单信息（含状态、客户、渠道等） |
| 续期链路追溯 | 递归查询续保关系链 |
| 保全关联查询 | 查询保单关联的保全记录 |
| 续期订单查询 | 查询保单关联的续期订单 |
| 链接动态展示 | 根据状态动态展示操作链接（支付/回执/回访等） |
| 数据聚合 | 通过 PolicyPublicDetails 聚合多表数据 |

### 1.2 支持的系统视图

| 系统 | View 类 | 特点 |
|------|---------|------|
| 长城CX | PolicyPublicDetailsCXView | 橙芯系统专用 |
| 云服Lcyf | PolicyPublicDetailsLcyfView | 云服系统专用 |
| BDDS | PolicyPublicDetailsBddsView | 保单大师系统 |
| 即展TOA | PolicyPublicDetailsJZView | 即展团队专用 |

---

## 2. 数据模型

### 2.1 PolicyPublicDetails 聚合表

**表名**: `policy_public_details`

此表是保单的聚合视图表，包含来自多个表的核心字段，用于快速查询。

#### 核心字段

```java
// PolicyPublicDetailsDo / PolicyPublicDetailsDto

// 基本信息
applyFormId             // 投保单ID（主键，内部唯一）
proposalType            // 交易类型：1=新契约, 2=续保
contNo                  // 保单号（保司侧）
prtNo                   // 投保单号（保司侧）
policyDomainType        // 保单领域类型（1=寿险，2=非车）

// 产品信息
innerProductCode        // 内部产品编码
innerProductName        // 内部产品名称
productCode             // 保司产品编码
insuranceCompanyCode    // 保险公司编码
insuranceCompanyName    // 保险公司名称

// 保单状态
proposalStatusFirst     // 一级状态（前端展示用）
proposalDescFirst       // 一级状态描述
proposalStatusSecondary // 二级状态
proposalDescSecondary   // 二级状态描述

// 客户信息
appntName               // 投保人姓名
appntIdCardNo           // 投保人证件号（加密存储）
appntMobile             // 投保人手机号（加密存储）
insuredName             // 被保人姓名（多个用逗号分隔）
insuredIdCardNo         // 被保人证件号

// 保费保额
prem                    // 保费
amnt                    // 保额

// 订单信息
mainOrderNo             // 主订单号
innerOrderNo            // 子订单号
orderStatus             // 订单状态

// 核保信息
uwState                 // 核保状态
uwResult                // 核保结论
uwDate                  // 末次核保时间

// 电子化信息
receiptStatus           // 回执状态
visitStatus             // 回访状态
doubleRecordStatus      // 双录状态
singleRecordStatus      // 单录状态

// 渠道信息
channelCodeTob          // B端渠道
channelCodeToa          // A端渠道（团队）
channelNameTob          // B端渠道名称
channelNameToa          // A端渠道名称
salesmanCode            // 业务员编码
salesmanName            // 业务员姓名

// 时间信息
polApplyDate            // 投保日期
cvalidate               // 保单起期
expireDate              // 保单止期
signingDate             // 签单日期

// 续保信息
rnewApplyFormId         // 续保关联投保单ID

// 链接展示标志
getPayUrlFlag           // 获取支付链接标志
getReceiptUrlFlag       // 获取回执链接标志
getVisitUrlFlag         // 获取回访链接标志
getSingleRecordUrlFlag  // 获取单录链接标志
getContinueInsuranceUrlFlag // 获取继续投保链接标志
```

### 2.2 链接展示标志逻辑

链接展示标志用于前端判断显示哪些操作按钮：

```java
// PolicyPublicDetailsServiceImpl 中的逻辑 (288-311行)

// 继续投保外链接
// 条件：待支付/支付中 且 有效
getContinueInsuranceUrlFlag

// 获取支付链接
// 条件：待支付/支付中 且 产品支持在线支付
getPayUrlFlag

// 获取单录链接
// 条件：待单录状态
getSingleRecordUrlFlag

// 获取回执链接
// 条件1：保单状态为已生效
// 条件2：回执状态为待回执/回执中
getReceiptUrlFlag

// 获取回访链接
// 条件1：保单状态为已生效
// 条件2：回访状态为待回访/回访中
getVisitUrlFlag
```

---

## 3. API 接口

### 3.1 Dubbo RPC 接口

**接口**: `PolicyPublicApi.java`

```java
public interface PolicyPublicApi {
    /**
     * 根据投保单ID获取全部续保保单（续期链路查询）
     * @param applyFormId 首年投保单ID
     * @return 续保链路上的所有保单
     */
    List<PolicyPublicDetailsDto> getRenewalPolicyListByApplyFormId(String applyFormId);
}
```

**实现类**: `PolicyPublicApiImpl.java`

### 3.2 REST API 接口

**Controller**: `PolicyController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /queryByLcyf | 云服查询保单列表（分页） |
| GET | /queryPolicy/info | 查询保单完整信息 |
| GET | /queryPolicy/info/simple | 查询保单基础信息 |
| GET | /queryOrder/info | 查询订单完整信息 |
| GET | /order/policy/list/simple | 查询订单关联的简化保单 |
| GET | /toa/page/policyPublic | 即展保单列表查询 |
| GET | /toa/policyPublic/export | 即展保单导出 |

### 3.3 查询参数

```java
// 支持的查询条件（BeanSearcher 动态处理）
applyFormId             // 投保单ID（精确）
contNo                  // 保单号
prtNo                   // 投保单号
innerOrderNo            // 订单号
mainOrderNo             // 主订单号
innerProductCode        // 产品编码
insuranceCompanyCode    // 保险公司
channelCodeTob          // 渠道
channelCodeToa          // 团队

// 客户信息（模糊查询）
appntName               // 投保人姓名
appntIdCardNo           // 投保人证件号
insuredName             // 被保人姓名
insuredIdCardNo         // 被保人证件号

// 状态筛选
proposalStatusFirst     // 一级状态
proposalStatusSecondary // 二级状态
orderStatus             // 订单状态

// 时间范围
polApplyDate            // 投保日期（起止）
cvalidate               // 保单起期（起止）
expireDate              // 保单止期（起止）

// 分页
pageNo                  // 页码
pageSize                // 每页条数
```

---

## 4. 核心流程

### 4.1 保单列表查询流程

```
┌─────────────────────────────────────────────────────────────────┐
│  前端查询请求（Map 参数）                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyController.queryByLcyf(Map paraMap)                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyPublicDetailsService.queryPolicyPublicByBeanSearchLcyf()│
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 按投保人/被保人查询 applyFormId 集合                   │   │
│  │    - getPolicyApplyFormIdByInsureUser() (寿险)           │   │
│  │    - getPolicyPropertyApplyFormIdByInsureUser2() (非车)  │   │
│  │ 2. 合并 applyFormId 集合（并集/交集处理）                 │   │
│  │ 3. 将 applyFormId 集合加入查询条件                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyPublicDetailsGateway.queryPolicyPublicByBeanSearchLcyf() │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 使用 BeanSearcher 框架                                   │   │
│  │ 1. 读取 @SearchBean 注解配置                             │   │
│  │ 2. 动态组装 SQL（基于 @DbField 注解）                    │   │
│  │ 3. 应用数据权限（@BsDataTableScope）                     │   │
│  │ 4. 字段解密（@DbCryptoTable）                            │   │
│  │ 5. 执行分页查询                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 PageResult<PolicyPublicDetailsLcyfView>                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 续期链路查询流程

```
┌─────────────────────────────────────────────────────────────────┐
│  Dubbo 调用 getRenewalPolicyListByApplyFormId(applyFormId)      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyPublicApiImpl 实现                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ List<PolicyPublicDetailsDto> result = new ArrayList<>(); │   │
│  │ Set<String> visitedApplyFormIds = new HashSet<>();       │   │
│  │ String currentApplyFormId = applyFormId;                 │   │
│  │ int depth = 0;                                           │   │
│  │ final int MAX_DEPTH = 100;                               │   │
│  │                                                          │   │
│  │ while (currentApplyFormId != null && depth < MAX_DEPTH) {│   │
│  │     // 防环路检查                                         │   │
│  │     if (visitedApplyFormIds.contains(currentApplyFormId))│   │
│  │         break;                                           │   │
│  │     visitedApplyFormIds.add(currentApplyFormId);         │   │
│  │                                                          │   │
│  │     // 查询当前保单                                       │   │
│  │     PolicyPublicDetailsDto dto = getByApplyFormId();     │   │
│  │     if (dto == null) break;                              │   │
│  │                                                          │   │
│  │     result.add(dto);                                     │   │
│  │                                                          │   │
│  │     // 获取下一个续保的 applyFormId                       │   │
│  │     currentApplyFormId = dto.getRnewApplyFormId();       │   │
│  │     depth++;                                             │   │
│  │ }                                                        │   │
│  │                                                          │   │
│  │ return result;                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 List<PolicyPublicDetailsDto>                               │
│  [首年保单] → [第二年续保] → [第三年续保] → ...                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 按客户信息查询保单流程

```
┌─────────────────────────────────────────────────────────────────┐
│  查询条件：appntName=张三, insuredIdCardNo=110xxx               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  getPolicyApplyFormIdByInsureUser()                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 1: 按投保人查询                                      │   │
│  │   SELECT DISTINCT apply_form_id                          │   │
│  │   FROM policy_applicant_details                          │   │
│  │   WHERE appnt_name = '张三'                               │   │
│  │   → 得到 Set<String> appntApplyFormIds                   │   │
│  │                                                          │   │
│  │ Step 2: 按被保人查询                                      │   │
│  │   SELECT DISTINCT apply_form_id                          │   │
│  │   FROM policy_insured_details                            │   │
│  │   WHERE id_card_no = '110xxx'                            │   │
│  │   → 得到 Set<String> insuredApplyFormIds                 │   │
│  │                                                          │   │
│  │ Step 3: 取交集                                            │   │
│  │   appntApplyFormIds.retainAll(insuredApplyFormIds)       │   │
│  │   → 得到同时满足条件的 applyFormId 集合                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  将 applyFormId 集合作为 IN 条件查询 policy_public_details       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 PolicyPublicDetails 数据同步

```
保单创建/更新
    ↓
PolicyDetailsServiceImpl.create() / modifyByApplyFormId()
    ↓
同步更新 PolicyPublicDetails
    ├── applyFormId (关联主键)
    ├── contNo, prtNo (保单号)
    ├── innerProductCode, innerProductName (产品信息)
    ├── appntName (投保人，从 applicant_details 获取)
    ├── insuredName (被保人，从 insured_details 获取，逗号拼接)
    ├── proposalStatusFirst/Secondary (状态)
    ├── channelCodeTob/Toa (渠道)
    └── ... (其他字段)
```

### 5.2 被保人名称处理

```java
// 多被保人时的处理逻辑
// PolicyPublicDetailsServiceImpl.subFirstInsuredName()

String insuredName = "张三,李四,王五";

// 提取第一个被保人
String firstInsuredName = insuredName.split(",")[0]; // 张三

// 用于列表展示，详情页展示全部
```

### 5.3 数据权限应用

```java
// View 类上的注解
@SearchBean(
    tables = "policy_public_details t",
    orderBy = "t.pol_apply_date desc",
    where = "t.deleted = 0 :lcyfPolicyPublicWhereSql:",
    autoMapTo = "t"
)
@BsDataTableScope  // 自动应用表级数据权限
public class PolicyPublicDetailsLcyfView {
    // ...
}

// 数据权限会根据当前用户的角色/渠道自动添加 WHERE 条件
// 如：WHERE channel_code_tob IN ('xxx', 'yyy')
```

---

## 6. 开发注意事项

### 6.1 BeanSearcher 查询注意事项

```java
// View 类字段映射
@DbField("t.apply_form_id")
private String applyFormId;

@DbField("t.cont_no")
private String contNo;

// 注意事项：
// 1. @DbField 必须指定表别名
// 2. 字段名需与 Map 参数名一致
// 3. 支持的操作符通过参数后缀指定：
//    - contNo_eq=xxx (等于)
//    - contNo_lk=xxx (LIKE)
//    - polApplyDate_ge=2026-01-01 (大于等于)
//    - polApplyDate_le=2026-12-31 (小于等于)
```

### 6.2 多表关联查询优化

当按客户信息查询时，避免直接 JOIN 大表：
1. 先按客户条件查询 applyFormId 集合
2. 再用 IN 条件查询 policy_public_details
3. 控制 IN 条件的数量（如超过1000个分批查询）

### 6.3 续期链路查询防护

```java
// 防止环路
Set<String> visitedApplyFormIds = new HashSet<>();
if (visitedApplyFormIds.contains(currentApplyFormId)) {
    break; // 已访问过，说明存在环路
}

// 防止无限循环
final int MAX_DEPTH = 100;
if (depth >= MAX_DEPTH) {
    log.warn("续期链路超过最大深度限制: {}", applyFormId);
    break;
}
```

### 6.4 数据加密处理

```java
// Entity 字段加密存储
@TableField(typeHandler = CryptoTypeHandler.class)
private String appntIdCardNo;

@TableField(typeHandler = CryptoTypeHandler.class)
private String appntMobile;

// 查询时自动解密
// 插入时自动加密
// 注意：模糊查询需先加密再查询
```

### 6.5 链接标志更新时机

链接标志需在以下时机更新：
1. 保单状态变更时
2. 电子化状态变更时（回执/回访/双录/单录）
3. 订单状态变更时（支付成功/失败）

```java
// PolicyPublicApplicationServiceImpl.modifyWhenPolicyStatusChange()
// 统一在此处理链接标志的更新逻辑
```

### 6.6 导出数据量限制

导出时注意：
- 限制最大导出条数（如10000条）
- 使用流式写入避免内存溢出
- 异步导出大数据量场景

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| API接口 | `api/api/PolicyPublicApi.java` |
| RPC实现 | `adapter/rpc/PolicyPublicApiImpl.java` |
| Controller | `adapter/web/policy/PolicyController.java` |
| Service | `biz/service/IPolicyPublicDetailsService.java` |
| ServiceImpl | `biz/service/impl/PolicyPublicDetailsServiceImpl.java` |
| AppService | `biz/application/impl/PolicyPublicApplicationServiceImpl.java` |
| Gateway | `biz/infrastructure/gateway/PolicyPublicDetailsGateway.java` |
| Entity | `biz/infrastructure/entity/PolicyPublicDetailsDo.java` |
| Dto | `common-dto/dto/policy/PolicyPublicDetailsDto.java` |
| CX View | `biz/infrastructure/view/PolicyPublicDetailsCXView.java` |
| Lcyf View | `biz/infrastructure/view/PolicyPublicDetailsLcyfView.java` |
| BDDS View | `biz/infrastructure/view/PolicyPublicDetailsBddsView.java` |
| JZ View | `biz/infrastructure/view/PolicyPublicDetailsJZView.java` |
| Assembler | `biz/infrastructure/assembler/PolicyPublicDetailsAssembler.java` |

---

## 8. 扩展开发指引

### 8.1 新增系统视图

若需为新系统添加专用视图：

1. **创建 View 类**
   ```java
   @SearchBean(
       tables = "policy_public_details t",
       where = "t.deleted = 0 :newSystemWhereSql:",
       autoMapTo = "t"
   )
   @BsDataTableScope
   public class PolicyPublicDetailsNewSystemView {
       // 定义需要展示的字段
   }
   ```

2. **Gateway 添加方法**
   ```java
   public PageResult<PolicyPublicDetailsNewSystemView> queryByNewSystem(Map<String, Object> paraMap) {
       return searchPage(PolicyPublicDetailsNewSystemView.class, paraMap);
   }
   ```

3. **Service 添加方法**
   ```java
   PageResult<PolicyPublicDetailsNewSystemView> queryByNewSystem(Map<String, Object> paraMap);
   ```

4. **Controller 添加接口**
   ```java
   @GetMapping("/queryByNewSystem")
   public PageResult<PolicyPublicDetailsNewSystemView> queryByNewSystem(@RequestParam Map<String, Object> paraMap) {
       return service.queryByNewSystem(paraMap);
   }
   ```

### 8.2 新增查询维度

1. **修改 View 类**
   - 添加 `@DbField` 字段

2. **添加索引**
   - 在 `policy_public_details` 表添加索引

3. **修改 Service**（如需特殊处理）
   - 在 `queryPolicyPublicByBeanSearchXxx()` 添加逻辑

### 8.3 新增链接类型

1. **修改 Dto/Entity**
   - 添加 `getXxxUrlFlag` 字段

2. **修改状态更新逻辑**
   - 在 `PolicyPublicApplicationServiceImpl` 添加标志更新

3. **修改前端**
   - 根据标志显示对应按钮
