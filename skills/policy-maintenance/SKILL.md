---
name: maintenance
description: |
  保全（Maintenance）业务管理
  
  【模块定位】保单生效后的各类变更操作管理，包括退保、批改、信息变更、贷款还款等。
  
  【支持的代理】
  - java-developer: 实现保全业务逻辑
  - planner: 规划保全流程
  - architect: 系统设计
  
  【触发关键词】
  保全、退保、批改、保单变更、信息变更、保全操作、保全流程
  
  【必须调用】
  Java-developer: 任务涉及"保全操作"、"保全处理" → MUST
  Planner: 规划"保全流程"、"保全体系" → MUST

---

# 保全业务模块文档

> 本文档描述 policy-module 中的保全（Maintenance）业务模块，包括保全录入、查询和处理流程。

## 1. 模块概述

保全业务模块负责处理保单生效后的各类变更操作，包括退保、批改、信息变更、贷款还款等。

### 1.1 核心功能

| 功能 | 描述 |
|------|------|
| 保全录入 | 支持多种保全类型的录入（前端/MQ） |
| 保全查询 | 分页查询、详情查询 |
| 保全处理 | 定时任务批量处理生效的保全 |
| MQ同步 | 接收云服系统保全数据同步 |
| 异常处理 | 异常保全进入任务表，支持重试 |

### 1.2 目录结构

```
lcyf-module-policy/
├── lcyf-module-policy-adapter/
│   ├── mq/comsumer/MaintenanceConsumer.java      # MQ消费者
│   ├── web/maintenance/MaintenanceController.java # REST API
│   └── rpc/PolicyMaintenanceApiImpl.java          # RPC实现
└── lcyf-module-policy-biz/
    ├── application/maintenance/
    │   ├── IMaintenanceAppService.java            # 应用服务接口
    │   └── impl/MaintenanceInnerServiceImpl.java  # 内部服务实现
    ├── service/maintenance/
    │   ├── IMaintenanceService.java               # 核心服务接口
    │   └── impl/MaintenanceServiceImpl.java       # 服务实现
    └── infrastructure/
        ├── entity/MaintenanceDo.java              # 主表实体
        ├── entity/MaintenanceDetailsDo.java       # 明细表实体
        ├── entity/MaintenanceTaskDo.java          # 异常任务表
        ├── gateway/MaintenanceGateway.java        # 数据访问
        └── mapper/MaintenanceMapper.java          # Mapper
```

---

## 2. 数据模型

### 2.1 数据库表结构

#### 主表：policy_maintenance

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| inner_maintenance_no | varchar(64) | 保全订单号（内部唯一） |
| maintenance_no | varchar(64) | 保司保全单号 |
| lcyf_maintenance_id | varchar(64) | 云服保全流水号（外部唯一标识） |
| apply_form_id | varchar(64) | 投保单ID |
| cont_no | varchar(64) | 保单号 |
| inner_order_no | varchar(64) | 子订单号 |
| main_order_no | varchar(64) | 主订单号 |
| maintenance_action_code | varchar(32) | 保全操作类型编码 |
| maintenance_project_code | varchar(32) | 保全项目编码（一级分类） |
| maintenance_type_code | varchar(32) | 保全类型编码（二级分类） |
| status | varchar(16) | 保全状态 |
| process_flag | varchar(8) | 处理标志（1=未处理，2=已处理） |
| effect_time | datetime | 保全生效时间 |
| accept_time | datetime | 受理时间 |
| apply_time | datetime | 申请时间 |
| involve_pay_type | varchar(8) | 是否涉及收退费 |
| charge_amount | decimal(18,2) | 收退费金额 |
| source_system | varchar(32) | 来源系统 |
| source_line | varchar(16) | 来源线（ON_LINE/OFF_LINE） |
| policy_domain_type | varchar(8) | 保单领域类型（1=寿险，2=非车险） |
| version | int | MQ消息版本（用于版本控制） |

