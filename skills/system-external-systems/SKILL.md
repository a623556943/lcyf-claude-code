---
name: lcyf-system-external-systems
description: 外部系统集成管理。java-developer 在集成第三方系统时使用；planner 在规划系统集成方案时使用。
---

# System模块 业务逻辑详细文档（外部系统）

**负责模块**: system模块 - 外部系统集成层
**文档版本**: V1.0
**创建时间**: 2026-01-27
**文档范围**: 外部系统回调、第三方API集成、短信服务

---

## 目录

- [一、代理人签署回调接口（notify目录）](#一代理人签署回调接口notify目录)
- [二、腾讯云回调接口（notify目录）](#二腾讯云回调接口notify目录)
- [三、微信相关接口（tencent目录）](#三微信相关接口tencent目录)
- [四、短信服务接口（system/sms目录）](#四短信服务接口systemsms目录)
- [五、关键业务规则](#五关键业务规则)

---

## 一、代理人签署回调接口（notify目录）

**Controller**: `AgentSignNotifyController`
**URL前缀**: `/api/v1/system/agent/notify`
**负责人**: yuhang

### 1.1 签署合同结果通知接口

**HTTP方法**: `POST`
**URL**: `/api/v1/system/agent/notify/signContract`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：签名验证**
```
1. 获取法大大系统配置(SYSTEM_CONFIG_FADADA_CODE)
2. 计算数据摘要:
   digest = FddEncryptUtil.getMsgDigest(
     appId, timestamp, appSecret, transaction_id
   )
3. 对比摘要:
   if (digest != msg_digest) → 抛异常 AGENT_DIGEST_DATA_ERROR
4. 签名验证失败时不继续处理
```

**阶段二：查询合同信息**
```
1. 查询合同记录:
   agentContractInfoDto = agentContractInfoGateway
     .selectContractInfo(transaction_id)
2. 若不存在，查询变更中的临时合同:
   agentAgencyChangeInfoDto = agentAgencyChangeInfoGateway
     .selectByTransNo(transaction_id)
3. 若都不存在 → 抛异常 AGENT_CONTRACT_INFO_NOT_EXISTS
```

**阶段三：签署结果处理**

**分支A：合同已生效**
```
if (agentContractInfoDto.status == AgentContractStatusEnum.SUCCESS) {
  // 合同已生效，无需重复处理
  return TRUE
}
```

**分支B：法大大签署失败**
```
if (result_code != "3000") {
  // 签署失败，代理人入职状态保留在待签署协议
  // 无数据库更新
  return TRUE
}
```

**分支C：法大大签署成功**
```
1. 下载已签署合同
   bytes = fadadaApi.downloadContractToByteArray(
     agentContractInfoDto.contractDownloadUrl
   )

2. 上传到OSS
   objectName = agentCode + "_" + contractId + "_" + currentTimeMillis + ".pdf"
   ossInfo = aliOssClientV2.upload(
     AppCodeEnum.CX.getCode(),
     bytes,
     objectName,
     true
   )
   contractObjectId = ossInfo.objectId

3. 判断代理人入职状态
   if (agentDto.entryStatus == WAIT_SIGN_AGREEMENT) {
     // 个人签署合同成功 → 更新为待资料审核

     // 3.1 更新代理人信息
     agentUpdateCmd.entryStatus = WAIT_INFO_AUDIT
     agentUpdateCmd.contractSignFlag = TRUE
     agentUpdateCmd.contractObjectId = contractObjectId
     agentUpdateCmd.contractLock = "N"
     agentGateway.updateByCode(agentUpdateCmd)

     // 3.2 更新合同签约时间
     updateContractInfoSignTime(
       agentCode, contractId, contractObjectId
     )

   } else if (agentDto.entryStatus == CHANGE_CONTRACT_SIGNING_WAIT) {
     // 机构签署合同成功
     // 类似流程...
   }
```

#### 关键业务规则

- 签名验证必须通过，否则拒绝处理
- 验证签名的参数顺序：`appId + timestamp + appSecret + transaction_id`
- 代理人签署成功后自动转移到"待资料审核"状态
- 合同PDF自动下载并上传到OSS永久存储
- 签署失败时代理人状态保持在"待签署协议"

---

### 1.2 实名认证结果通知接口

**HTTP方法**: `POST`
**URL**: `/api/v1/system/agent/notify/realAuth`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：签名验证**
```
1. 获取法大大系统配置
   fadadaConfig = systemConfigService.getSystemConfig(
     SYSTEM_CONFIG_FADADA_CODE
   )

2. 计算数据摘要（注意参数顺序）
   sort = authenticationType + certStatus + customerId
        + serialNo + status + statusDesc
   digest = FddEncryptUtil.getMsgDigest(
     appId, timestamp, appSecret, sort
   )

3. 验证摘要
   if (digest != sign) → 抛异常 AGENT_DIGEST_DATA_ERROR
```

**阶段二：认证结果处理**
```
// 当前实现为占位符
// TODO: 不影响合同签署，没什么用
return TRUE
```

#### 关键业务规则

- 签名验证参数须按特定顺序排列后MD5
- 当前此接口处理逻辑为空（待后续扩展）
- 主要作用是记录外部认证结果日志

---

## 二、腾讯云回调接口（notify目录）

**Controller**: `TencentNotifyController`
**URL前缀**: `/api/v1/system/wechat/notify`
**负责人**: yuhang
**描述**: 微信开放平台的接口验证（仅实现验证逻辑）

### 2.1 微信接口验证接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/wechat/notify/officialAccountAuth`
**返回类型**: `String`

#### 业务逻辑

```
1. 记录日志
   log.info("微信接口验证请求参数:echostr:{}, signature:{}, timestamp:{}, nonce:{}",
     echostr, signature, timestamp, nonce)

2. 直接回复验证令牌
   return echostr

说明：
- 此接口主要用于微信服务器配置验证
- 微信需要服务器能正确响应echostr值来验证接口有效性
- 当前实现未实现签名验证（signature校验）
- 在生产环境应补充签名校验逻辑
```

#### 关键业务规则

- 必须原样返回echostr以通过微信验证
- 此接口用于微信配置消息推送URL时的验证
- 建议补充signature签名校验以提高安全性

---

## 三、微信相关接口（tencent目录）

**Controller**: `WechatController`
**URL前缀**: `/api/v1/system/wechat`
**负责人**: yongqin.peng / hao.li

### 3.1 获取微信jsApiTicket接口（即展）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/wechat/toA/wechat/get/jsApi/ticket`
**返回类型**: `CommonResult<WechatJsApiTicketDto>`

#### 业务逻辑分阶段

**阶段一：获取即展微信公众号配置**
```
configJson = systemConfigService.getSystemConfig(
  SYSTEM_CONFIG_WECHAT_OFFICIAL_ACCOUNT_JZ
)
config = parseToWechatOfficialAccountConfig(configJson)
// 配置包含: appId, appSecret, domain 等
```

**阶段二：获取微信基础access_token**
```
1. 检查Redis缓存
   token = redissonObject.get(
     REDIS_KEY_OFFICIAL_ACCOUNT_TOKEN_JZ_PREFIX
   )

2. 若缓存不存在，调用微信接口获取
   if (token == null) {
     tokenResp = wechatApi.getOfficialAccountAccessToken(
       config.domain, config.appId, config.appSecret
     )
     // 缓存有效期通常为7200秒
     redissonObject.set(
       REDIS_KEY_OFFICIAL_ACCOUNT_TOKEN_JZ_PREFIX,
       tokenResp.access_token,
       expireTime: 7200秒
     )
   }
```

**阶段三：获取jsApiTicket**
```
1. 检查Redis缓存
   jsApiTicket = redissonObject.get(
     REDIS_KEY_OFFICIAL_ACCOUNT_TICKET_JZ_PREFIX
   )

2. 若缓存不存在，调用微信接口获取
   if (jsApiTicket == null) {
     ticketResp = wechatApi.getOfficialAccountJsApiTicket(
       config.domain, token
     )
     // 缓存有效期通常为7200秒
     redissonObject.set(
       REDIS_KEY_OFFICIAL_ACCOUNT_TICKET_JZ_PREFIX,
       ticketResp.ticket,
       expireTime: 7200秒
     )
   }
```

**阶段四：生成JS接口权限验证签名**
```
1. 准备签名参数
   nonceStr = generateRandomString()
   timestamp = System.currentTimeMillis() / 1000

2. 计算签名
   signature = sha1("jsapi_ticket={jsApiTicket}&noncestr={nonceStr}&timestamp={timestamp}&url={url}")

3. 组装响应对象
   return WechatJsApiTicketDto(
     appId: config.appId,
     jsApiTicket: jsApiTicket,
     nonceStr: nonceStr,
     timestamp: timestamp,
     signature: signature,
     url: url
   )
```

#### 关键业务规则

- access_token和jsApiTicket都有效期限，应缓存在Redis
- access_token有效期7200秒（2小时），每日获取次数有限
- jsApiTicket有效期7200秒，单个access_token可获取多个ticket
- 签名采用SHA1(字符串排序后)方式
- URL必须是当前页面完整URL，不能包含#及之后的内容

---

### 3.2 获取微信openId接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/wechat/get/wechat/openId`
**返回类型**: `CommonResult<WechatUserInfoDto>`

#### 业务逻辑分阶段

**阶段一：获取微信公众号配置**
```
configCode = LoginAppConfigEnum.findByCode(
  loginAppConfigCode
).getConfigCode()

configJson = systemConfigService.getSystemConfig(configCode)
config = parseToWechatOfficialAccountConfig(configJson)
```

**阶段二：使用授权码获取access_token**
```
1. 调用微信接口
   authTokenResp = wechatApi.getAuthorizationToken(
     config.domain,
     config.appId,
     config.appSecret,
     code
   )

2. 错误处理
   if (authTokenResp.errcode != null) {
     log.error("获取微信用户授权token失败:异常编码:{}, 异常原因:{}",
       authTokenResp.errcode,
       authTokenResp.errmsg)
     throw ServiceException(
       GET_WECHAT_AUTHORIZATION_TOKEN_ERROR
     )
   }

3. 返回值包含
   - access_token: 用于后续API调用
   - openid: 用户唯一标识
   - expires_in: token有效期
```

**阶段三：使用access_token获取用户信息**
```
1. 调用微信接口
   userInfoResp = wechatApi.getAuthorizationUserInfo(
     config.domain,
     authTokenResp.access_token,
     authTokenResp.openid
   )

2. 错误处理
   if (userInfoResp.errcode != null) {
     log.error("微信授权token获取用户信息失败:异常编码:{}, 异常原因:{}",
       userInfoResp.errcode,
       userInfoResp.errmsg)
     throw ServiceException(
       GET_WECHAT_USER_INFO_ERROR
     )
   }

3. 返回值包含
   - openid: 用户openId
   - nickname: 用户昵称
   - headimgurl: 用户头像URL
   - sex: 用户性别
   - province/city: 用户地址
   - country: 国家
```

**阶段四：数据转换**
```
return WechatUserInfoDto(
  wechatOpenId: userInfoResp.openid,
  wechatNickName: userInfoResp.nickname,
  wechatAvatar: userInfoResp.headimgurl
)
```

#### 关键业务规则

- code仅能使用一次，过期后需重新授权
- code有效期5分钟
- access_token有效期2小时
- openId可用于用户身份关联
- 获取用户信息需要用户授权了"获取用户基本信息"权限

---

## 四、短信服务接口（system/sms目录）

**Controller**: `SmsController`
**URL前缀**: `/api/v1/system/sms`
**负责人**: wangyue

### 4.1 获取验证码接口

**HTTP方法**: `POST`
**URL**: `/api/v1/system/sms/verityCode`
**返回类型**: `CommonResult<Boolean>`

#### 验证码类型枚举

| verifyType | 说明 | 应用场景 | 登录状态 | appCode来源 |
|------------|------|---------|---------|-----------|
| 1 | 注册验证码 | 增员二维码注册、登录页快速注册 | 未登录 | 请求参数 |
| 2 | 登录验证码 | 短信验证码登录 | 未登录 | 请求参数 |
| 3 | 更新密码验证码（已登录）| 首次设置密码、重置密码 | 已登录 | LoginUtil获取 |
| 4 | 联系方式验证码 | 修改个人资料中的联系方式 | 已登录 | LoginUtil获取 |
| 5 | 绑定银行卡验证码 | 绑定银行卡或修改银行卡 | 已登录 | LoginUtil获取 |
| 6 | 忘记密码验证码 | 未登录时重置密码 | 未登录 | 请求参数 |

#### 业务逻辑分阶段

**阶段一：参数基础验证**
```
1. 手机号格式验证
   if (!ValidationUtils.isMobile(cmd.phone)) {
     return CommonResult.error(AUTH_MOBILE_NOT_VALID)
   }

2. 获取请求真实IP
   realIp = IpUtil.getRealIp(request)
   // 用于反爬虫检查
```

**阶段二：IP和手机号黑名单检查（反爬虫）**
```
1. 检查IP是否在黑名单
   isIpBlocked = redissonCollection.getSet(
     RedisKeyConstants.SMS_BLOCKED_IP
   ).contains(realIp)

   if (isIpBlocked) {
     log.error("ip为【{}】发送短信请求被拦截，但仍在访问，请留意", realIp)
     isBlocked = true
   }

2. 检查手机号是否在黑名单
   isMobileBlocked = redissonCollection.getSet(
     RedisKeyConstants.SMS_BLOCKED_MOBILE
   ).contains(mobile)

   if (isMobileBlocked) {
     log.error("手机号为【{}】发送短信请求被拦截，但仍在访问，请留意", mobile)
     isBlocked = true
   }

3. 若被黑名单拦截，直接返回成功（用户无感）
   if (isBlocked) {
     return CommonResult.success()
   }
```

**阶段三：验证码类型处理**

**分支 verifyType=1（注册验证码）**
```
key = REDIS_KEY_SMS_REGISTER + appCode + phone
templateCode = SmsCodeEnum.SMS_REGISTER
```

**分支 verifyType=2（登录验证码）**
```
key = REDIS_KEY_SMS_LOGIN + appCode + phone
templateCode = SmsCodeEnum.SMS_LOGIN
```

**分支 verifyType=3（更新密码验证码-已登录）**
```
1. 获取登录用户上下文
   appScope = LoginUtil.appScope()
   appCode = LoginUtil.appCode()

2. 检查账户是否存在
   if (loginService.checkLoginExist(phone, appScope)) {
     return CommonResult.error(USER_NOT_EXISTS)
   }

3. 设置缓存Key和模板
   key = REDIS_KEY_SMS_PASSWORD + appCode + phone
   templateCode = SmsCodeEnum.SMS_PASSWORD
```

**分支 verifyType=4（联系方式验证码）**
```
1. 获取登录用户上下文
   appScope = LoginUtil.appScope()
   appCode = LoginUtil.appCode()

2. 检查账户是否存在
   if (loginService.checkLoginExist(phone, appScope)) {
     return CommonResult.error(USER_NOT_EXISTS)
   }

3. 设置缓存Key和模板
   key = REDIS_KEY_SMS_CONTACT_MOBILE + appCode + phone
   templateCode = SmsCodeEnum.SMS_VERIFY_CONTACT_PHONE
```

**分支 verifyType=5（绑定银行卡验证码）**
```
1. 获取登录用户上下文
   appScope = LoginUtil.appScope()
   appCode = LoginUtil.appCode()

2. 检查账户是否存在
   if (loginService.checkLoginExist(phone, appScope)) {
     return CommonResult.error(USER_NOT_EXISTS)
   }

3. 设置缓存Key和模板
   key = REDIS_KEY_SMS_BANK_MOBILE + appCode + phone
   templateCode = SmsCodeEnum.SMS_VERIFY_BANK_PHONE
```

**分支 verifyType=6（忘记密码验证码-未登录）**
```
1. 使用请求参数中的appScope和appCode
   appScope = cmd.appScope
   appCode = cmd.appCode

2. 检查账户是否存在
   if (loginService.checkLoginExist(phone, appScope)) {
     return CommonResult.error(USER_NOT_EXISTS)
   }

3. 设置缓存Key和模板
   key = REDIS_KEY_SMS_PASSWORD + appCode + phone
   templateCode = SmsCodeEnum.SMS_PASSWORD
```

**阶段四：限流控制（防快速发送）**
```
1. 检查是否在快速发送限制内
   redisKey = key + SMS_FAST_KEY

   if (!redissonObject.trySetValue(
         redisKey,
         "",
         SMS_KEY_FAST_EXPIRED
       )) {
     // trySetValue失败表示key已存在（在快速发送时间窗内）
     return CommonResult.error(SMS_CODE_SEND_TOO_FAST)
   }

2. 关键参数
   - SMS_KEY_FAST_EXPIRED: 快速发送时间窗（通常为60秒）
   - 使用set-only-if-not-exists逻辑实现限流
```

**阶段五：发送验证码短信**
```
return CommonResult.success(
  smsService.sendSmsVerifyCode(
    appCode,
    templateCode,
    phone
  )
)
```

#### 关键业务规则

**反爬虫规则**
- 同一IP在时间窗内发送次数超过阈值 → 加入IP黑名单
- 同一手机号在时间窗内发送次数超过阈值 → 加入手机号黑名单
- 黑名单拦截后仍继续返回成功（用户无感知）

**限流规则**
- 同一手机号不能在60秒内重复获取验证码
- 通过Redis SET操作的原子性实现（SET-IF-NOT-EXISTS）
- 快速重试返回SMS_CODE_SEND_TOO_FAST错误

**账户检查规则**
- 3,4,5,6类型的验证码需检查账户是否存在
- 账户存在但验证码发送仍返回SUCCESS
- 检查失败返回USER_NOT_EXISTS

**appCode/appScope获取规则**
```
已登录场景(type=3,4,5):
  appCode = LoginUtil.appCode()
  appScope = LoginUtil.appScope()

未登录场景(type=1,2,6):
  appCode = cmd.appCode
  appScope = cmd.appScope
```

---

## 五、关键业务规则

### 5.1 外部系统签名验证规则

| 系统 | 签名方式 | 参数顺序 | 校验方式 |
|------|---------|---------|---------|
| 法大大（合同签署） | MD5 | appId + timestamp + appSecret + transaction_id | msg_digest验证 |
| 法大大（实名认证） | MD5 | appId + timestamp + appSecret + sort字段 | sign验证 |
| 微信 | SHA1 | jsapi_ticket + noncestr + timestamp + url（字母排序） | - |

### 5.2 缓存策略

| 缓存项 | 有效期 | 刷新时机 | 来源 |
|--------|--------|---------|------|
| 微信access_token | 7200秒 | 过期前3600秒刷新 | getOfficialAccountAccessToken |
| 微信jsApiTicket | 7200秒 | 过期前3600秒刷新 | getOfficialAccountJsApiTicket |
| 短信发送限流标记 | 60秒 | 自动过期 | Redis SET |
| IP黑名单 | 可配置 | 手动更新 | Redis SET |
| 手机号黑名单 | 可配置 | 手动更新 | Redis SET |

### 5.3 代理人签署流程状态转移

```
入职状态转移流程：

初始状态: 待提交信息
  ↓
待签署协议 (WAIT_SIGN_AGREEMENT)
  ↓ [签署合同回调成功]
待资料审核 (WAIT_INFO_AUDIT)
  ↓ [资料审核通过]
待入职审批 / 已入职
```

### 5.4 短信发送场景关键限制

| 场景 | 限制 | 备注 |
|------|------|------|
| 同一手机号快速重试 | 60秒内仅1条 | SMS_CODE_SEND_TOO_FAST |
| 同一IP高频发送 | 时间窗超阈值 → 加入黑名单 | 防接码平台 |
| 同一手机号高频发送 | 时间窗超阈值 → 加入黑名单 | 防黑卡攻击 |
| 未登录场景(type=3,4,5,6) | 账户必须存在 | USER_NOT_EXISTS |
| 已登录场景 | 自动使用登录上下文 | 无需传appCode/appScope |

### 5.5 外部依赖服务调用汇总

| 服务 | 方法 | 说明 | 超时设置 |
|------|------|------|---------|
| FadadaApi | downloadContractToByteArray | 下载已签署合同 | 默认 |
| FadadaApi | 合同生成/签署接口 | 发起合同签署流程 | 默认 |
| WechatApi | getOfficialAccountAccessToken | 获取微信基础token | 默认 |
| WechatApi | getOfficialAccountJsApiTicket | 获取jsapi_ticket | 默认 |
| WechatApi | getAuthorizationToken | OAuth授权获取token | 默认 |
| WechatApi | getAuthorizationUserInfo | 获取授权用户信息 | 默认 |
| AliOssClientV2 | upload | 上传合同PDF到OSS | 默认 |
| RedissonObject/Collection | 各种操作 | 分布式缓存和限流 | 默认 |

### 5.6 系统配置项清单

| 配置项编码 | 说明 | 使用场景 | 配置内容示例 |
|-----------|------|---------|------------|
| SYSTEM_CONFIG_FADADA_CODE | 法大大系统配置 | 签署合同/认证回调验证 | appId, appSecret, domain |
| SYSTEM_CONFIG_WECHAT_OFFICIAL_ACCOUNT_JZ | 即展微信公众号配置 | jsApiTicket获取、用户授权 | appId, appSecret, domain |
| {branchCode} | 分支机构合同配置 | 公司签署合同时读取 | 签章人信息、章程等 |

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0（外部系统集成）
**参考格式**: AgreementInfoControllerV2-业务文档.md

