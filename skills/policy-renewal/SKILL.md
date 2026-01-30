---
name: renewal
description: |
  续期订单（Renewal Order）业务管理
  
  【模块定位】多年期保单的续期缴费管理，包括续期计划、续期订单、催缴记录等。
  
  【支持的代理】
  - java-developer: 实现续期订单逻辑
  - planner: 规划续期流程
  
  【触发关键词】
  续期、续期订单、续期计划、催缴、缴费、续期扣费、续期管理
  
  【必须调用】
  Java-developer: 任务涉及"续期"、"缴费" → MUST
  Planner: 规划"续期体系"、"缴费流程" → MUST

---

# 续期订单业务模块文档

> 本文档描述 policy-module 中的续期订单（RenewalOrder）业务模块，包括续期订单、续期计划、催缴记录的管理。

## 1. 模块概述

续期订单模块负责管理多年期保单的续期缴费，包括续期计划生成、续期订单创建、催缴记录管理等。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 续期计划 | 根据保单缴费期间自动生成续期计划 |
| 续期订单 | 在续期应缴时间生成续期订单 |
| 催缴记录 | 管理续期失败后的催缴记录 |
| 续期任务单 | 处理续期异常情况 |
| 数据修正 | 支持续期数据修正和确认缴费 |

### 1.2 目录结构

```
lcyf-module-policy/
├── lcyf-module-policy-adapter/
│   ├── schedule/PolicyRenewalPayPlanSchedule.java  # 定时任务
│   ├── web/renewalOrder/
│   │   ├── RenewalPayOrderInfoController.java      # 续期订单API
│   │   ├── RenewalPayPlanController.java           # 续期计划API
│   │   ├── RenewalDemandInfoController.java        # 催缴记录API
│   │   └── RenewalTaskOrderInfoController.java     # 续期任务单API
│   └── rpc/RenewalPayApiImpl.java                  # RPC实现
└── lcyf-module-policy-biz/
    ├── service/renewalOrder/
    │   ├── IRenewalPayOrderInfoService.java        # 续期订单服务
    │   ├── IRenewalPayPlanService.java             # 续期计划服务
    │   ├── IRenewalDemandInfoService.java          # 催缴记录服务
    │   └── IRenewalTaskOrderInfoService.java       # 续期任务单服务
    ├── service/policy/
    │   └── IPolicyRenewalPayApplicationService.java # 续期应用服务
    └── infrastructure/
        ├── entity/renewalOrder/
        │   ├── RenewalPayOrderInfoDo.java          # 续期订单实体
        │   ├── RenewalPayPlanDo.java               # 续期计划实体
        │   ├── RenewalDemandInfoDo.java            # 催缴记录实体
        │   └── RenewalTaskOrderInfoDo.java         # 续期任务单实体
        ├── gateway/renewalOrder/
        │   ├── RenewalPayOrderInfoGateway.java
        │   ├── RenewalPayPlanGateway.java
        │   ├── RenewalDemandInfoGateway.java
        │   └── RenewalTaskOrderInfoGateway.java
        └── mapper/
            ├── RenewalPayOrderInfoMapper.java
            ├── RenewalPayPlanMapper.java
            └── RenewalDemandInfoMapper.java
```

---

## 2. 数据模型

### 2.1 续期订单表（policy_renewal_pay_order_info）

| 字段分类 | 主要字段 | 说明 |
|---------|--------|------|
| **订单标识** | main_order_no | 主订单号 |
| | renewal_order_no | 续期订单号 |
| | cont_no | 保单号 |
| | apply_form_id | 投保单ID |
| **产品信息** | inner_product_code/name | 内部产品编码/名称 |
| | insurance_company_code/name | 保司信息 |
| | filings_code/name | 主险备案编号/名称 |
| **保单状态** | proposal_status_first | 保单一级状态 |
| | proposal_status_secondary | 保单二级状态 |
| | renewal_status | 续期状态 |
| **缴费信息** | pay_intv | 缴费频率（年/半年/季/月） |
| | pay_end_year/flag | 缴费期间及单位 |
| | renewal_due_prem | 客户续期应缴保费 |
| | renewal_prem | 续期实缴保费 |
| | standard_prem | 标准保费 |
| **时间信息** | renewal_due_time | 续期应缴时间 |
| | grace_end_time | 宽限期满日 |
| | renewal_pay_time | 续期实缴时间 |
| | renewal_pay_end_time | 续期扣费截止日 |
| **期数信息** | renewal_count | 当期期数 |
| | total_count | 总期数 |
| | is_finish_next_order_generate | 是否完成下期续期订单生成 |
| **快照** | policy_details_snapshot | 保单快照（JSON） |