#### 明细表：policy_maintenance_details

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| inner_maintenance_no | varchar(64) | 保全订单号 |
| maintenance_details | json | 保全变更内容（JSON格式，类型特定） |
| policy_details_snapshot | json | 保单变更前快照 |
| remark | varchar(500) | 备注 |

#### 异常任务表：policy_maintenance_task

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| inner_maintenance_no | varchar(64) | 保全订单号 |
| error_code | varchar(32) | 错误码 |
| error_msg | text | 错误信息 |
| retry_count | int | 重试次数 |
| status | varchar(16) | 任务状态 |

### 2.2 核心枚举

#### 保全项目（一级分类）

```java
// MaintenanceProjectEnum
POLICY_STATUS("POLICY_STATUS", "保单状态变更"),
CUSTOMER_INFO("CUSTOMER_INFO", "客户信息变更"),
PRODUCT_INFO("PRODUCT_INFO", "产品信息变更"),
RIGHTS("RIGHTS", "权益变更"),
OTHER("OTHER", "其他")
```

#### 保全类型（二级分类）

```java
// MaintenanceTypeEnum - 退保类
SURRENDER_HESITATE("SURRENDER_HESITATE", "犹豫期退保"),
CANCEL_BEFORE_EFFECTIVE("CANCEL_BEFORE_EFFECTIVE", "生效前撤单"),
SURRENDER_TERMINATION("SURRENDER_TERMINATION", "退保终止"),
COMPANY_UNDO("COMPANY_UNDO", "公司解约"),
SURRENDER_CONTRACT("SURRENDER_CONTRACT", "协议退保"),
RISK_SURRENDER("RISK_SURRENDER", "险种退保"),

// 理赔类
CLAIMS_EXEMPTION("CLAIMS_EXEMPTION", "理赔豁免"),

// 续期类
RENEWAL_RETURN("RENEWAL_RETURN", "续期回退"),

// 撤销类
MAINTENANCE_REVOKE("MAINTENANCE_REVOKE", "保全撤销"),

// 客户变更类
APPLICANT_CHANGE_INFO("APPLICANT_CHANGE_INFO", "投保人变更"),
INSURED_CHANGE_INFO("INSURED_CHANGE_INFO", "被保人变更"),
BENEFICIARY_CHANGE_INFO("BENEFICIARY_CHANGE_INFO", "受益人变更"),
RENEWAL_ACCOUNT_CHANGE_INFO("RENEWAL_ACCOUNT_CHANGE_INFO", "续期账户变更"),
ADD_SECOND_APPLICANT_CHANGE_INFO("ADD_SECOND_APPLICANT_CHANGE_INFO", "新增第二投保人"),

// 产品变更类
ADD_RISK("ADD_RISK", "新增险种"),
ADD_AMOUNT("ADD_AMOUNT", "增加保额"),
REDUCE_AMOUNT("REDUCE_AMOUNT", "减少保额"),

// 贷款类
LOAN("LOAN", "保单贷款"),
REPAYMENT("REPAYMENT", "保单还款"),
AGREEMENT_COMPENSATE("AGREEMENT_COMPENSATE", "协议赔偿"),

// 批改类
POLICY_CORRECT("POLICY_CORRECT", "保单批改")
```

#### 保全状态

```java
// MaintenanceStatusEnum
EFFECTIVE("EFFECTIVE", "已生效"),
ACCEPT_SUCCESS("ACCEPT_SUCCESS", "受理成功"),
WAIT_TO_AUDIT("WAIT_TO_AUDIT", "待审核"),
AUDITING("AUDITING", "审核中"),
AUDIT_NOT_PASS("AUDIT_NOT_PASS", "审核不通过"),
INVALID("INVALID", "作废")
```

#### 处理标志

```java
// MaintenanceProcessFlagEnum
UN_PROCESS("1", "未处理"),
PROCESS_SUCCESS("2", "处理成功"),
PROCESS_FAIL("3", "处理失败")
```

---

## 3. API 接口

