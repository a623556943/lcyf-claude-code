---
name: lcyf-system-risk-management
description: 风控管理业务模块，包括风控规则、白名单、黑名单等风控相关功能。当执行 java-developer 或 planner agent 需要了解此模块时激活
---

# 风控管理模块 业务文档

**模块名称**: 风控中心管理（Risk Control Management）
**负责人**: 风控团队
**创建时间**: 2026-01-27

---

## 目录

- [一、黑名单管理](#一黑名单管理)
- [二、黑名单规则管理](#二黑名单规则管理)
- [三、白名单管理](#三白名单管理)
- [四、产品风控管理](#四产品风控管理)
- [五、关键业务规则](#五关键业务规则)

---

## 一、黑名单管理

**Controller路径**: `/api/v1/system/auth/blacklist`
**负责Service**: `IBlacklistObjectInfoService`

### 1. 内部告警邮件规则 - 设置接口

**HTTP方法**: `POST`
**URL**: `/setInternalAlertEmailRule`
**方法**: `IBlacklistInternalAlertService.setInternalAlertEmailRule`

#### 业务逻辑

**阶段一：参数验证**
- 校验告警邮件规则的基础配置

**阶段二：保存规则**
- 保存或更新内部告警邮件规则配置
- INSERT/UPDATE blacklist_internal_alert_rule

**关键业务规则**
- 告警邮件规则用于风控事件通知
- 支持多个告警邮箱配置

---

### 2. 内部告警邮件规则 - 获取接口

**HTTP方法**: `GET`
**URL**: `/getInternalAlertEmailRule`
**返回类型**: `CommonResult<BlacklistInternalAlertRuleDto>`

#### 业务逻辑

**查询当前配置**
- 查询最新的告警邮件规则配置
- SELECT FROM blacklist_internal_alert_rule

---

### 3. 黑名单列表 - 客户|代理人分页查询

**HTTP方法**: `GET`
**URL**: `/customer/page`
**返回类型**: `CommonResult<PageResult<BlacklistObjectInfoDto>>`

#### 业务逻辑

**阶段一：参数校验**
- 校验objectType（必填）
- objectType必须属于黑名单对象类型枚举
- 支持的类型: CUSTOMER(客户), AGENT(代理人)

**阶段二：查询参数处理**
- 平铺HttpServletRequest参数
- 自动注入tenantCode（多租户隔离）

**阶段三：分页查询**
- 调用 blacklistObjectInfoService.getCustomerPage(paraMap)
- 返回分页结果

**阶段四：数据增强**
- 批量查询创建人/更新人信息（用户表关联）
- 根据黑名单类型补充相关信息
  - CUSTOMER: 补充基本客户信息
  - AGENT: 补充代理人信息

**关键业务规则**
- 严格的tenantCode隔离
- objectType类型校验，无效类型直接返回错误
- 查询结果包含完整的用户信息

---

### 4. 黑名单列表 - 业务账号分页查询

**HTTP方法**: `GET`
**URL**: `/account/page`
**返回类型**: `CommonResult<PageResult<BlacklistObjectInfoDto>>`

#### 业务逻辑

**阶段一：查询参数处理**
- 强制设置objectType = ACCOUNT
- 自动注入tenantCode

**阶段二：名称搜索特殊处理**
- 如果提供了name参数（昵称）：
  - 查询account_biz_info表获取所有匹配的昵称对应的username
  - 构建BeanSearcher查询条件 (username IN (...))
- 如果提供了mobile参数：
  - 将mobile作为username查询

**阶段三：分页查询**
- 调用 blacklistObjectInfoGateway.selectPage(paraMap)

**阶段四：数据增强**
- 批量查询业务账号信息
  - 获取: nickName, appCode, channelName, deptName
  - 根据appCode区分应用：
    - JI_ZHAN(即展): 设置channelAName
    - LCYF(内部): 设置channelBName

**关键业务规则**
- 业务账号与昵称关联查询
- 支持按手机号查询（手机号作为username）
- 返回结果包含应用及渠道信息

---

### 5. 黑名单列表 - 渠道分页查询

**HTTP方法**: `GET`
**URL**: `/channel/page`
**返回类型**: `CommonResult<PageResult<BlacklistObjectInfoDto>>`

#### 业务逻辑

**阶段一：参数处理**
- 提取channelName（渠道名称）和blockSource（拦截源）
- 移除前端传入的这两个字段

**阶段二：构建复杂查询条件**
- 使用BeanSearcher MapBuilder构建分组查询：
  - A组: 其他基础条件
  - B组: blockSource包含匹配 (blockSource LIKE ?)
  - C组: objectType IN (CHANNEL_TO_B, EXTERNAL_CHANEL)
- 渠道名称搜索逻辑：
  - 直接搜索blockSource中包含的渠道名称
  - 同时查询channel_to_b表获取系统内渠道对应的channelCode
  - 按channelCode再次搜索
  - 最终组合: A & (B | C)

**阶段三：分页查询**
- 调用 blacklistObjectInfoGateway.selectPage(paraMap)

**阶段四：数据增强**
- 对外部渠道(EXTERNAL_CHANEL)：直接跳过信息补充
- 对内部渠道(CHANNEL_TO_B)：
  - 查询channel_to_b表获取详细信息
  - 补充: channelName, subjectType, contactPersonName/Mobile, contactIdCard

**关键业务规则**
- 支持内部渠道和外部渠道两种类型
- 外部渠道可包含合作伙伴信息（名称、社会信用编码等）
- 渠道搜索采用模糊匹配 + IN查询的组合方式

---

### 6. 黑名单列表 - 团队分页查询

**HTTP方法**: `GET`
**URL**: `/channelA/page`
**返回类型**: `CommonResult<PageResult<BlacklistObjectInfoDto>>`

#### 业务逻辑

**阶段一：参数处理**
- 强制设置objectType = CHANNEL_TO_A
- 自动注入tenantCode

**阶段二：团队名称搜索**
- 如果提供了channelName参数：
  - 查询dept表获取所有匹配的部门编码
  - 如果查询结果为空，直接返回空页面

**阶段三：分页查询**
- 调用 blacklistObjectInfoGateway.selectPage(paraMap)

**阶段四：数据增强**
- 批量查询部门(团队)信息
  - 补充: channelAName(团队名称)
  - 如果不是一级部门(level != 1)，补充: parentName(父部门名称)
  - 补充: level(部门级别)

**关键业务规则**
- 仅支持查询团队(CHANNEL_TO_A)类型
- 一级团队时不显示上级部门名称
- 支持按团队名称模糊搜索

---

### 7. 黑名单详情 - 获取单条记录

**HTTP方法**: `GET`
**URL**: `/details`
**参数**: `id` (必填)
**返回类型**: `CommonResult<BlacklistObjectInfoDto>`

#### 业务逻辑

**查询详情**
- 根据id查询黑名单详细信息
- 自动获取tenantCode进行租户隔离
- SELECT FROM blacklist_object_info WHERE id = ? AND tenant_code = ?

---

### 8. 黑名单 - 新增客户|代理人

**HTTP方法**: `POST`
**URL**: `/customer/add`
**入参**: `BlacklistObjectInfoAddCmd` (Customer校验组)
**返回类型**: `CommonResult<BlacklistResultDto>`

#### 业务逻辑

**阶段一：参数校验**
- 手机号和身份证号至少选其一（不能同时为空）
- 如果提供了身份证号，则证件类型必填
- 证件类型必须属于有效的身份证类型枚举

**阶段二：对象类型校验**
- 如果objectType = CUSTOMER(客户)：
  - 拦截源(blockSource)必填，不能为空列表
- 如果objectType = AGENT(代理人)：
  - blockSource默认设为空列表

**阶段三：数据持久化**
- 根据objectType调用不同的创建方法：
  - CUSTOMER: createCustomer()
  - AGENT: createCustomer()（同一方法）
- 执行唯一性校验：
  - (certificateNumber, certificateType, mobile) 组合唯一
  - 如果已存在返回status=0，否则status=1

**阶段四：响应处理**
- status = 1: 创建成功
- status = 0: 黑名单对象已存在
  - 返回错误码: BLACKLIST_CUSTOMER_EXIST
  - 返回已存在的黑名单记录信息

**数据库操作**
- INSERT blacklist_object_info
- 自动注入: tenantCode, creator, createTime

**关键业务规则**
- 黑名单对象唯一性约束：(certificateNumber + certificateType + mobile) 组合
- 客户必须指定拦截源（业务方向）
- 代理人不需要指定拦截源
- 手机号和身份证号至少选其一

---

### 9. 黑名单 - 新增业务账号

**HTTP方法**: `POST`
**URL**: `/account/add`
**入参**: `BlacklistObjectInfoAddCmd` (Account校验组)
**返回类型**: `CommonResult<BlacklistResultDto>`

#### 业务逻辑

**阶段一：参数校验**
- username必填

**阶段二：强制设置**
- objectType = ACCOUNT

**阶段三：数据持久化**
- 调用 createAccount()
- 执行唯一性校验：
  - username唯一
  - 如果已存在返回status=0

**阶段四：响应处理**
- 同客户|代理人新增

**关键业务规则**
- 业务账号username唯一
- 必须指定拦截源(blockSource)

---

### 10. 黑名单 - 新增渠道|团队

**HTTP方法**: `POST`
**URL**: `/channel/add`
**入参**: `BlacklistObjectInfoAddCmd` (ChannelToA|ChannelToB校验组)
**返回类型**: `CommonResult<BlacklistResultDto>`

#### 业务逻辑

**阶段一：参数校验**
- channelCode必填
- objectType必填（CHANNEL_TO_A 或 CHANNEL_TO_B）

**阶段二：数据持久化**
- 调用 createChannel()
- 执行唯一性校验：
  - (channelCode, objectType) 组合唯一
  - 如果已存在返回status=0

**关键业务规则**
- 支持两种渠道类型：CHANNEL_TO_A(团队)、CHANNEL_TO_B(渠道)
- (channelCode, objectType) 组合唯一
- 必须指定拦截源(blockSource)

---

### 11. 黑名单 - 新增外部渠道

**HTTP方法**: `POST`
**URL**: `/externalChanel/add`
**入参**: `BlacklistObjectInfoAddCmd` (ExternalChanel校验组)
**返回类型**: `CommonResult<Long>`

#### 业务逻辑

**阶段一：参数校验**
- 支持的可选字段：
  - force: 强制等级
  - subjectName: 主体名称
  - unifiedSocialCreditIdentifier: 社会信用编码
  - shortName: 简称
  - channelName: 渠道名称
  - contactPersonName: 联系人名称
  - contactPersonMobile: 联系人手机
  - businessEmail: 业务邮箱
  - financeEmail: 财务邮箱

**阶段二：强制设置**
- objectType = EXTERNAL_CHANEL

**阶段三：有条件字段处理**
- 所有字段均为可选，存在时才设置

**阶段四：数据持久化**
- 调用 createExternalChanel()
- INSERT blacklist_object_info
- 自动注入: tenantCode, creator, createTime

**返回值**: 新创建的黑名单记录ID

**关键业务规则**
- 外部渠道信息更为丰富，包含多个合作伙伴信息字段
- 所有字段均为可选，灵活支持各类外部渠道接入

---

### 12. 黑名单 - 编辑客户|代理人

**HTTP方法**: `PUT`
**URL**: `/customer/update`
**入参**: `BlacklistObjectInfoUpdateCmd` (Customer校验组)
**返回类型**: `CommonResult<Long>`

#### 业务逻辑

**阶段一：参数校验**
- 同新增接口的校验逻辑
- 手机号和身份证号至少选其一

**阶段二：更新前查询**
- 根据id查询现有记录

**阶段三：唯一性校验**
- 检查(certificateNumber + certificateType + mobile)是否被其他记录使用
- 如果被使用，返回错误

**阶段四：更新操作**
- UPDATE blacklist_object_info SET ...
- 如果唯一性校验通过，返回0；否则返回冲突的记录ID

**关键业务规则**
- 支持修改个人身份信息（手机号、身份证等）
- 修改时需要进行唯一性校验，不能与其他黑名单对象重复

---

### 13. 黑名单 - 编辑业务账号

**HTTP方法**: `PUT`
**URL**: `/account/update`
**入参**: `BlacklistObjectInfoUpdateCmd` (Account校验组)
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：参数校验**
- username必填

**阶段二：唯一性校验**
- 检查username是否被其他记录使用

**阶段三：更新操作**
- UPDATE blacklist_object_info

**关键业务规则**
- username唯一性约束

---

### 14. 黑名单 - 编辑渠道|团队

**HTTP方法**: `PUT`
**URL**: `/channel/update`
**入参**: `BlacklistObjectInfoUpdateCmd` (ChannelToA|ChannelToB校验组)
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：参数校验**
- id必填

**阶段二：更新操作**
- UPDATE blacklist_object_info SET blockSource = ...

**关键业务规则**
- 主要更新拦截源信息

---

### 15. 黑名单 - 编辑外部渠道

**HTTP方法**: `PUT`
**URL**: `/externalChanel/update`
**入参**: `BlacklistObjectInfoUpdateCmd` (ExternalChanel校验组)
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：参数处理**
- 自动注入tenantCode

**阶段二：更新操作**
- 调用 modifyExternalChanel()
- UPDATE blacklist_object_info

**关键业务规则**
- 支持更新外部渠道的多个字段信息

---

## 二、黑名单规则管理

**Controller路径**: `/api/v1/system/auth/blacklist/rule`
**负责Service**: `IBlacklistRuleService`

### 1. 黑名单规则 - 列表查询

**HTTP方法**: `GET`
**URL**: `/list/{id}`
**参数**: `id` (黑名单对象ID)
**返回类型**: `CommonResult<List<BlacklistRuleDto>>`

#### 业务逻辑

**阶段一：查询规则列表**
- 根据blacklist_object_info的ID查询关联的所有规则
- SELECT FROM blacklist_rule WHERE object_info_id = ? AND rule_status IN (IN_EFFECT, ...)

**阶段二：数据增强**
- 批量查询创建人信息
- 将userId转换为userNickName

**关键业务规则**
- 返回该黑名单对象关联的所有有效规则

---

### 2. 黑名单规则 - 新增

**HTTP方法**: `POST`
**URL**: `/add`
**入参**: `BlacklistRuleAddCmd`
**返回类型**: `CommonResult<BlacklistResultDto>`

#### 业务逻辑

**阶段一：效果类型校验**
- effectType是一个List<Integer>
- 校验规则：不能同时包含PROMPT(提示)和INTERCEPT(拦截)
  - 错误码: BLACKLIST_EFFECT_TYPE_ERROR

**阶段二：场景类型特殊处理**
- 如果sceneType = LOGIN(登录类)：
  - 强制设置effectType = [INTERCEPT]
  - 登录类场景必须拦截，不允许仅提示

**阶段三：风控因子校验**
- 根据黑名单对象类型进行不同的校验：
  - AGENT(代理人)：blockSource必填
  - 非AGENT：至少选择一个风控因子
- 校验effectType的有效性

**阶段四：场景和因子重复检查**
- 查询该黑名单对象已有的有效规则
- 判断风控因子是否重复
- 如果同一黑名单对象在同一场景已存在相同因子的规则，返回status=0

**阶段五：过期时间处理**
- 如果objectType = AGENT：
  - expirationTime必须晚于当前时间
  - 如果未提供expirationTime，默认设为9999-12-31
- 非AGENT：expirationTime默认设为9999-12-31

**阶段六：数据持久化**
- 设置effectTime = now()
- 设置ruleStatus = IN_EFFECT
- INSERT blacklist_rule

**阶段七：续保计划同步**
- 如果黑名单对象是CUSTOMER类型：
  - 在事务提交后发送MQ消息
  - 触发续保计划的相关修改
  - 消息类型: DATA_CHANGE_SYNC_TOPIC
  - 消息action: BLACK_LIST_CHANGE

**返回值**:
- status = 1: 创建成功，返回新规则ID
- status = 0: 规则已存在或冲突

**关键业务规则**
- 效果类型不能同时为提示和拦截
- 登录场景必须设为拦截
- 代理人必须指定拦截源和过期时间
- 非代理人必须选择至少一个风控因子
- 同一对象同一场景的风控因子不能重复
- 创建后自动同步续保计划变更

---

### 3. 黑名单规则 - 编辑

**HTTP方法**: `PUT`
**URL**: `/update`
**入参**: `BlacklistRuleUpdateCmd`
**返回类型**: `CommonResult<Long>`

#### 业务逻辑

**阶段一：效果类型校验**
- 不能同时包含PROMPT和INTERCEPT

**阶段二：调用修改方法**
- 调用 blacklistRuleService.modify(updateCmd)

**阶段三：返回值处理**
- 返回值非null时：
  - 返回error，错误码: BLACKLIST_AGENT_SCENCE_SAME
  - 表示场景和代理人组合重复
- 返回值为null时：
  - 返回success

**关键业务规则**
- 编辑时进行同样的场景因子重复检查

---

### 4. 黑名单规则 - 停用

**HTTP方法**: `DELETE`
**URL**: `/invalid/{id}`
**参数**: `id` (规则ID)
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：查询规则**
- 根据id查询规则

**阶段二：停用操作**
- 调用 blacklistRuleService.invalid(id)
- UPDATE blacklist_rule SET rule_status = INVALID

**关键业务规则**
- 停用规则后该规则不再生效
- 风控检查时会忽略INVALID状态的规则

---

### 5. 黑名单规则 - 详情

**HTTP方法**: `GET`
**URL**: `/detail/{id}`
**参数**: `id` (规则ID)
**返回类型**: `CommonResult<BlacklistRuleDto>`

#### 业务逻辑

**查询详情**
- 根据id查询规则详细信息
- SELECT FROM blacklist_rule WHERE id = ?

---

## 三、白名单管理

**Controller路径**: `/api/v1/system/auth/whiteList`
**负责Service**: `IWhiteListService`

### 1. 白名单列表 - 分页查询

**HTTP方法**: `GET`
**URL**: `/page`
**入参**: `WhiteListPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<WhiteListView>>`

#### 业务逻辑

**阶段一：参数处理**
- 平铺HttpServletRequest参数
- 自动注入tenantCode

**阶段二：分页查询**
- 调用 whiteListService.getWhiteListPage(query, paraMap)
- SELECT FROM white_list WHERE ...

**阶段三：数据增强**
- 批量查询创建人/更新人信息
- 将userId转换为userNickName

**关键业务规则**
- 多租户隔离
- 返回完整的创建者/更新者信息

---

### 2. 白名单场景 - 列表查询

**HTTP方法**: `GET`
**URL**: `/list`
**参数**: `whiteListId` (必填)
**返回类型**: `CommonResult<List<WhiteListDetailsDto>>`

#### 业务逻辑

**阶段一：查询场景列表**
- 根据whiteListId查询所有生效场景
- SELECT FROM white_list_details WHERE white_list_id = ?

**阶段二：数据增强**
- 批量查询创建人信息

**阶段三：状态计算**
- 对每条记录计算生效状态：
  - 如果 now() > invalidTime: status = INVALID(已失效)
  - 否则: status = EFFECT(生效中)

**关键业务规则**
- 根据当前时间与失效时间进行动态状态计算
- 自动判断场景是否已失效

---

### 3. 白名单 - 新增

**HTTP方法**: `POST`
**URL**: `/add`
**入参**: `WhiteListAddCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：唯一性检查**
- 根据 (name, idCard, mobile) 组合查询
- SELECT FROM white_list WHERE name = ? AND id_card = ? AND mobile = ?
- 如果已存在，返回error
  - 错误码: WHITE_LIST_USER_INFO_EXISTS
  - 返回已存在的白名单记录信息

**阶段二：数据持久化**
- INSERT white_list
- 自动注入: creator, createTime, tenantCode

**返回值**: 新创建的白名单ID

**关键业务规则**
- (name, idCard, mobile) 组合唯一
- 防止重复添加同一个人到白名单

---

### 4. 白名单场景 - 新增

**HTTP方法**: `POST`
**URL**: `/add/effect`
**入参**: `WhiteListDetailsAddCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：白名单存在性检查**
- 根据whiteListId查询白名单是否存在
- 验证validType的有效性

**阶段二：场景唯一性检查**
- 根据 (whiteListId, effectType, validType) 组合查询
- SELECT FROM white_list_details WHERE white_list_id = ? AND effect_type = ? AND valid_type = ?
- 如果已存在，返回error
  - 错误码: WHITE_LIST_DETAILS_USER_INFO_EXISTS
  - 包含effectTypeName和validTypeName

**阶段三：失效时间处理**
- 调用 getInvalidTime(invalidTimeType, invalidTime)
- 根据invalidTimeType确定失效时间：
  - SPEC_TIME: 使用提供的invalidTime
  - 其他类型: 根据枚举规则计算

**阶段四：数据持久化**
- INSERT white_list_details
- 自动注入: creator, createTime

**关键业务规则**
- (whiteListId, effectType, validType) 组合唯一
- 失效时间计算支持多种类型
- 一条白名单可对应多个场景

---

### 5. 白名单 - 编辑

**HTTP方法**: `PUT`
**URL**: `/update`
**入参**: `WhiteListUpdateCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：唯一性检查**
- 根据 (name, idCard, mobile) 查询
- 如果找到的记录id != 当前编辑记录id，则返回error

**阶段二：记录旧值**
- 查询原记录作为对比基准

**阶段三：更新操作**
- UPDATE white_list SET ...

**阶段四：数据变更记录**
- 调用 dataChangeRecordService.create()
- 记录变更类型: COMPARE
- 事件: WHITE_LIST_MODIFY
- 保存新旧值对比信息

**关键业务规则**
- 支持修改个人信息（姓名、身份证、手机号）
- 修改时需要进行唯一性校验
- 自动记录数据变更日志

---

### 6. 白名单场景 - 编辑

**HTTP方法**: `PUT`
**URL**: `/update/effect`
**入参**: `WhiteListDetailsUpdateCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：白名单检查**
- 验证whiteListId和validType

**阶段二：场景唯一性检查**
- 根据 (whiteListId, effectType, validType) 查询
- 如果找到的记录id != 当前编辑记录id，则返回error

**阶段三：失效时间处理**
- 调用 getInvalidTime() 重新计算失效时间

**阶段四：记录旧值和更新**
- 查询原记录
- UPDATE white_list_details SET ...

**阶段五：数据变更记录**
- 记录变更类型: COMPARE
- 事件: WHITE_LIST_EFFECT_MODIFY

**关键业务规则**
- 支持修改场景配置
- 支持修改失效时间
- 自动记录数据变更日志

---

### 7. 白名单场景 - 停用

**HTTP方法**: `GET`
**URL**: `/stop/effect/{id}`
**参数**: `id` (场景ID)
**返回类型**: `CommonResult<Object>`

#### 业务逻辑

**阶段一：查询场景**
- 根据id查询white_list_details

**阶段二：失效时间检查**
- 获取记录的invalidTime
- 如果 now() > invalidTime，抛出异常
  - 错误码: WHITE_LIST_IS_INVALID
  - 场景已失效，不能停用

**阶段三：停用操作**
- 设置 invalidTime = now()
- 设置 invalidTimeType = SPEC_TIME
- UPDATE white_list_details

**关键业务规则**
- 只能停用生效中的场景
- 停用时将失效时间设为当前时间

---

### 8. 白名单 - 临时批量导入

**HTTP方法**: `POST`
**URL**: `/temp/batch/import`
**入参**: `List<WhiteListOuterCreateCmd>`
**返回类型**: `CommonResult<List<String>>`

#### 业务逻辑

**阶段一：批量数据处理**
- 接收外部白名单批量导入列表

**阶段二：逐条导入**
- 调用 tempBatchImport()
- 对每条记录进行新增或更新处理

**阶段三：返回结果**
- 返回导入结果列表（成功或失败消息）

**关键业务规则**
- 支持批量导入白名单
- 返回每条记录的导入状态

---

## 四、产品风控管理

**Controller路径**: `/api/v1/system/auth/riskCon/product`
**负责Service**: `IRiskConProductApplicationServ`

### 1. 产品可见规则 - 渠道ToB获取

**HTTP方法**: `GET`
**URL**: `/channel2b/visible/rule/get`
**参数**: `channelCode` (必填)
**返回类型**: `CommonResult<RiskConChannelTobProductVisibleRuleDto>`

#### 业务逻辑

**查询规则**
- 根据channelCode查询该渠道的产品自动可见规则
- SELECT FROM risk_con_channel_tob_product_visible_rule WHERE channel_code = ?
- 返回单条规则（如果存在）

**关键业务规则**
- 每个渠道ToB对应一条可见规则
- 规则定义该渠道自动可见的产品集合

---

### 2. 产品可见规则 - 渠道ToB创建/更新

**HTTP方法**: `POST`
**URL**: `/channel2b/visible/rule/create`
**入参**: `RiskConChannelTobProductVisibleRuleAddCmd`
**返回类型**: `CommonResult<Long>`

#### 业务逻辑

**阶段一：判断操作类型**
- 如果cmd.id != null && cmd.id > 0：
  - 更新操作: UPDATE risk_con_channel_tob_product_visible_rule

**阶段二：数据持久化**
- 否则: INSERT新规则
- 设置channelCode、productVisibleRules等配置

**返回值**: 规则ID

**关键业务规则**
- 支持创建和更新（根据id判断）
- 一个渠道对应一套可见规则配置

---

### 3. 产品可见规则 - 团队ToA获取

**HTTP方法**: `GET`
**URL**: `/channelToA/visible/rule/get`
**参数**: `channelCodeToA` (必填)
**返回类型**: `CommonResult<ChannelToAProductVisibleRuleDto>`

#### 业务逻辑

**查询规则**
- 根据channelCodeToA查询团队的产品可见规则
- SELECT FROM channel_to_a_product_visible_rule WHERE channel_code_to_a = ?

**关键业务规则**
- 每个团队对应一条可见规则

---

### 4. 产品可见规则 - 团队ToA创建/更新

**HTTP方法**: `POST`
**URL**: `/channelToA/visible/rule/create`
**入参**: `ChannelToAProductVisibleRuleAddCmd`
**返回类型**: `CommonResult<Long>`

#### 业务逻辑

**阶段一：团队存在性校验**
- 根据channelCodeToA查询dept表
- SELECT FROM dept WHERE code = ?
- 如果不存在，抛出异常
  - 错误码: CHANNEL_NOT_EXIST

**阶段二：数据补充**
- 从dept获取: deptCode(dept的根部门编码), deptLevel(固定为1)
- 自动注入: tenantCode(从LoginUtil获取)

**阶段三：判断操作类型**
- 如果cmd.id != null && cmd.id > 0：
  - UPDATE channel_to_a_product_visible_rule
- 否则：
  - INSERT新规则

**返回值**: 规则ID

**关键业务规则**
- 创建前必须验证团队是否存在
- 部门编码来自于团队的根部门
- 部门级别固定为1（一级）
- 支持创建和更新

---

## 五、关键业务规则

### 1. 黑名单对象类型

| 类型 | 说明 | 唯一性约束 | 拦截源 |
|------|------|----------|--------|
| CUSTOMER | 客户 | (certificateNumber + certificateType + mobile) | 必填 |
| AGENT | 代理人 | (certificateNumber + certificateType + mobile) | 可选 |
| ACCOUNT | 业务账号 | username | 必填 |
| CHANNEL_TO_A | 团队 | (channelCode, objectType) | 必填 |
| CHANNEL_TO_B | 渠道 | (channelCode, objectType) | 必填 |
| EXTERNAL_CHANEL | 外部渠道 | (channelCode, objectType) 或其他 | 必填 |

### 2. 黑名单规则类型

**场景类型(SceneType)**:
- LOGIN: 登录类 → 强制效果为拦截
- ORDER: 订单类 → 支持提示/拦截
- RENEWAL: 续保类 → 支持提示/拦截

**效果类型(EffectType)**:
- PROMPT: 提示 → 仅警告用户
- INTERCEPT: 拦截 → 阻止操作

**重要规则**:
- 同一规则的effectType不能同时包含PROMPT和INTERCEPT
- 登录类场景必须为拦截效果
- 代理人黑名单默认为拦截效果

### 3. 黑名单规则冲突判断

| 冲突条件 | 是否允许 |
|---------|---------|
| 同一对象、同一场景、同一风控因子 | 否 |
| 同一对象、同一场景、不同风控因子 | 是 |
| 同一对象、不同场景 | 是 |

### 4. 黑名单对客户影响

**创建/修改客户黑名单规则时**:
- 如果objectType = CUSTOMER：
  - 在事务提交后发送MQ消息
  - 触发续保计划的变更同步
  - 消息Topic: DATA_CHANGE_SYNC_TOPIC
  - 消息Tag: DATA_CHANGE_SYNC_ROUTING_KEY
  - 消息Action: BLACK_LIST_CHANGE

### 5. 白名单对象唯一性

| 约束类型 | 字段组合 | 说明 |
|---------|---------|------|
| 白名单本身 | (name, idCard, mobile) | 防止同一人重复加入 |
| 白名单场景 | (whiteListId, effectType, validType) | 防止同一场景重复配置 |

### 6. 白名单失效时间类型

**WhiteListInvalidTimeEnum**:
- PERMANENT: 永久有效 → 失效时间设为9999-12-31
- SPEC_TIME: 指定时间 → 使用提供的invalidTime
- DYNAMIC: 动态计算 → 根据其他规则计算

**动态失效时间计算**:
```
基础失效时间 = 配置值（例如：30天、90天）
实际失效时间 = 创建时间 + 基础失效时间
```

### 7. 黑名单过期时间规则

| 对象类型 | 过期时间 | 说明 |
|---------|---------|------|
| AGENT | 必须晚于当前时间 | 可以自定义，默认9999-12-31 |
| 其他 | 默认9999-12-31 | 不支持自定义 |

**验证规则**:
- 如果黑名单objectType = AGENT且提供了expirationTime
- 需要校验: expirationTime > now()
- 否则抛出异常: BLACKLIST_EXPIRATION_TIME_ERROR

### 8. 产品可见规则优先级

**渠道ToB和团队ToA的产品可见规则**:
- 定义该渠道/团队自动可见的产品集合
- 与产品白名单配合使用
- 优先级关系：
  1. 黑名单（最高，禁用产品）
  2. 产品白名单（限制产品范围）
  3. 渠道/团队可见规则（基础可见性）

### 9. 多租户隔离规则

**所有风控操作都需要进行租户隔离**:
- 自动注入tenantCode
- SELECT查询时: WHERE tenant_code = ?
- INSERT操作时: 设置tenant_code
- UPDATE操作时: 确保只更新同一租户的数据

**隔离级别**:
- 黑名单: 严格隔离（所有操作都检查tenantCode）
- 白名单: 严格隔离
- 规则: 严格隔离

### 10. 数据变更记录

**白名单变更会自动记录**:
- 变更类型: COMPARE（对比类）
- 事件类型: WHITE_LIST_MODIFY 或 WHITE_LIST_EFFECT_MODIFY
- 记录新旧值对比
- 用于后续审计和追溯

**黑名单变更**:
- 规则变更后发送MQ消息通知其他系统
- 记录内部告警信息

### 11. 内部告警机制

**黑名单告警处理**:
- 配置内部告警邮件规则
- 黑名单命中时触发邮件通知
- 支持多个告警邮箱配置
- 告警等级: P1(紧急)

### 12. 业务账号与渠道的关联

**业务账号黑名单**:
- 支持跨应用黑名单检查
- 可关联到多个应用(appCode)：
  - JI_ZHAN: 即展业务端
  - LCYF: 内部系统
- 账号被黑名单后，相关应用登录被拦截

### 13. 批量导入处理

**白名单批量导入**:
- 支持外部数据源批量导入
- 返回导入状态列表
- 支持部分成功部分失败

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0 (风控管理模块)
**参考Service实现类**:
- `BlacklistObjectInfoServiceImpl`
- `BlacklistRuleServiceImpl`
- `WhiteListServiceImpl`
- `RiskConProductApplicationServImpl`