### 2.2 续期计划表（policy_renewal_pay_plan）

| 字段 | 说明 |
|------|------|
| main_order_no | 主订单号 |
| renewal_order_no | 续期单号 |
| apply_form_id | 投保单ID |
| cont_no | 保单号 |
| renewal_count | 续期期数 |
| pay_intv | 缴费频率 |
| pay_end_year/flag | 缴费期间 |
| renewal_due_time | 应缴时间 |
| grace_end_time | 宽限期满日 |
| renewal_due_prem | 应缴保费 |
| renewal_prem | 实缴保费 |
| renewal_status | 续期状态 |
| pay_status | 缴费状态 |
| renewal_plan_status | 续期计划状态 |
| c_ratio_receiva_prem | 继续率应收保费 |

### 2.3 催缴记录表（policy_renewal_demand_info）

| 字段 | 说明 |
|------|------|
| main_order_no | 主订单号 |
| renewal_order_no | 续期订单号 |
| cont_no | 保单号 |
| apply_form_id | 投保单ID |
| renewal_count | 续期期数 |
| demand_name | 催缴人 |
| demand_time | 催缴时间 |
| demand_text | 催缴内容 |
| demand_status | 催缴结果 |

### 2.4 续期任务单表（policy_renewal_task_order_info）

| 字段 | 说明 |
|------|------|
| cont_no | 保单号 |
| renewal_order_no | 续期订单号 |
| task_order_no | 续期任务单号 |
| status | 状态（N=待处理，Y=已处理） |
| error_time | 异常时间 |
| handler_time | 处理时间 |
| handler_user_code/name | 处理人信息 |
| source_details | 处理前明细（JSON） |
| target_details | 处理后明细（JSON） |

### 2.5 核心枚举

#### 续期状态

```java
// RenewalPayStatusEnum
WAIT_DEDUCTION("WAIT_DEDUCTION", "待扣费"),
RENEWAL_SUCCESS("RENEWAL_SUCCESS", "续期成功"),
RENEWAL_FAIL("RENEWAL_FAIL", "续期失败")
```

#### 续期计划状态

```java
// RenewalPayPlanStatusEnum
EFFECTIVE("EFFECTIVE", "有效"),
INVALID("INVALID", "无效")
```

---

## 3. API 接口

### 3.1 续期订单接口

**基础路径**: `/api/v1/policy/auth/renewalPayOrderInfo`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /page | 分页查询续期订单 |
| GET | /{id} | 获取续期订单详情 |
| POST | /update/correct | 数据修正 |
| POST | /confirmPayment | 确认缴费 |
| POST | /import | 导入续期订单 |
| GET | /export | 导出续期订单 |

### 3.2 续期计划接口

**基础路径**: `/api/v1/policy/auth/renewalPayPlan`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /page | 分页查询续期计划 |
| GET | /{id} | 获取续期计划详情 |

### 3.3 催缴记录接口

**基础路径**: `/api/v1/policy/auth/renewalDemandInfo`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /page | 分页查询催缴记录 |
| POST | /import | 导入催缴记录 |
| GET | /downloadImportTemplate | 下载导入模板 |
| GET | /export | 导出催缴记录 |

### 3.4 续期任务单接口

**基础路径**: `/api/v1/policy/auth/renewalTaskOrderInfo`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /page | 分页查询任务单 |
| POST | /handle | 处理任务单 |
| GET | /statusCount | 状态统计 |

---

## 4. 核心流程