### 3.1 保全录入接口

**基础路径**: `/api/v1/policy/auth/maintenance/action`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /surrender/add | 新增退保 |
| POST | /exemption/add | 新增理赔豁免 |
| POST | /termination/add | 新增理赔终止 |
| POST | /renewalReturn/add | 新增续期回退 |
| POST | /revoke/add | 新增撤销 |
| POST | /changeInfo/add | 新增客户信息变更 |
| POST | /addRisk/add | 新增险种 |
| POST | /changeAmount/add | 新增加减保额 |
| POST | /reducePayAll/add | 新增减额缴清 |
| POST | /payIntv/add | 新增缴费频率变更 |
| POST | /bonusGetChange/add | 新增分红/年金变更 |
| POST | /reinstatement/add | 新增保单复效 |
| POST | /loan/add | 新增保单贷款 |
| POST | /repay/add | 新增保单还款 |
| POST | /compensate/add | 新增协议补偿 |
| POST | /payEndYear/add | 新增缴费期间变更 |
| POST | /policyCorrect/add | 新增保单批改 |

### 3.2 保全查询接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /maintenance/page | 分页查询保全 |
| GET | /maintenance/lcyf/policyCorrect/page | 渠道保单批改分页 |
| GET | /action/{type}/get | 查询保全详情 |

### 3.3 内部处理接口

**Controller**: `MaintenanceInnerController.java`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /inner/maintenance/startProcess | 定时批量处理保全 |
| GET | /inner/maintenance/processRenewal/{no} | 处理指定保全单 |

---

## 4. 核心流程

### 4.1 保全录入流程（前端）

```
┌─────────────────────────────────────────────────────────────────┐
│  前端提交 MaintenanceActionCmd<T>                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │ POST /action/{type}/add
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MaintenanceController.createAction*()                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IMaintenanceAppService.createAction*()                         │
│  - 业务校验和数据组装                                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IMaintenanceService.create()                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. validCommonMaintenanceParam() 验证基础参数            │   │
│  │ 2. 查询对应保单（寿险/非车险）                            │   │
│  │ 3. 查询订单信息 PolicyOrderDetailsDto                    │   │
│  │ 4. 生成保全订单号 innerMaintenanceNo                     │   │
│  │ 5. maintenanceGateway.save() 保存主表                    │   │
│  │ 6. maintenanceDetailsGateway.save() 保存明细表           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回 innerMaintenanceNo                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 MQ 同步流程（MaintenanceConsumer）

```
┌─────────────────────────────────────────────────────────────────┐
│  云服系统发送 MQ 消息                                            │
│  Topic: topic%saas_sync_data_maintenance                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MaintenanceConsumer.saasSyncDataMaintenanceConsumer()          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 开关检查                                              │   │
│  │    if (!"new".equals(maintenanceSwitch)) return;        │   │
│  │                                                          │   │
│  │ 2. 解析消息                                              │   │
│  │    MaintenanceSyncCmd<JSONObject> cmd = 解析保全同步命令  │   │
│  │                                                          │   │
│  │ 3. 数据补充                                              │   │
│  │    fillInfo(cmd); // 补充applyFormId等缺失字段           │   │
│  │                                                          │   │
│  │ 4. 数据校验                                              │   │
│  │    ValidationUtils.validate(cmd);                        │   │
│  │                                                          │   │
│  │ 5. 版本控制检查（防止旧数据覆盖新数据）                   │   │
│  │    if (dataSyncCheck(record)) {                          │   │
│  │        replyMsg("版本号过低,无需处理");                   │   │
│  │        return;                                           │   │
│  │    }                                                     │   │
│  │                                                          │   │
│  │ 6. Redis分布式锁防重复消费                               │   │
│  │    key: sync_maintenance:{orderSn}:{sourceSystem}        │   │
│  │    expire: 15秒                                          │   │
│  │    if (!trySetValue) { log.error("重复消费"); return; }  │   │
│  │                                                          │   │
│  │ 7. 创建保全                                              │   │
│  │    innerMaintenanceNo = maintenanceInnerService          │   │
│  │        .createInner(cmd);                                │   │
│  │                                                          │   │
│  │ 8. 处理保全                                              │   │
│  │    context = maintenanceService                          │   │
│  │        .processMaintenance(innerMaintenanceNo);          │   │
│  │                                                          │   │
│  │ 9. 发送回执（如需要）                                    │   │
│  │    if (payload.isReply()) {                              │   │
│  │        replyMsg(orderSn, "保全更新成功");                 │   │
│  │    }                                                     │   │
│  │                                                          │   │
│  │ 10. 财务订单通知（仅TOA渠道）                            │   │
│  │    if (context != null && isToa(policy)) {               │   │
│  │        noticeFinanceOrder(context);                      │   │
│  │    }                                                     │   │
│  │                                                          │   │
│  │ 11. 记录MQ消费结果                                       │   │
│  │    rockRecordService.create(rocketMqRecord);             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 保全处理流程（processMaintenance）

