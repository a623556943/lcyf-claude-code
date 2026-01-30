---
name: other
description: |
  其他业务（Other）模块
  
  【模块定位】对外订单查询、MQ通知、外部回调、数据变更同步等支撑功能。
  
  【支持的代理】
  - java-developer: 实现支撑功能逻辑
  - planner: 规划系统集成
  
  【触发关键词】
  对外查询、MQ通知、外部回调、数据同步、保险公司回调、签名验证
  
  【必须调用】
  Java-developer: 任务涉及"MQ"、"回调"、"集成" → SHOULD

---

# 其他业务模块文档

> 本文档描述 policy-module 中的其他业务模块，包括对外订单查询、MQ通知、外部回调、数据变更同步等。

## 1. 模块概述

### 1.1 功能分类

| 模块 | 描述 |
|------|------|
| 对外订单查询 | 无需Token的订单查询接口（签名验证） |
| MQ通知服务 | 财务订单通知、数据同步推送 |
| 外部回调接口 | 保险公司承保/退保回调处理 |
| 数据变更同步 | 保单所有者变更等数据同步 |

---

## 2. 对外订单查询（无需Token）

### 2.1 接口设计

**Controller**: `NAPolicyOrderController.java`

**路径前缀**: `/api/v1/policy/order/na`（na = no auth）

| 方法 | 路径 | 说明 | 认证方式 |
|------|------|------|---------|
| GET | /payResult | 查询订单支付结果 | 签名验证 |
| GET | /order/info | 查询订单详情 | 签名验证 |
| GET | /preOrder/policyProperty/info | 查询投保数据信息 | 签名验证 |

### 2.2 签名验证机制

```java
// 使用 @ValidSign 注解进行签名验证
@GetMapping("/payResult")
@ValidSign  // 自动校验签名
public CommonResult<PolicyOrderPayResultDto> getPayResult(
    @RequestParam String orderSn,
    @RequestParam String timestamp,
    @RequestParam String sign
) {
    // 签名验证通过后执行业务逻辑
}
```

**签名算法**：
```
1. 参数按字母顺序排序
2. 拼接成 key1=value1&key2=value2 格式
3. 追加密钥 &key=secretKey
4. MD5/SHA256 加密
5. 比对 sign 参数
```

### 2.3 使用场景

- 外部系统回调查询订单状态
- 小程序/H5 无登录态时查询支付结果
- 第三方系统集成

---

## 3. MQ通知服务

### 3.1 财务订单通知

**Controller**: `MqNoticeController.java`

**路径前缀**: `/api/v1/policy/mq`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /noticeFinanceOrderNew | 通知生成财务订单（新单） |
| POST | /noticeFinanceOrderPreservation | 通知生成财务订单（保全） |
| POST | /reNoticeFinanceOrder | 财务订单MQ补推 |
| POST | /delete/financeOrderMqRecord | 删除MQ发送记录 |

### 3.2 通知流程