### 4.1 续期计划生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│  定时任务触发 PolicyRenewalPayPlanSchedule                       │
│  @XxlJob("policyRenewalPayPlanGenerateSchedule")                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyRenewalPayApplicationService                            │
│  .generatePolicyRenewalPayPlan(currentSystemTime)               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询待生成续期计划的保单                              │   │
│  │    - 保单状态：生效或待生效                              │   │
│  │    - 缴费期间 > 1 年                                    │   │
│  │ 2. 验证保单状态和缴费期限                                │   │
│  │ 3. 计算续期期数和应缴时间                                │   │
│  │    - 根据 pay_intv 计算期数                             │   │
│  │    - 计算每期应缴时间                                   │   │
│  │ 4. 根据产品配置生成续期计划列表                          │   │
│  │ 5. 批量保存到 policy_renewal_pay_plan                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 续期订单生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│  定时任务触发（根据缴费频率）                                     │
│  - 年缴: policyRenewalPayOrderYearGenerateSchedule              │
│  - 月缴: policyRenewalPayOrderMonthGenerateSchedule             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IPolicyRenewalPayApplicationService                            │
│  .generatePolicyRenewalPayOrderTo*(currentSystemTime)           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询待生成续期订单的续期计划                          │   │
│  │    - renewal_plan_status = EFFECTIVE                    │   │
│  │    - renewal_due_time <= 当前时间 + 提前天数            │   │
│  │ 2. 生成续期订单号                                       │   │
│  │    格式: RO + yyyyMMdd + 雪花ID后6位                    │   │
│  │ 3. 创建续期订单记录                                     │   │
│  │    - renewal_status = WAIT_DEDUCTION（待扣费）          │   │
│  │ 4. 保存保单快照到 policy_details_snapshot               │   │
│  │ 5. 批量保存到 policy_renewal_pay_order_info             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 续期扣费流程

```
┌─────────────────────────────────────────────────────────────────┐
│  续期订单状态：WAIT_DEDUCTION（待扣费）                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  扣费任务触发                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 调用扣费接口                                          │   │
│  │ 2. 扣费结果处理                                          │   │
│  │    ├── 成功 → renewal_status = RENEWAL_SUCCESS          │   │
│  │    │        → 更新 renewal_prem, renewal_pay_time       │   │
│  │    │        → 触发下期续期订单生成                       │   │
│  │    │                                                    │   │
│  │    └── 失败 → renewal_status = RENEWAL_FAIL             │   │
│  │             → 进入催缴流程                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 催缴流程

```
┌─────────────────────────────────────────────────────────────────┐
│  续期订单失败（renewal_status = RENEWAL_FAIL）                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  导入催缴记录 /renewalDemandInfo/import                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 上传催缴 Excel 文件                                   │   │
│  │ 2. 文件校验                                              │   │
│  │    - 验证保单存在性                                      │   │
│  │    - 验证续期计划有效                                    │   │
│  │    - 验证催缴状态合法                                    │   │
│  │ 3. 调用 Dubbo 获取用户信息                               │   │
│  │ 4. 异步处理                                              │   │
│  │    - 构建催缴记录对象                                    │   │
│  │    - 上传原始文件到 OSS                                  │   │
│  │    - 上传失败数据到 OSS                                  │   │
│  │    - 保存催缴记录到数据库                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  催缴后续处理                                                    │
│  - 催缴成功 → 重新扣款                                          │
│  - 催缴失败 → 保单失效/退保                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 数据修正流程

```
┌─────────────────────────────────────────────────────────────────┐
│  请求数据修正 /renewalPayOrderInfo/update/correct               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IRenewalPayOrderInfoService.correct(RenewalPayOrderCorrectCmd) │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 数据校验                                              │   │
│  │    - 续期订单存在                                        │   │
│  │    - 修正参数合法                                        │   │
│  │ 2. 修正字段                                              │   │
│  │    - 修改保费信息                                        │   │
│  │    - 修改失败原因                                        │   │
│  │ 3. 更新后续期数的计划                                    │   │
│  │    - updateFuturePlansByCorrectRenewalPrem()            │   │
│  │ 4. 记录变更日志                                          │   │
│  │    - IDataChangeRecordService.record()                  │   │
│  │ 5. 返回修正结果                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 从保单到续期计划

```
保单表 (Policy)
├─ 投保单ID → 保单号 → 保单快照
├─ 缴费频率(pay_intv)：1=月，3=季，6=半年，12=年
├─ 缴费期限(pay_end_year)
└─ 保单生效/失效时间