```
┌─────────────────────────────────────────────────────────────────┐
│  触发条件：                                                      │
│  1. MQ同步后立即调用                                            │
│  2. 定时任务 /inner/maintenance/startProcess                    │
│  3. 手动调用 /inner/maintenance/processRenewal/{no}             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MaintenanceServiceImpl.processMaintenance(innerMaintenanceNo)  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询保全记录                                          │   │
│  │    MaintenanceDto maintenance = get(innerMaintenanceNo); │   │
│  │                                                          │   │
│  │ 2. 状态检查（判断是否需要处理）                          │   │
│  │    - status=EFFECTIVE && processFlag=UN_PROCESS → 处理   │   │
│  │    - status=ACCEPT_SUCCESS && now>=effectTime → 处理     │   │
│  │    - 其他情况 → 跳过                                      │   │
│  │                                                          │   │
│  │ 3. 获取关联保单                                          │   │
│  │    PolicyDetailsDto policy = policyService               │   │
│  │        .getPolicy(applyFormId);                          │   │
│  │                                                          │   │
│  │ 4. 执行保全变更逻辑                                      │   │
│  │    maintenanceActionSelector                             │   │
│  │        .saveStandard(maintenanceTypeCode, context);      │   │
│  │                                                          │   │
│  │ 5. 更新保单                                              │   │
│  │    policyService.createOrModifyPolicy(newPolicy);        │   │
│  │                                                          │   │
│  │ 6. 更新保全状态                                          │   │
│  │    maintenance.setStatus(EFFECTIVE);                     │   │
│  │    maintenance.setProcessFlag(PROCESS_SUCCESS);          │   │
│  │                                                          │   │
│  │ 7. 事务提交后异步处理                                    │   │
│  │    TransactionSynchronization.afterCommit(() -> {        │   │
│  │        // 发送财务订单消息                               │   │
│  │        policySupplier.supplierSurrenderMsg(financeOrder);│   │
│  │        // 同步保单状态                                   │   │
│  │        policySupplier.syncPolicyStatus(applyFormId);     │   │
│  │    });                                                   │   │
│  │                                                          │   │
│  │ 8. 发布续期事件（如保全类型影响续期）                    │   │
│  │    eventPublisher.publishEvent(                          │   │
│  │        new MaintenanceRenewalPayEvent(...));             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回处理上下文 Dict（包含财务订单信息等）                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据流转详解

### 5.1 MQ消息结构

```java
// MqMessage<JSONObject>
{
    "msgId": "xxx",                    // 消息ID
    "msgType": "MAINTENANCE",          // 消息类型
    "topic": "topic%saas_sync_data_maintenance",
    "tag": "maintenance_xxx",          // 保全类型tag
    "msgAction": "CREATE",             // 业务动作
    "sender": "LCYF",                  // 发送者
    "sendDate": "2026-01-28 10:00:00",
    "reply": true,                     // 是否需要回执
    "version": 1,                      // 版本号
    "content": {                       // 保全内容
        "orderSn": "xxx",              // 云服订单号
        "maintenanceTypeCode": "SURRENDER_HESITATE",
        "applyFormId": "xxx",
        "contNo": "xxx",
        // ... 其他保全特定字段
    }
}
```

### 5.2 maintenanceDetails JSON 结构示例

**退保类**:
```json
{
    "surrenderAmount": 1000.00,        // 退保金额
    "surrenderReason": "犹豫期退保",    // 退保原因
    "riskCode": "001"                  // 险种代码
}
```

**保全撤销类**:
```json
{
    "revokeInnerMaintenanceNo": "MN20260128xxx"  // 被撤销的保全单号
}
```

**客户变更类**:
```json
{
    "changeType": "MOBILE",            // 变更类型
    "oldValue": "138****0001",         // 变更前
    "newValue": "139****0002"          // 变更后
}
```

### 5.3 版本控制机制

```
MQ消息到达
    ↓