```
┌─────────────────────────────────────────────────────────────────┐
│  手动/定时触发 noticeFinanceOrderNew()                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IMqNoticeService.noticeFinanceOrderNew()                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 查询未生成财务订单的新单                               │   │
│  │    orderDataSyncSendRecordService.getBusinessIdsNew()    │   │
│  │ 2. 遍历查询保单详情                                       │   │
│  │    policyDetailsService.get(applyFormId)                 │   │
│  │ 3. 组装MQ消息                                            │   │
│  │    buildFinanceOrderMsg(policyDetailsDto)                │   │
│  │ 4. 发送MQ消息                                            │   │
│  │    rocketMqTemplate.syncSend(TOPIC_SYNC_FINANCE_ORDER)   │   │
│  │ 5. 记录发送状态                                          │   │
│  │    orderDataSyncSendRecordService.save()                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 消息格式

```java
// 财务订单消息结构
public class FinanceOrderMsgDto {
    private String msgId;                // 消息ID
    private String businessType;         // 业务类型：NEW/PRESERVATION
    private String applyFormId;          // 投保单ID
    private String innerOrderNo;         // 订单号
    private String contNo;               // 保单号
    private BigDecimal prem;             // 保费
    private String channelCodeTob;       // 渠道
    private String channelCodeToa;       // 团队
    private LocalDateTime createTime;    // 创建时间
    // ... 其他字段
}
```

### 3.4 MQ Topic 常量

```java
// PolicyMQConstants
public static final String TOPIC_SYNC_FINANCE_ORDER = "topic%sync_finance_order";
public static final String TOPIC_SYNC_SAAS_MAINTENANCE = "topic%saas_sync_data_maintenance";
public static final String TOPIC_SYNC_SAAS_PRESERVATION = "topic%saas_sync_data_preservation";
public static final String TOPIC_POLICY_STATUS_CHANGE = "topic%saas_policy_status_change";
```

### 3.5 发送记录管理

**表名**: `order_data_sync_send_record`

| 字段 | 说明 |
|------|------|
| business_id | 业务ID（applyFormId） |
| business_type | 业务类型（NEW/PRESERVATION） |
| msg_id | 消息ID |
| flag | 发送状态（Y=成功，N=失败） |
| retry_count | 重试次数 |
| last_error | 最后错误信息 |

---

## 4. 外部回调接口

### 4.1 平安财产险回调

**Controller**: `PingAnNotifyController.java`

**路径前缀**: `/api/v1/policy/notify/pingAn`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /outer/01/underwriting | 承保通知 |
| POST | /outer/01/surrender | 退保通知 |
| POST | /outer/01/endorsement | 批改通知 |
| GET | /outer/01/underwriting/resetMq | 承保MQ补发（测试） |
| GET | /outer/01/surrender/reset | 退保请求补发（测试） |
| POST | /create/order | 创建平安取消险订单 |

### 4.2 回调处理流程

```
┌─────────────────────────────────────────────────────────────────┐
│  平安保险公司回调                                                │
│  POST /outer/01/underwriting                                    │
│  Body: 加密报文                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PingAnNotifyController.underwriting()                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 解密报文（AES-CBC）                                    │   │
│  │    key: pingAnProperties.getAesKey()                     │   │
│  │    iv: pingAnProperties.getAesIv()                       │   │
│  │ 2. 验签（RSA SHA256withRSA）                             │   │
│  │    publicKey: pingAnProperties.getPublicKey()            │   │
│  │ 3. 解析JSON                                              │   │
│  │ 4. 幂等性检查（transactionId）                           │   │
│  │    notifyRecordService.checkAndSave()                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  业务处理                                                        │
│  - 承保通知：更新保单状态为已生效                                 │
│  - 退保通知：创建退保保全记录                                     │
│  - 批改通知：创建批改保全记录                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  返回处理结果                                                    │
│  { "code": "0000", "message": "成功" }                          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 密钥配置

```yaml
# application.yml
lcyf:
  cloud:
    policy:
      pingAn:
        aesKey: xxx          # AES密钥
        aesIv: xxx           # AES初始向量
        publicKey: xxx       # RSA公钥（验签用）
        privateKey: xxx      # RSA私钥（加签用）
```

### 4.4 其他保险公司回调（已禁用）

**位置**: `adapter/web/notify/stash/`

| 保险公司 | Controller | 特点 |
|---------|-----------|------|
| AIG美亚 | AigNotifyController | 退保通知 |
| 爱心人寿 | AixinLifeNotifyController | 退保通知 |
| 安盛保险 | AxaNotifyController | 通知处理 |
| 长城人寿 | ChangchengLifeNotifyController | 通知处理 |
| 招商仁和 | CmrhNotifyController | XML格式，统一接口 |
| 海保人寿 | HaibaoNotifyController | DES加密 |
| 恒安人寿 | HenganLifeNotifyController | 通知处理 |
| 和泰人寿 | HetaiLifeNotifyController | 通知处理 |
| 弘康人寿 | HongkangNotifyController | 普通/CPS两种 |
| 华泰人寿 | HuataiLifeNotifyController | 通知处理 |
| 昆仑健康 | KunlunHealthNotifyController | 通知处理 |
| 富德生命 | SinoLifeNotifyController | 退保通知 |
| 泰康人寿 | TaikangNotifyController | 通知处理 |

**注意**：stash 目录下的 Controller 已禁用（未注册为 Spring Bean），如需启用需修改注解。

---

## 5. 数据变更同步

### 5.1 保单所有者变更同步

**接口**: `IPolicyDataSyncService`

**实现**: `PolicyDataSyncServiceImpl`