↓ 触发续期计划生成 ↓

续期计划表 (RenewalPayPlan)
├─ 续期期数(renewal_count)
├─ 应缴时间(renewal_due_time)
├─ 应缴保费(renewal_due_prem)
└─ 计划状态(renewal_plan_status) = EFFECTIVE
```

### 5.2 从续期计划到续期订单

```
续期计划 (renewal_plan_status = EFFECTIVE)
│
├─ 应缴时间到达 (renewal_due_time <= 当前时间 + 提前天数)
│
↓ 触发续期订单生成 ↓

续期订单 (RenewalPayOrderInfo)
├─ 续期订单号(renewal_order_no) = RO + 日期 + 雪花ID
├─ 续期状态(renewal_status) = WAIT_DEDUCTION
├─ 保单快照(policy_details_snapshot)
└─ 是否完成下期生成(is_finish_next_order_generate) = N
```

### 5.3 续期期数计算

```java
// 根据缴费频率计算总期数
int payIntv = policy.getPayIntv();      // 1=月, 3=季, 6=半年, 12=年
int payEndYear = policy.getPayEndYear(); // 缴费年限

int totalCount;
switch (payIntv) {
    case 1:  // 月缴
        totalCount = payEndYear * 12;
        break;
    case 3:  // 季缴
        totalCount = payEndYear * 4;
        break;
    case 6:  // 半年缴
        totalCount = payEndYear * 2;
        break;
    case 12: // 年缴
    default:
        totalCount = payEndYear;
        break;
}

// 第一期为首期，从第二期开始为续期
// renewal_count 从 2 开始
```

---

## 6. 定时任务配置

### 6.1 XXL-JOB 任务

| 任务名 | 触发频率 | 说明 |
|-------|---------|------|
| policyRenewalPayPlanGenerateSchedule | 每日 | 续期计划生成 |
| policyRenewalPayOrderYearGenerateSchedule | 每日 | 年缴续期订单生成 |
| policyRenewalPayOrderMonthGenerateSchedule | 每日 | 月/季/半年缴续期订单生成 |

### 6.2 任务执行逻辑

```java
@XxlJob("policyRenewalPayPlanGenerateSchedule")
public void policyRenewalPayPlanGenerateSchedule() {
    // 1. 设置租户上下文 (XBBP)
    TenantContextHolder.setTenantCode("XBBP");

    // 2. 初始化 MDC 链路追踪
    MDC.put("traceId", UUID.randomUUID().toString());

    // 3. 计算当前系统时间
    LocalDateTime currentSystemTime = LocalDateTime.now();

    // 4. 调用应用服务生成续期计划
    policyRenewalPayApplicationService
        .generatePolicyRenewalPayPlan(currentSystemTime);

    // 5. 记录执行耗时
    log.info("续期计划生成完成，耗时: {}ms", stopWatch.getTotalTimeMillis());
}
```

---

## 7. 开发注意事项

### 7.1 续期订单号生成规则

```java
// 格式: RO + yyyyMMdd + 雪花ID后6位
String renewalOrderNo = "RO" +
    LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(12);