解析 version 字段
    ↓
查询数据库: 是否存在 同一订单+来源系统 的更高版本且成功的记录
    ↓
    ├── 存在更高版本 → 跳过处理，发送回执"版本号过低"
    │
    └── 不存在更高版本 → 继续处理
            ↓
        Redis分布式锁 (15秒)
            ↓
            ├── 获取锁失败 → 重复消费，直接返回（不发回执）
            │
            └── 获取锁成功 → 执行业务逻辑
                    ↓
                记录消费日志 (rocket_mq_record)
```

### 5.4 异常处理流程

```
try {
    // 业务逻辑
} catch (ServiceException e) {
    errorCode = e.getCode();
    // 重复数据不告警
    if (!PRESERVATION_SYNC_REPEAT.equals(errorCode)) {
        alertClient.alertByLevel(P0, "保全同步", detail, e);
    }
    // 创建异常任务
    maintenanceTaskService.create(task);
} catch (Exception e) {
    errorCode = PRESERVATION_OTHER;
    alertClient.alertByLevel(P0, "保全同步", detail, e);
    // 创建异常任务
    maintenanceTaskService.create(task);
} finally {
    // 不论成功失败，记录MQ消费日志
    rockRecordService.create(rocketMqRecord);
}
```

---

## 6. 开发注意事项

### 6.1 保全订单号生成规则

```java
// 格式: MN + yyyyMMdd + 雪花ID后6位
String innerMaintenanceNo = "MN" +
    LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) +
    IdUtil.getSnowflakeNextIdStr().substring(12);
// 示例: MN20260128123456
```

### 6.2 MQ 消费配置开关

```yaml
lcyf:
  cloud:
    policy:
      sync:
        maintenanceSwitch: new  # new=使用Maintenance, old=使用旧版Preservation
```

### 6.3 Redis 锁 Key 规则

```java
// 保全同步锁
String syncKey = "sync_maintenance:" + orderSn + ":" + sourceSystem;
// 锁超时: 15秒
redissonObject.trySetValue(syncKey, System.currentTimeMillis(), 15000L);
```

### 6.4 保单快照存储

创建保全时需要保存当时的保单快照（`policy_details_snapshot`），用于：
- 保全审核时对比变更前后差异
- 保全回滚时恢复原始数据
- 审计追溯

### 6.5 状态流转规则

```
新创建 → EFFECTIVE + UN_PROCESS
           ↓ processMaintenance()
        EFFECTIVE + PROCESS_SUCCESS

或者：
新创建 → ACCEPT_SUCCESS + UN_PROCESS
           ↓ 到达生效时间 + processMaintenance()
        EFFECTIVE + PROCESS_SUCCESS

异常：
处理失败 → EFFECTIVE + PROCESS_FAIL
           ↓ 进入 maintenance_task 表，可重试