```java
public interface IPolicyDataSyncService {
    /**
     * 保单所有者信息变更时同步
     * @param cmd 变更命令
     */
    void syncWhenOwnerInfoChange(UpdateOwnerInfoCmd cmd);
}
```

### 5.2 同步流程

```
┌─────────────────────────────────────────────────────────────────┐
│  触发条件：CRM系统更新保单运营负责人                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PolicyDataSyncService.syncWhenOwnerInfoChange()                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 更新寿险保单的运营负责人                               │   │
│  │    policyDetailsGateway.updateOwnerInfo()                │   │
│  │ 2. 更新财险保单的运营负责人                               │   │
│  │    policyPropertyDetailsGateway.updateOwnerInfo()        │   │
│  │ 3. 更新订单的运营信息                                     │   │
│  │    policyOrderDetailsGateway.updateOwnerInfo()           │   │
│  │ 4. 获取新负责人的用户信息                                 │   │
│  │    userApi.getByUserId()                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  事务提交后，异步同步到其他系统                                   │
│  TransactionSynchronization.afterCommit()                       │
│  - 发送MQ通知CRM系统                                            │
│  - 发送MQ通知报表系统                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 通知记录管理

**接口**: `INotifyRecordService`

用于记录所有外部保险公司的回调通知：

```java
public interface INotifyRecordService {
    /**
     * 检查并保存通知记录（幂等性）
     * @param transactionId 交易ID
     * @param requestBody 请求体
     * @return true=首次通知，false=重复通知
     */
    boolean checkAndSave(String transactionId, String requestBody);

    /**
     * 更新通知处理状态
     */
    void updateStatus(String transactionId, String status, String errorMsg);
}
```

---

## 6. 开发注意事项

### 6.1 签名验证实现

```java
// ValidSign 注解处理逻辑
@Aspect
public class ValidSignAspect {

    @Around("@annotation(ValidSign)")
    public Object around(ProceedingJoinPoint point) {
        // 1. 获取请求参数
        Map<String, String> params = getRequestParams();

        // 2. 按字母顺序排序
        String sortedParams = params.entrySet().stream()
            .filter(e -> !"sign".equals(e.getKey()))
            .sorted(Map.Entry.comparingByKey())
            .map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining("&"));

        // 3. 追加密钥
        String signStr = sortedParams + "&key=" + secretKey;

        // 4. MD5加密
        String expectedSign = DigestUtils.md5Hex(signStr).toUpperCase();

        // 5. 比对签名
        if (!expectedSign.equals(params.get("sign"))) {
            throw new BusinessException("签名验证失败");
        }

        return point.proceed();
    }
}
```

### 6.2 回调幂等性处理

```java
// 使用 transactionId 作为唯一标识
String transactionId = request.getTransactionId();

// 检查是否已处理
NotifyRecordDo record = notifyRecordGateway.selectByTransactionId(transactionId);
if (record != null) {
    log.info("重复通知，已处理: {}", transactionId);
    return buildSuccessResponse();
}

// 保存通知记录
notifyRecordGateway.save(new NotifyRecordDo()
    .setTransactionId(transactionId)
    .setRequestBody(requestBody)
    .setStatus("PROCESSING")
);

// 处理业务逻辑...

// 更新处理状态
notifyRecordGateway.updateStatus(transactionId, "SUCCESS", null);
```

### 6.3 MQ发送重试机制

```java
// 配置重试
@Bean
public RocketMQTemplate rocketMQTemplate() {
    RocketMQTemplate template = new RocketMQTemplate();
    template.setProducer(producer);

    // 同步发送失败重试次数
    producer.setRetryTimesWhenSendFailed(3);
    // 异步发送失败重试次数
    producer.setRetryTimesWhenSendAsyncFailed(3);

    return template;
}

// 发送时的补偿记录
try {
    SendResult result = rocketMqTemplate.syncSend(topic, message);
    if (result.getSendStatus() == SendStatus.SEND_OK) {
        recordService.updateFlag(businessId, "Y");
    } else {
        recordService.updateFlag(businessId, "N", result.getSendStatus().name());
    }
} catch (Exception e) {
    recordService.updateFlag(businessId, "N", e.getMessage());
    recordService.incrementRetryCount(businessId);
}
```

### 6.4 密钥安全管理

```java
// 不要硬编码密钥，使用配置中心
@Value("${lcyf.cloud.policy.pingAn.aesKey}")
private String aesKey;