// 示例: RO20260128123456
```

### 7.2 续期计划与续期订单的关系

- 续期计划：静态数据，保单生效时一次性生成所有期数
- 续期订单：动态数据，在应缴时间前动态生成

```
续期计划 (多条) ←──1:1──→ 续期订单 (每期一条)
```

### 7.3 宽限期处理

宽限期（grace_end_time）通常为应缴日后 60 天：
```java
LocalDateTime graceEndTime = renewalDueTime.plusDays(60);
```

宽限期内：
- 续期订单仍为待扣费状态
- 可继续尝试扣费
- 超过宽限期 → 保单失效

### 7.4 保单快照存储

续期订单创建时保存保单快照（`policy_details_snapshot`），用于：
- 记录续期时的保单状态
- 后续查询对比
- 审计追溯

### 7.5 下期续期订单生成

当前期续期成功后，触发下期生成：
```java
if (renewalStatus == RENEWAL_SUCCESS) {
    // 标记当前订单
    renewalOrder.setIsFinishNextOrderGenerate("Y");

    // 如果未到最后一期，生成下期订单
    if (renewalCount < totalCount) {
        generateNextRenewalOrder(renewalOrder);
    }
}
```

### 7.6 数据修正级联更新

修正当前期保费时，需同步更新后续期数的计划：
```java
renewalPayPlanGateway.updateFuturePlansByCorrectRenewalPrem(
    applyFormId,
    currentRenewalCount,
    newRenewalPrem
);
```

---

## 8. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| 订单Controller | `adapter/web/renewalOrder/RenewalPayOrderInfoController.java` |
| 计划Controller | `adapter/web/renewalOrder/RenewalPayPlanController.java` |
| 催缴Controller | `adapter/web/renewalOrder/RenewalDemandInfoController.java` |
| 任务单Controller | `adapter/web/renewalOrder/RenewalTaskOrderInfoController.java` |
| 定时任务 | `adapter/schedule/PolicyRenewalPayPlanSchedule.java` |
| 订单Service | `biz/service/renewalOrder/IRenewalPayOrderInfoService.java` |
| 订单ServiceImpl | `biz/service/impl/renewalOrder/RenewalPayOrderInfoServiceImpl.java` |
| 计划Service | `biz/service/renewalOrder/IRenewalPayPlanService.java` |
| 催缴Service | `biz/service/renewalOrder/IRenewalDemandInfoService.java` |
| 应用Service | `biz/service/policy/IPolicyRenewalPayApplicationService.java` |
| 应用ServiceImpl | `biz/service/impl/policy/PolicyRenewalPayApplicationServiceImpl.java` |
| 订单Gateway | `biz/infrastructure/gateway/renewalOrder/RenewalPayOrderInfoGateway.java` |
| 计划Gateway | `biz/infrastructure/gateway/renewalOrder/RenewalPayPlanGateway.java` |
| 催缴Gateway | `biz/infrastructure/gateway/renewalOrder/RenewalDemandInfoGateway.java` |
| 订单Entity | `biz/infrastructure/entity/renewalOrder/RenewalPayOrderInfoDo.java` |
| 计划Entity | `biz/infrastructure/entity/renewalOrder/RenewalPayPlanDo.java` |
| 催缴Entity | `biz/infrastructure/entity/renewalOrder/RenewalDemandInfoDo.java` |
| 订单Mapper | `biz/infrastructure/mapper/RenewalPayOrderInfoMapper.java` |
| 计划Mapper | `biz/infrastructure/mapper/RenewalPayPlanMapper.java` |
| CX View | `biz/infrastructure/view/renewalOrder/renewalPay/RenewalPayCXView.java` |
| Lcyf View | `biz/infrastructure/view/renewalOrder/renewalPay/RenewalPayLcyfView.java` |
| RPC实现 | `adapter/rpc/RenewalPayApiImpl.java` |
| Dto | `api/pojo/dto/renewalOrder/RenewalPayOrderInfoDto.java` |
| Cmd | `api/pojo/cmd/renewalOrder/RenewalPayOrderCorrectCmd.java` |

---

## 9. 扩展开发指引

### 9.1 新增续期状态

1. **添加枚举值**
   - `RenewalPayStatusEnum` 添加新状态

2. **修改状态流转逻辑**
   - `RenewalPayOrderInfoServiceImpl` 添加状态处理

3. **修改查询条件**
   - View 类添加状态筛选

### 9.2 新增催缴渠道

1. **添加催缴方式枚举**
   - `RenewalDemandChannelEnum` 添加渠道

2. **实现催缴逻辑**
   - `RenewalDemandInfoServiceImpl` 添加渠道处理

3. **修改导入模板**
   - 添加渠道字段

### 9.3 自定义续期计划生成规则

1. **配置产品续期参数**
   - 通过产品配置设置提前天数、宽限期等

2. **修改生成逻辑**
   - `PolicyRenewalPayApplicationServiceImpl` 读取产品配置

3. **扩展计划字段**
   - 添加产品特有的续期参数