```

### 6.6 财务通知条件

仅当以下条件满足时通知财务系统：
1. 保全处理成功（context != null）
2. 保单渠道为 TOA（即展团队）
3. 保全涉及收退费（`involvePayType` 非空）

### 6.7 事务与异步处理

保全处理中使用 `TransactionSynchronization.afterCommit()` 确保：
- 数据库事务提交成功后才发送 MQ 消息
- 避免事务回滚但消息已发送的不一致问题

```java
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            // 发送财务订单消息
            policySupplier.supplierSurrenderMsg(financeOrder);
            // 同步保单状态
            policySupplier.syncPolicyStatus(applyFormId, tenantCode);
        }
    }
);
```

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| Controller | `adapter/web/maintenance/MaintenanceController.java` |
| 内部Controller | `adapter/web/maintenance/MaintenanceInnerController.java` |
| MQ Consumer | `adapter/mq/comsumer/MaintenanceConsumer.java` |
| AppService | `biz/application/maintenance/IMaintenanceAppService.java` |
| InnerService | `biz/application/maintenance/impl/MaintenanceInnerServiceImpl.java` |
| Service | `biz/service/maintenance/IMaintenanceService.java` |
| ServiceImpl | `biz/service/impl/maintenance/MaintenanceServiceImpl.java` |
| ActionSelector | `biz/service/maintenance/MaintenanceActionSelector.java` |
| Gateway | `biz/infrastructure/gateway/MaintenanceGateway.java` |
| DetailsGateway | `biz/infrastructure/gateway/MaintenanceDetailsGateway.java` |
| TaskGateway | `biz/infrastructure/gateway/MaintenanceTaskDetailsGateway.java` |
| Entity | `biz/infrastructure/entity/MaintenanceDo.java` |
| DetailsEntity | `biz/infrastructure/entity/MaintenanceDetailsDo.java` |
| TaskEntity | `biz/infrastructure/entity/MaintenanceTaskDo.java` |
| Mapper | `biz/infrastructure/mapper/MaintenanceMapper.java` |
| View | `api/pojo/view/maintenance/page/MaintenanceView.java` |
| Cmd | `api/pojo/cmd/maintenance/createAction/MaintenanceActionCmd.java` |
| SyncCmd | `api/pojo/cmd/maintenance/MaintenanceSyncCmd.java` |
| Dto | `api/pojo/dto/MaintenanceDto.java` |

---

## 8. 扩展：新增保全类型

若需新增保全类型，需要：

1. **添加枚举值**
   - `MaintenanceTypeEnum` 添加新类型
   - `MaintenanceActionEnum` 添加对应操作

2. **创建 Cmd/Dto**
   - `MaintenanceAction{Type}Cmd.java` - 录入命令
   - `MaintenanceAction{Type}Dto.java` - 查询返回

3. **实现处理器**
   - 实现 `IMaintenanceActionHandler` 接口
   - 注册到 `MaintenanceActionSelector`

4. **添加 API 接口**
   - `MaintenanceController` 添加 create/query 方法
   - `IMaintenanceAppService` 添加对应服务方法

5. **配置 MQ Tag**（如需外部同步）
   - `MaintenanceConsumer` 中配置监听新的 tag

---

## 9. 常见问题排查

### 9.1 保全未处理

检查点：
1. `status` 是否为 `EFFECTIVE` 或 `ACCEPT_SUCCESS`
2. `process_flag` 是否为 `UN_PROCESS`
3. 如果 `status=ACCEPT_SUCCESS`，检查 `effect_time` 是否已到

### 9.2 MQ 消费失败

检查点：
1. 查看 `rocket_mq_record` 表，确认消息是否被消费
2. 查看 `policy_maintenance_task` 表，确认是否有异常任务
3. 检查日志中的错误信息
4. 确认 `maintenanceSwitch` 配置值

### 9.3 版本号过低

原因：已有更高版本的消息被成功处理
解决：检查业务逻辑，确认是否为正常的乱序消息

### 9.4 重复消费

原因：Redis 锁已被占用
解决：等待锁释放（15秒），或检查是否有重复消息