// 生产环境使用加密配置
// application-prod.yml
lcyf:
  cloud:
    policy:
      pingAn:
        aesKey: ENC(xxxxx)  # 使用 jasypt 加密
```

### 6.5 异步处理建议

对于耗时的回调处理，建议异步化：

```java
@Async("policyAsyncExecutor")
@Transactional
public void processUnderwritingAsync(UnderwritingNotifyDto dto) {
    // 1. 更新保单状态
    // 2. 发送MQ通知
    // 3. 更新通知记录
}
```

### 6.6 日志规范

```java
// 回调接口必须记录完整请求/响应
log.info("[平安承保回调] 请求: transactionId={}, body={}",
    transactionId, JsonUtils.toJson(request));

try {
    // 处理业务...
    log.info("[平安承保回调] 处理成功: transactionId={}", transactionId);
} catch (Exception e) {
    log.error("[平安承保回调] 处理失败: transactionId={}", transactionId, e);
    throw e;
}
```

---

## 7. 关键代码位置

| 组件 | 文件路径 |
|------|---------|
| 无Token查询Controller | `adapter/web/mqNotice/NAPolicyOrderController.java` |
| MQ通知Controller | `adapter/web/mqNotice/MqNoticeController.java` |
| MQ通知Service | `biz/service/impl/IMqNoticeServiceImpl.java` |
| 平安回调Controller | `adapter/web/notify/PingAnNotifyController.java` |
| 数据同步Service | `biz/service/impl/PolicyDataSyncServiceImpl.java` |
| 通知记录Service | `biz/service/INotifyRecordService.java` |
| 发送记录Service | `biz/service/IOrderDataSyncSendRecordService.java` |
| 签名验证注解 | `framework-xxx/ValidSign.java` |
| MQ常量 | `api/constants/PolicyMQConstants.java` |
| 平安配置 | `biz/infrastructure/config/PingAnProperties.java` |

---

## 8. 扩展开发指引

### 8.1 新增无Token接口

1. **定义接口**
   ```java
   @RestController
   @RequestMapping("/api/v1/policy/order/na")
   public class NAPolicyOrderController {

       @GetMapping("/newEndpoint")
       @ValidSign  // 添加签名验证
       public CommonResult<Dto> newEndpoint(@RequestParam String param) {
           // 业务逻辑
       }
   }
   ```

2. **配置白名单**
   - 在安全配置中添加路径白名单
   - `/api/v1/policy/order/na/**` 通常已配置

### 8.2 新增保险公司回调

1. **创建 Controller**
   ```java
   @RestController
   @RequestMapping("/api/v1/policy/notify/{companyCode}")
   public class NewCompanyNotifyController {

       @PostMapping("/underwriting")
       public ResponseEntity<String> underwriting(@RequestBody String body) {
           // 1. 解密（根据保司协议）
           // 2. 验签
           // 3. 幂等性检查
           // 4. 业务处理
           // 5. 返回结果
       }
   }
   ```

2. **配置密钥**
   ```yaml
   lcyf:
     cloud:
       policy:
         newCompany:
           encryptKey: xxx
           signKey: xxx
   ```

3. **注册回调地址**
   - 在保险公司系统配置回调URL

### 8.3 新增MQ通知类型

1. **定义Topic/Tag**
   ```java
   // PolicyMQConstants
   public static final String TOPIC_NEW_NOTIFY = "topic%new_notify";
   public static final String TAG_NEW_NOTIFY = "new_notify_tag";
   ```

2. **实现发送逻辑**
   ```java
   public void sendNewNotify(NewNotifyDto dto) {
       Message<NewNotifyDto> message = MessageBuilder
           .withPayload(dto)
           .setHeader(MessageConst.PROPERTY_TAGS, TAG_NEW_NOTIFY)
           .build();

       rocketMqTemplate.syncSend(TOPIC_NEW_NOTIFY, message);
   }
   ```

3. **实现消费逻辑**（如需要）
   ```java
   @Bean
   public Consumer<Message<NewNotifyDto>> newNotifyConsumer() {
       return msg -> {
           // 处理消息
       };
   }
   ```
