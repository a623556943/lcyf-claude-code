---
name: lcyf-system-config-management
description: 系统通用配置管理。java-developer 在获取/维护系统配置时使用；planner 在规划配置管理体系时使用。
---

# System模块 配置管理业务文档

**模块说明**: system/base 配置管理模块
**负责人**: zhouyuhang, yongqin.peng
**创建时间**: 2024-01-18
**最后更新**: 2026-01-27

---

## 目录

- [一、系统配置管理](#一系统配置管理)
- [二、即展配置管理](#二即展配置管理)
- [三、渠道Banner管理](#三渠道banner管理)
- [四、字典管理](#四字典管理)
- [五、关键业务规则](#五关键业务规则)

---

## 一、系统配置管理

### 1.1 SystemSetController - 系统设置

**URL前缀**: `/api/v1/system`

#### 接口1: 更新系统设置参数

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/set/update`
**方法**: `SystemSetServiceImpl.modify`

**入参** (SystemSetUpdateCmd):
- code: 配置编码
- 其他配置字段

**业务逻辑分阶段**:

**阶段一：参数校验**
- @Valid注解自动校验必填字段

**阶段二：数据更新**
- 调用 systemSetGateway.update(systemSetUpdateCmd)
- UPDATE system_set表

**关键业务规则**:
- 系统设置通过code唯一标识
- 直接更新，无需额外校验

---

#### 接口2: 查询系统设置参数

**HTTP方法**: `GET`
**URL**: `/api/v1/system/get/{code}`

**业务逻辑分阶段**:

**阶段一：根据编码查询**
- 调用 systemSetGateway.selectByCode(code)
- SELECT FROM system_set WHERE code = ?

**阶段二：返回结果**
- 返回 SystemSetDto对象

---

### 1.2 SystemConfigController - 系统配置

**URL前缀**: `/api/v1/system`

#### 接口1: 分页查询系统配置

**HTTP方法**: `GET`
**URL**: `/api/v1/system/page/config`
**方法**: `SystemConfigServiceImpl.page`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 将HttpServletRequest参数扁平化为Map
- MapUtils.flat(request.getParameterMap())

**阶段二：分页查询**
- 调用 systemConfigGateway.selectPage(paraMap)
- 返回 PageResult<SystemConfigSimpleDto>

---

#### 接口2: 添加系统配置

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/config/add`
**方法**: `SystemConfigServiceImpl.create`

**入参** (SystemConfigAddCmd):
- code: 配置编码 (必填)
- config: 配置内容JSON (必填)
- remark: 备注

**业务逻辑分阶段**:

**阶段一：唯一性校验**
```
systemConfig = getSystemConfig(cmd.getCode())
Assert.isNull(systemConfig, () -> {
  throw SYSTEM_CONFIG_CODE_DUPLICATE
})
```

**阶段二：数据持久化**
- 调用 systemConfigGateway.save(cmd)
- INSERT system_config

**关键业务规则**:
- 配置编码全局唯一
- 配置内容以JSONObject形式存储

---

#### 接口3: 更新系统配置

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/config/update`
**方法**: `SystemConfigServiceImpl.modify`

**入参** (SystemConfigUpdateCmd):
- id: 配置ID (必填)
- code: 配置编码 (可选)
- config: 配置内容JSON (可选)

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
config = systemConfigGateway.selectById(cmd.getId())
Assert.notNull(config, () -> {
  throw DATA_NOT_EXIST
})
```

**阶段二：数据更新**
- 调用 systemConfigGateway.updateById(cmd)
- UPDATE system_config SET ... WHERE id = ?

---

#### 接口4: 删除系统配置

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/config/delete`
**方法**: `SystemConfigServiceImpl.delete`

**入参**:
- id: 配置ID (必填)

**业务逻辑分阶段**:

**阶段一：删除操作**
- 调用 systemConfigGateway.removeById(id)
- DELETE FROM system_config WHERE id = ?

**关键业务规则**:
- 无引用关系校验，直接删除

---

#### 接口5: 查询系统配置JSON

**HTTP方法**: `GET`
**URL**: `/api/v1/system/get/config/{code}`
**方法**: `SystemConfigServiceImpl.getSystemConfig`

**业务逻辑分阶段**:

**阶段一：查询配置**
- 调用 systemConfigGateway.selectSystemConfig(code)
- SELECT config FROM system_config WHERE code = ?

**阶段二：返回JSON**
- 返回 JSONObject类型的配置内容

---

#### 接口6: 根据牌照获取乐橙域名

**方法**: `SystemConfigServiceImpl.getLcDomainByLicensePlate`
**内部调用**: 供其他模块RPC调用

**业务逻辑分阶段**:

**阶段一：牌照映射到配置编码**
```
switch (LicensePlateEnum.valueOf(licensePlate)) {
  case LCBD -> code = SYSTEM_CONFIG_LCYF_CODE
  case DFDD -> code = SYSTEM_CONFIG_DFDD_CODE
  case MS -> code = SYSTEM_CONFIG_MS_CODE
}
if (StrUtil.isBlank(code)) {
  throw AGENT_SAAS_SYSTEM_ERROR
}
```

**阶段二：查询配置并解析**
```
lcyfConfig = systemConfigGateway.selectSystemConfig(code)
config = JSONObject.parseObject(JSONObject.toJSONString(lcyfConfig), LcyfConfig.class)
return config.getDomain()
```

**关键业务规则**:
- 不同牌照对应不同的云服配置
- LCBD: 乐橙保代
- DFDD: 东方代代
- MS: 铭盛

---

## 二、即展配置管理

### 2.1 JzConfigController - 即展配置

**URL前缀**: `/api/v1/system/jz`

#### 接口1: 即展首页模板查询

**HTTP方法**: `GET`
**URL**: `/api/v1/system/jz/auth/homePage/template/query`
**方法**: `JzConfigServiceImpl.getHomePageTemplate`

**业务逻辑分阶段**:

**阶段一：查询模板列表**
- 调用 homePageTemplateGateway.selectList()
- SELECT FROM jz_home_page_template

**阶段二：关联用户信息**
```
userIds = jzHomePageTemplateList.stream()
  .map(JzHomePageTemplateDto::getUpdater)
  .filter(StringUtils::hasText)
  .map(Long::valueOf)
  .collect(Collectors.toSet())

userMap = userInfoGateway.selectTenantIgnoreUserListByIds(userIds)
  .stream()
  .collect(Collectors.toMap(UserInfoDto::getId, Function.identity()))
```

**阶段三：统计关联渠道数量**
```
channelList = channelToAGateway.selectAll()
channelTemplateMap = new HashMap<>()

for (channelToADto : channelList) {
  if (channelToADto.getHomePageTemplateId() != null) {
    channelTemplateMap.put(templateId, count++)
  }
}
```

**阶段四：填充数据**
- 填充更新人昵称
- 填充关联渠道数量 (relateCount)

---

#### 接口2: 添加即展首页模板

**HTTP方法**: `POST`
**URL**: `/api/v1/system/jz/auth/homePage/template/add`
**方法**: `JzConfigServiceImpl.createHomePageTemplate`

**入参** (JzHomePageTemplateAddCmd):
- templateName: 模板名称 (必填)

**业务逻辑分阶段**:

**阶段一：设置模板类型**
```
addCmd.setType(HomePageTemplateTypeEnum.CUSTOM.getCode())
```

**阶段二：唯一性校验**
```
dto = homePageTemplateGateway.selectByName(addCmd.getTemplateName())
Assert.isNull(dto, () -> {
  throw "模板名称已存在"
})
```

**阶段三：数据持久化**
- 调用 homePageTemplateGateway.save(addCmd)
- INSERT jz_home_page_template

**关键业务规则**:
- 模板名称全局唯一
- 新建模板类型默认为CUSTOM(自定义)
- DEFAULT(默认)类型为系统预置

---

#### 接口3: 即展首页模板详情

**HTTP方法**: `GET`
**URL**: `/api/v1/system/jz/auth/homePage/template/details/{id}`
**方法**: `JzConfigServiceImpl.getHomePageTemplateDetails`

**业务逻辑分阶段**:

**阶段一：查询模板基础信息**
```
detailsDto = homePageTemplateGateway.selectByIdToDetails(id)
if (Objects.isNull(detailsDto)) {
  throw DATA_NOT_EXIST
}
```

**阶段二：查询Banner列表**
```
bannerList = bannerGateway.selectByTemplateIdAll(id)
bannerList.sort(Comparator.comparing(JzBannerDto::getSort))
detailsDto.setBannerList(bannerList)
```

**阶段三：查询推荐分类**
```
typeList = recommendTypeGateway.selectByTemplateId(id)
typeList.sort(Comparator.comparing(JzRecommendTypeDto::getSort))
detailsDto.setRecommendTypeList(typeList)
```

**阶段四：查询推荐产品**
```
typeIds = typeList.stream().map(JzRecommendTypeDto::getId).collect()
itemByType = recommendItemGateway.selectInTypeIds(typeIds)
  .stream()
  .collect(Collectors.groupingBy(JzRecommendItemDto::getTypeId))
```

**阶段五：关联产品费率信息**
```
productServiceMainIds = itemByType.values().stream()
  .flatMap(Collection::stream)
  .map(JzRecommendItemDto::getProductServiceMainId)
  .filter(Objects::nonNull)
  .collect()

mainInfoMap = productServiceApi.getProductServiceMainInfoListByIds(productServiceMainIds)
```

**阶段六：组装完整数据**
- 将推荐产品按sort排序
- 填充产品主费率信息
- 将推荐产品列表设置到对应分类下

---

#### 接口4: 删除即展首页模板

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/jz/auth/homePage/template/{id}`
**方法**: `JzConfigServiceImpl.deleteHomePageTemplate`

**业务逻辑分阶段**:

**阶段一：查询模板**
```
jzHomePageTemplateDto = homePageTemplateGateway.selectById(id)
if (Objects.isNull(jzHomePageTemplateDto)) {
  return Boolean.TRUE
}
```

**阶段二：类型校验**
```
if (HomePageTemplateTypeEnum.DEFAULT.getCode().equals(jzHomePageTemplateDto.getType())) {
  throw "不支持删除默认类型模板"
}
```

**阶段三：引用校验**
```
channelList = channelToAGateway.selectByHomePageTemplateId(id)
if (!CollectionUtils.isEmpty(channelList)) {
  throw "当前模板被应用不支持删除"
}
```

**阶段四：级联删除**
```
1. DELETE jz_home_page_template WHERE id = ?
2. DELETE jz_banner WHERE template_id = ?
3. DELETE jz_recommend_type WHERE template_id = ?
4. DELETE jz_recommend_item WHERE type_id IN (typeIds)
```

**关键业务规则**:
- DEFAULT类型模板不可删除
- 被渠道引用的模板不可删除
- 删除模板时级联删除Banner、推荐分类、推荐产品

---

#### 接口5: 更新即展首页模板详情

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/jz/auth/homePage/template/update`
**方法**: `JzConfigServiceImpl.updateHomePageTemplateDetails`

**入参** (JzHomePageTemplateDetailsDto):
- id: 模板ID (必填)
- templateName: 模板名称 (可选)
- bannerList: Banner列表 (可选)
- recommendTypeList: 推荐分类列表 (可选)

**业务逻辑分阶段**:

**阶段一：模板存在性校验**
```
jzHomePageTemplateDto = homePageTemplateGateway.selectById(updateCmd.getId())
if (Objects.isNull(jzHomePageTemplateDto)) {
  throw DATA_NOT_EXIST
}
```

**阶段二：模板名称更新**
```
if (!Objects.equals(updateCmd.getTemplateName(), jzHomePageTemplateDto.getTemplateName())) {
  dto = homePageTemplateGateway.selectByName(updateCmd.getTemplateName())
  if (Objects.nonNull(dto) && !Objects.equals(dto.getId(), updateCmd.getId())) {
    throw "模板名称已存在"
  }
  // CUSTOM类型才允许修改名称
  if (HomePageTemplateTypeEnum.CUSTOM.getCode().equals(jzHomePageTemplateDto.getType())) {
    templateUpdateCmd.setTemplateName(updateCmd.getTemplateName())
  }
  homePageTemplateGateway.updateById(templateUpdateCmd)
}
```

**阶段三：Banner处理**
```
processBanner(updateCmd.getBannerList(), bannerAddCmdList, bannerUpdateCmdList, updateCmd.getId())
// 规则:
// 1. 无id -> 新增
// 2. 有id -> 更新
// 3. 老数据没有的id -> 删除
// 4. 同一类型最多6张启用的Banner
// 5. 立即生效: startDate = now()
// 6. 指定生效: startDate = 指定时间
// 7. 从禁用变启用: startDate = now()
// 8. 从启用变禁用: endDate = now()

bannerGateway.saveBatch(bannerAddCmdList)
bannerGateway.updateBatch(bannerUpdateCmdList)
bannerGateway.removeByIds(subtract(oldIds, existBannerIds))
```

**阶段四：推荐分类和产品处理**
```
processType(updateCmd.getRecommendTypeList(), existTypeMap, existItemMap, updateCmd.getId())
// 规则:
// 1. 无id -> 新增type
// 2. 有id -> 更新type
// 3. 产品列表中无id -> 新增item
// 4. 产品列表中有id -> 更新item
// 5. 老数据没有的type -> 删除type及其关联的所有item
// 6. 老数据没有的item -> 删除item

recommendTypeGateway.updateBatch(typeUpdateCmdList)
recommendItemGateway.saveBatch(itemAddCmdList)
recommendItemGateway.updateBatch(itemUpdateCmdList)
recommendTypeGateway.removeByIds(removeTypeIds)
recommendItemGateway.removeByTypeIds(removeTypeIds)
recommendItemGateway.removeByIds(removeItemIds)
```

**关键业务规则**:
- DEFAULT类型模板不可修改名称
- Banner类型: H5、PC
- 同一类型最多6张启用的Banner
- Banner生效类型: immediately(立即)、assign(指定时间)
- 推荐分类和产品支持排序(sort字段)
- 删除推荐分类时级联删除其下所有产品

---

#### 接口6: 设置团队首页模板

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/jz/auth/homePage/template/assign`
**方法**: `JzConfigServiceImpl.assignHomePageTemplate`

**入参** (ChannelHomePageTemplateCmd):
- channelCode: 渠道编码 (必填)
- templateId: 模板ID (必填)

**业务逻辑分阶段**:

**阶段一：渠道校验**
```
channelToADto = channelToAGateway.selectChannelByCode(cmd.getChannelCode())
Assert.notNull(channelToADto, () -> {
  throw "渠道不存在"
})
```

**阶段二：模板校验**
```
jzHomePageTemplateDto = homePageTemplateGateway.selectById(cmd.getTemplateId())
Assert.notNull(jzHomePageTemplateDto, () -> {
  throw "首页模板不存在"
})
```

**阶段三：关联更新**
```
channelToAUpdateCmd.setId(channelToADto.getId())
channelToAUpdateCmd.setHomePageTemplateId(cmd.getTemplateId())
channelToAGateway.updateById(channelToAUpdateCmd)
// UPDATE channel_toa SET home_page_template_id = ?
```

**关键业务规则**:
- 一个渠道只能关联一个首页模板
- 模板和渠道必须都存在

---

#### 接口7: 即展首页模板详情【渠道端】

**HTTP方法**: `GET`
**URL**: `/api/v1/system/jz/homePage/template/details/`
**方法**: `JzConfigServiceImpl.getHomePageTemplateDetailsChannel`

**业务逻辑分阶段**:

**阶段一：登录状态判断**
```
isLogin = StpUtil.isLogin()
if (isLogin) {
  channelCodeToa = LoginUtil.channelCodeToa()
  userCode = LoginUtil.userCode()
  TenantContextHolder.setTenantCode(LoginUtil.tenantCode())
} else {
  // 未登录使用自营渠道
  channelCodeToa = DEFAULT_TOA_CHANNEL_CODE
  TenantContextHolder.setTenantCode(DEFAULT_TENANT_CODE)
}
```

**阶段二：确定模板ID**
```
// 未登录: 使用自营渠道的模板
// 已登录: 使用自己渠道的模板
channelToADto = channelToAGateway.selectChannelByCode(channelCodeToa)
if (Objects.nonNull(channelToADto)) {
  templateId = channelToADto.getHomePageTemplateId()
}

// 如果没有配置模板，使用默认模板
if (Objects.isNull(templateId)) {
  defaultTemplate = homePageTemplateGateway.selectDefault()
  templateId = defaultTemplate.getId()
}
```

**阶段三：获取代理人入职信息**
```
if (isLogin) {
  userInfoDto = userInfoGateway.selectByCode(userCode)
  agentDto = agentGateway.selectByLoginUniqueId(userInfoDto.getLoginUniqueId())
  if (agentDto == null) {
    // 不是代理人，返回空
    return jzHomePageTemplateDto
  }

  entryStatusSimpleEnum = EntryStatusEnum.convertToSimpleEnum(agentDto.getEntryStatus())
  firstItem = getMeasureFirstItem(userCode) // 获取基本法首年佣金子项

  // 收集入职牌照信息
  if (SIMPLE_JOINED.equals(entryStatusSimpleEnum.getCode())) {
    entryLicense.add(agentDto.getLicenseCode())
    if (LCBD.equals(agentDto.getLicenseCode())) isEntryLc = true
    if (DFDD.equals(agentDto.getLicenseCode())) isEntryDf = true
  }

  // 查询签单员入职信息
  signerList = signerApi.getEnableSignerAgentByLoginUniqueId(loginUniqueId)
  for (signerDto : signerList) {
    entryLicense.add(signerDto.getLicenseCode())
    if (LCBD.equals(signerDto.getLicenseCode())) isEntryLc = true
    if (DFDD.equals(signerDto.getLicenseCode())) isEntryDf = true
  }
}
```

**阶段四：查询Banner**
```
bannerList = bannerGateway.selectByTemplateId(templateId)
bannerList.sort(Comparator.comparing(JzBannerDto::getSort))
jzHomePageTemplateDto.setBannerList(bannerList)
```

**阶段五：查询推荐产品**
```
typeList = recommendTypeGateway.selectByTemplateId(templateId)
itemByType = recommendItemGateway.selectInTypeIds(typeIds)
mainInfoMap = productServiceApi.getProductServiceMainInfoListByIds(productServiceMainIds)
channelToAProductDtoList = productSalesApi.getChannelProductsToaList(channelCodeToa)
productBaseConfigItemMap = productV2Api.getProductBaseItem(innerProductCodes)
channelBaseFeeDtos = channelBaseFeeGateway.selectListByChannelCodeAndAppCode(channelCodeToa)
```

**阶段六：产品过滤和权限控制**

**未登录**:
```
// 展示全部经代公司的产品
// 不展示按钮及任何文案
// 过滤: 渠道未分配的产品、不可见的产品
```

**已登录 - 已入职**:
```
// 经代产品:
if (entryLicense.isEmpty()) {
  item.setCanGetUrl(FALSE)
  item.setNeedEntry(TRUE)
} else {
  // 仅展示入职经代公司的产品
  if (!entryLicense.contains(item.getLicensePlate())) {
    iterator.remove()
  }
}

// 互联网产品:
if (isEntryLc && isEntryDf) {
  // 同时入职乐橙和东方: 过滤掉18cps给51的
  if (LCBD.equals(signLicensePlate) && DFDD.equals(licensePlate)) {
    iterator.remove()
  }
} else {
  // 只入职一个: 过滤掉非自己入职的经代公司的产品
  if (!agentDto.getLicenseCode().equals(item.getLicensePlate())) {
    iterator.remove()
  }
}

// 展示佣金比例: "佣金最高XX%"
// 若最高为0%或未配置则不展示按钮及任何文案
// 点击按钮触发获取"推广链接"逻辑
```

**已登录 - 未入职/入职中/已离职**:
```
// 展示全部经代公司的产品
// 经代产品: 显示固定文案"认证拿佣金"，点击跳转入职流程
// 互联网产品:
if (isEntryLc && isEntryDf) {
  // 同时入职: 过滤18cps给51的
} else if (isEntryLc && !isEntryDf && NOT_SUPPORT互联网) {
  // 只有18且不支持互联网: 只展示18的
} else if (!isEntryLc && isEntryDf && NOT_SUPPORT互联网) {
  // 只有51且不支持互联网: 只展示51的
} else if (!isEntryLc && !isEntryDf) {
  if (NOT_SUPPORT互联网) {
    item.setNeedEntry(TRUE)
    item.setCanGetUrl(FALSE)
  }
  if (ONLY_INTERNET) {
    item.setCanGetUrl(TRUE)
    item.setNeedEntry(FALSE)
  }
}
```

**阶段七：费率和活动计算**
```
if (Objects.nonNull(firstItem)) {
  if (SIMPLE_JOINED.equals(entryStatusSimpleEnum)) {
    // 已入职: 计算全部产品的费率和活动
    calculateProductFeeRateAndActivity(recommendItemDtoList, firstItem, channelCodeToa, userCode, channelToAProductDtoMap)
  } else {
    // 未入职: 只计算互联网产品的费率和活动
    internetList = recommendItemDtoList.stream()
      .filter(item -> INTERNET_PRODUCT.equals(item.getProductSalesType()))
      .toList()
    calculateProductFeeRateAndActivity(internetList, firstItem, channelCodeToa, userCode, channelToAProductDtoMap)
  }
}

// 费率计算:
// 1. 获取基本法长短险比例
// 2. 调用financeApiV2.getProductFeeMinMaxRate获取最高费率
// 3. maxFeeRatio = productFeeRateInfoDto.getMaxFeeRatio() * longShortRatio * 100
// 4. 保留2位小数，向下取整

// 活动计算:
// 1. 查询用户所属部门
// 2. 查询关联子费率的所有运营活动
// 3. 筛选符合条件的活动:
//    - 活动类型: 非累计加佣
//    - 活动状态: 进行中
//    - 活动时间: 在有效期内
//    - 活动范围: 指定团队(包含下级) 或 指定费率等级
//    - 排除团队: 不在排除列表中
// 4. 计算活动最高加佣比例
// 5. 填充: existActivity, activityStartTime, activityEndTime, activityMaxFeeRate
```

**关键业务规则**:
- 未登录用户使用自营渠道的模板
- 登录用户使用自己渠道的模板，未配置则使用默认模板
- 产品可见性由多个因素决定:
  - 渠道是否分配该产品
  - 产品是否可见
  - 用户入职状态
  - 用户入职牌照
  - 渠道业务规则(互联网销售规则)
- 费率展示规则:
  - 已入职: 展示"佣金最高XX%"
  - 未入职: 展示"认证拿佣金"
  - 费率为0或未配置: 不展示
- 18cps给51的互联网产品过滤规则:
  - signLicensePlate=LCBD, licensePlate=DFDD 的产品
  - 当用户同时入职乐橙和东方时不展示

---

#### 接口8: 橙芯后台查询品牌设置

**HTTP方法**: `GET`
**URL**: `/api/v1/system/jz/auth/brandConfig/get`
**方法**: `JzConfigServiceImpl.getBrandConfig`

**入参**:
- channelCode: 渠道编码 (必填)

**业务逻辑分阶段**:

**阶段一：查询品牌配置**
- 调用 channelBrandConfigGateway.selectByChannelCode(channelCode)
- SELECT FROM channel_brand_config WHERE channel_code = ?

---

#### 接口9: 保存/更新品牌设置

**HTTP方法**: `POST`
**URL**: `/api/v1/system/jz/auth/brandConfig/save`
**方法**: `JzConfigServiceImpl.brandConfig`

**入参** (ChannelBrandConfigUpdateCmd):
- channelCode: 渠道编码 (必填)
- brandName: 品牌名称
- brandLogo: 品牌Logo
- brandColor: 品牌颜色

**业务逻辑分阶段**:

**阶段一：渠道校验**
```
channelToADto = channelToAGateway.selectChannelByCode(updateCmd.getChannelCode())
Assert.notNull(channelToADto, () -> {
  throw "该渠道不存在"
})
```

**阶段二：saveOrUpdate操作**
```
other = channelBrandConfigGateway.selectByChannelCode(updateCmd.getChannelCode())
if (Objects.nonNull(other)) {
  updateCmd.setId(other.getId())
}
channelBrandConfigGateway.saveOrUpdate(updateCmd)
// 存在则UPDATE，不存在则INSERT
```

**关键业务规则**:
- 一个渠道只能有一个品牌配置
- saveOrUpdate自动判断新增或更新

---

#### 接口10: 渠道端查询品牌设置

**HTTP方法**: `GET`
**URL**: `/api/v1/system/jz/brandConfig/get`
**方法**: `JzConfigServiceImpl.getBrandConfigChannel`

**业务逻辑分阶段**:

**阶段一：设置租户上下文**
```
TenantContextHolder.setTenantCode(DEFAULT_TENANT_CODE)
```

**阶段二：查询品牌配置**
- 调用 channelBrandConfigGateway.selectByChannelCode(channelCode)

**关键业务规则**:
- 渠道端查询强制使用默认租户

---

## 三、渠道Banner管理

### 3.1 ChannelBannerController - 渠道Banner

**URL前缀**: `/api/v1/system`

#### 接口1: 查询配置

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/channelBanner/config`
**方法**: `ChannelBannerServiceImpl.getChannelBannerConfig`

**业务逻辑分阶段**:

**阶段一：查询所有Banner**
```
channelBannerConfigDtoList = channelBannerGateway.selectAll()
// SELECT FROM channel_banner
```

**阶段二：按类型分组**
```
group = channelBannerConfigDtoList.stream()
  .collect(Collectors.groupingBy(ChannelBannerDto::getType))

// 初始化所有枚举类型
for (value : ChannelBannerTypeEnum.values()) {
  if (!group.containsKey(value.getCode())) {
    map.put(value.getCode(), new ArrayList<>())
  } else {
    channelBannerDtos = group.get(value.getCode())
    channelBannerDtos.sort(Comparator.comparing(ChannelBannerDto::getSort))
    map.put(value.getCode(), channelBannerDtos)
  }
}
```

**阶段三：返回结果**
```
channelBannerConfigDto.setBannerMap(map)
return channelBannerConfigDto
```

**关键业务规则**:
- Banner类型枚举: LCYF(云服), LCYF_CHANNEL(云服渠道), H5, PC
- 按sort字段排序

---

#### 接口2: 新增Banner

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/channelBanner/add`
**方法**: `ChannelBannerServiceImpl.add`

**入参** (ChannelBannerAddCmd):
- name: Banner名称 (必填)
- type: Banner类型 (必填)
- imgUrl: 图片URL (必填)
- jumpUrl: 跳转URL
- effectType: 生效类型 (必填) - immediately/assign
- startDate: 启用时间 (指定生效时必填)

**业务逻辑分阶段**:

**阶段一：数量限制校验**
```
oldBannerList = channelBannerGateway.selectByType(addCmd.getType())
count = oldBannerList.stream()
  .filter(i -> ENABLE.equals(i.getStatus()))
  .count()
if (count + 1 > 6) {
  throw "最多支持6张启用的banner"
}
```

**阶段二：生效时间处理**
```
if (IMMEDIATELY.equals(addCmd.getEffectType())) {
  addCmd.setStartDate(LocalDateTime.now())
} else {
  Assert.notNull(addCmd.getStartDate(), () -> {
    throw "指定启用类型请指定启用时间"
  })
}
```

**阶段三：排序处理**
```
maxSort = oldBannerList.isEmpty() ? 0 : oldBannerList.getLast().getSort() + 1
addCmd.setSort(maxSort)
```

**阶段四：数据持久化**
```
channelBannerGateway.save(addCmd)
// INSERT channel_banner
```

**阶段五：返回最新Banner列表**
```
// 事务提交后查询最新数据
return getNewestBanner(addCmd.getType())
```

**关键业务规则**:
- 同一类型最多6张启用的Banner
- 立即生效: startDate = now()
- 指定生效: startDate必须提供
- sort自动设置为最大值+1

---

#### 接口3: 更新Banner

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/channelBanner/update`
**方法**: `ChannelBannerServiceImpl.modify`

**入参** (ChannelBannerUpdateCmd):
- id: Banner ID (必填)
- name: Banner名称
- imgUrl: 图片URL
- jumpUrl: 跳转URL
- effectType: 生效类型
- startDate: 启用时间
- status: 状态
- sort: 排序

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
channelBannerDto = channelBannerGateway.selectById(updateCmd.getId())
Assert.notNull(channelBannerDto, () -> {
  throw DATA_NOT_EXIST
})
```

**阶段二：生效类型变更处理**
```
// 从指定变成立即
if (ASSIGN.equals(channelBannerDto.getEffectType()) && IMMEDIATELY.equals(updateCmd.getEffectType())) {
  updateCmd.setStatus(ENABLE)
  updateCmd.setStartDate(LocalDateTime.now())
  channelBannerGateway.clearEndDate(updateCmd.getId()) // 清空结束时间
}

// 从立即变成指定
if (ASSIGN.equals(updateCmd.getEffectType()) && IMMEDIATELY.equals(channelBannerDto.getEffectType())) {
  Assert.notNull(updateCmd.getStartDate(), () -> {
    throw "指定启用类型请指定启用时间"
  })
}
```

**阶段三：状态变更数量校验**
```
count = oldBannerList.stream()
  .filter(i -> ENABLE.equals(i.getStatus()))
  .count()
if (DISABLE.equals(channelBannerDto.getStatus()) && ENABLE.equals(updateCmd.getStatus()) && count + 1 > 6) {
  throw "最多支持6张启用的banner"
}
```

**阶段四：排序变更处理**
```
if (!Objects.equals(channelBannerDto.getSort(), updateCmd.getSort())) {
  currentSort = updateCmd.getSort()
  oldBannerList.sort(Comparator.comparing(ChannelBannerDto::getSort))

  // 重新分配其他Banner的排序
  sort = currentSort == 0 ? 1 : 0
  for (old : oldBannerList) {
    if (!Objects.equals(old.getId(), updateCmd.getId())) {
      update.setId(old.getId())
      update.setSort(sort++)
      updateCmdList.add(update)
    }
    if (i == currentSort && currentSort != 0) {
      sort++
    }
  }
  channelBannerGateway.updateBatchById(updateCmdList)
}
```

**阶段五：数据更新**
```
channelBannerGateway.updateById(updateCmd)
// UPDATE channel_banner SET ... WHERE id = ?
```

**关键业务规则**:
- 从指定变立即: 自动启用并设置当前时间为启用时间，清空结束时间
- 从立即变指定: 必须提供启用时间
- 排序变更: 重新分配所有Banner的排序号，保证连续性
- 状态变更数量限制: 启用时校验不超过6张

---

#### 接口4: 删除Banner

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/channelBanner/delete/{id}`
**方法**: `ChannelBannerServiceImpl.delete`

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
channelBannerDto = channelBannerGateway.selectById(id)
Assert.notNull(channelBannerDto, () -> {
  throw DATA_NOT_EXIST
})
```

**阶段二：删除Banner**
```
channelBannerGateway.removeById(id)
// DELETE FROM channel_banner WHERE id = ?
```

**阶段三：重新排序**
```
oldBannerList = channelBannerGateway.selectByType(channelBannerDto.getType())
oldBannerList.sort(Comparator.comparing(ChannelBannerDto::getSort))

for (i = 0; i < oldBannerList.size(); i++) {
  updateCmd.setId(oldBannerList.get(i).getId())
  updateCmd.setSort(i)
  updateCmdList.add(updateCmd)
}
channelBannerGateway.updateBatchById(updateCmdList)
```

**关键业务规则**:
- 删除后自动重新排序，保证sort连续性(从0开始)

---

#### 接口5: 启禁用Banner

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/channelBanner/disable/{id}`
**方法**: `ChannelBannerServiceImpl.disable`

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
channelBannerDto = channelBannerGateway.selectById(id)
Assert.notNull(channelBannerDto, () -> {
  throw DATA_NOT_EXIST
})
```

**阶段二：状态切换**
```
updateCmd.setId(id)
updateCmd.setEndDate(LocalDateTime.now())

if (DISABLE.equals(channelBannerDto.getStatus())) {
  // 从禁用变启用
  updateCmd.setStatus(ENABLE)
  channelBannerDtos = channelBannerGateway.selectByType(channelBannerDto.getType())
  count = channelBannerDtos.stream()
    .filter(i -> ENABLE.equals(i.getStatus()))
    .count()
  if (count + 1 > 6) {
    throw "最多支持6张启用的banner"
  }
} else {
  // 从启用变禁用
  updateCmd.setStatus(DISABLE)
}
```

**阶段三：数据更新**
```
channelBannerGateway.updateById(updateCmd)
// UPDATE channel_banner SET status = ?, end_date = ? WHERE id = ?
```

**关键业务规则**:
- 启用和禁用都会更新endDate为当前时间
- 启用时校验数量限制(最多6张)
- 禁用时不校验数量

---

#### 接口6: 云服首页查询Banner

**HTTP方法**: `GET`
**URL**: `/api/v1/system/channelBanner/lcyf`
**方法**: `ChannelBannerServiceImpl.getLcyfBanner`
**限流**: `@RateLimiter(name = "outer-banner-lcyf")`

**业务逻辑分阶段**:

**阶段一：设置租户上下文**
```
TenantContextHolder.setTenantCode(DEFAULT_TENANT_CODE)
```

**阶段二：查询启用的Banner**
```
list = channelBannerGateway.selectByTypeAndEnable(LCYF.getCode())
// SELECT FROM channel_banner WHERE type = 'LCYF' AND status = 'ENABLE'
list.sort(Comparator.comparing(ChannelBannerDto::getSort))
```

**关键业务规则**:
- 对外接口需要限流保护
- 强制使用默认租户
- 只返回启用状态的Banner

---

#### 接口7: 云服渠道首页查询Banner

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/channelBanner/lcyfChannel`
**方法**: `ChannelBannerServiceImpl.getLcyfChannelBanner`

**业务逻辑分阶段**:

**阶段一：查询启用的Banner**
```
list = channelBannerGateway.selectByTypeAndEnable(LCYF_CHANNEL.getCode())
list.sort(Comparator.comparing(ChannelBannerDto::getSort))
```

---

## 四、字典管理

### 4.1 DictController - 字典管理

**URL前缀**: `/api/v1/system/auth/dict`

#### 接口1: 加载字典

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/dict/loadDict`
**方法**: `DictServiceImpl.loadDict`

**业务逻辑分阶段**:

**阶段一：查询启用的字典类型**
```
dictTypeList = dictTypeGateway.selectAllEnabled()
// SELECT FROM dict_type WHERE status = 'ENABLE'
```

**阶段二：查询启用的字典项**
```
dictItemList = dictItemGateway.selectAllEnabled()
// SELECT FROM dict_item WHERE status = 'ENABLE'
```

**阶段三：字典项按类型分组**
```
itemGroupByDictTypeCode = dictItemList.stream()
  .collect(Collectors.groupingBy(DictItemSimpleDto::getDictTypeCode))
```

**阶段四：组装完整字典结构**
```
for (dictType : dictTypeList) {
  dictType.setItemList(
    itemGroupByDictTypeCode.getOrDefault(dictType.getCode(), new ArrayList<>())
      .stream()
      .sorted(Comparator.comparing(DictItemSimpleDto::getSort))
      .toList()
  )
  map.put(dictType.getCode(), dictType)
}
```

**关键业务规则**:
- 只加载启用状态的字典类型和字典项
- 字典项按sort字段排序
- 返回Map<String, DictTypeSimpleDto>结构

---

### 4.2 字典类型管理

#### 接口1: 字典类型分页查询

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/dict/type/page`
**方法**: `DictServiceImpl.getDictTypePage`

**业务逻辑分阶段**:

**阶段一：参数扁平化**
```
paraMap = MapUtils.flat(request.getParameterMap())
```

**阶段二：分页查询**
```
return dictTypeGateway.selectPage(paraMap)
// 使用BeanSearcher进行动态查询
```

---

#### 接口2: 创建字典类型

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/dict/type/add`
**方法**: `DictServiceImpl.createDictType`

**入参** (DictTypeAddCmd):
- code: 字典编码 (必填)
- name: 字典名称 (必填)
- remark: 备注

**业务逻辑分阶段**:

**阶段一：唯一性校验**
```
checkDictTypeCreateOrUpdate(null, reqVO.getCode(), reqVO.getName())
// 校验:
// 1. 字典编码不能重复
// 2. 字典名称不能重复

Assert.isTrue(!dictTypeGateway.existsByCode(code, id), () -> {
  throw DICT_TYPE_CODE_DUPLICATE
})
Assert.isTrue(!dictTypeGateway.existsByName(name, id), () -> {
  throw DICT_TYPE_NAME_DUPLICATE
})
```

**阶段二：数据持久化**
```
return dictTypeGateway.save(reqVO)
// INSERT dict_type
```

**关键业务规则**:
- 字典编码全局唯一
- 字典名称全局唯一

---

#### 接口3: 修改字典类型

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/dict/type/update`
**方法**: `DictServiceImpl.modifyDictType`

**入参** (DictTypeUpdateCmd):
- id: 字典类型ID (必填)
- code: 字典编码 (可选)
- name: 字典名称 (可选)
- remark: 备注

**业务逻辑分阶段**:

**阶段一：唯一性校验**
```
checkDictTypeCreateOrUpdate(reqVO.getId(), reqVO.getCode(), reqVO.getName())
// 更新时排除自己进行校验
```

**阶段二：数据更新**
```
dictTypeGateway.updateById(DictAssembler.INSTANCE.convert(reqVO))
// UPDATE dict_type SET ... WHERE id = ?
```

---

#### 接口4: 删除字典类型

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/dict/type/delete`
**方法**: `DictServiceImpl.deleteDictType`

**入参**:
- id: 字典类型ID (必填)

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
dictType = checkDictTypeExists(id)
// 查询字典类型是否存在
```

**阶段二：字典项校验**
```
if (dictItemGateway.countDictItemByCode(dictType.getCode()) > 0) {
  throw DICT_TYPE_HAS_CHILDREN
}
// 如果有字典项，不允许删除
```

**阶段三：删除字典类型**
```
dictTypeGateway.removeById(id)
// DELETE FROM dict_type WHERE id = ?
```

**关键业务规则**:
- 删除字典类型前必须先删除所有字典项
- 逻辑删除(设置deleted标志)

---

### 4.3 字典项管理

#### 接口1: 字典项分页查询

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/dict/item/page`
**方法**: `DictServiceImpl.getDictItemPage`

**业务逻辑分阶段**:

**阶段一：参数扁平化**
```
paraMap = MapUtils.flat(request.getParameterMap())
```

**阶段二：分页查询**
```
return dictItemGateway.selectPage(paraMap)
```

---

#### 接口2: 新增字典项

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/dict/item/add`
**方法**: `DictServiceImpl.createDictItem`

**入参** (DictItemAddCmd):
- dictTypeCode: 字典类型编码 (必填)
- name: 字典项名称 (必填)
- value: 字典项值 (必填)
- sort: 排序 (可选)
- remark: 备注

**业务逻辑分阶段**:

**阶段一：唯一性校验**
```
checkDictItemCreateOrUpdate(null, cmd.getDictTypeCode(), cmd.getName(), cmd.getValue())
// 校验:
// 1. 同一字典类型下name不能重复
// 2. 同一字典类型下value不能重复

Assert.isTrue(!dictItemGateway.existsByNameInTheDictType(dictTypeCode, name, id), () -> {
  throw DICT_ITEM_NAME_DUPLICATE
})
Assert.isTrue(!dictItemGateway.existsByValueInTheDictType(dictTypeCode, value, id), () -> {
  throw DICT_ITEM_VALUE_DUPLICATE
})
```

**阶段二：自动排序**
```
if (Objects.isNull(cmd.getSort())) {
  maxSort = dictItemGateway.selectMaxSortInTheDictType(cmd.getDictTypeCode())
  cmd.setSort(maxSort + 1)
}
```

**阶段三：数据持久化**
```
return dictItemGateway.save(dictAssembler.convert(cmd))
// INSERT dict_item
```

**关键业务规则**:
- 同一字典类型下name唯一
- 同一字典类型下value唯一
- sort未提供时自动取当前类型下最大值+1

---

#### 接口3: 修改字典项

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/dict/item/update`
**方法**: `DictServiceImpl.modifyDictItem`

**入参** (DictItemUpdateCmd):
- id: 字典项ID (必填)
- dictTypeCode: 字典类型编码 (可选)
- name: 字典项名称 (可选)
- value: 字典项值 (可选)
- sort: 排序 (可选)

**业务逻辑分阶段**:

**阶段一：唯一性校验**
```
checkDictItemCreateOrUpdate(cmd.getId(), cmd.getDictTypeCode(), cmd.getName(), cmd.getValue())
// 更新时排除自己进行校验
```

**阶段二：数据更新**
```
dictItemGateway.updateById(DictAssembler.INSTANCE.convert(cmd))
// UPDATE dict_item SET ... WHERE id = ?
```

---

#### 接口4: 删除字典项

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/dict/item/delete`
**方法**: `DictServiceImpl.deleteDictItem`

**入参**:
- id: 字典项ID (必填)

**业务逻辑分阶段**:

**阶段一：存在性校验**
```
checkDictItemExists(id)
// 查询字典项是否存在
```

**阶段二：删除字典项**
```
dictItemGateway.removeById(id)
// DELETE FROM dict_item WHERE id = ?
```

**关键业务规则**:
- 逻辑删除(设置deleted标志)

---

## 五、关键业务规则

### 5.1 系统配置规则

| 模块 | 关键规则 |
|------|---------|
| **系统设置** | 配置编码唯一标识；直接更新无需校验 |
| **系统配置** | 配置编码全局唯一；配置内容以JSONObject存储；支持按牌照获取云服配置 |
| **牌照映射** | LCBD(乐橙保代) → SYSTEM_CONFIG_LCYF_CODE<br>DFDD(东方代代) → SYSTEM_CONFIG_DFDD_CODE<br>MS(铭盛) → SYSTEM_CONFIG_MS_CODE |

---

### 5.2 即展配置规则

#### 首页模板规则

| 规则类型 | 说明 |
|---------|------|
| **模板类型** | DEFAULT(默认): 系统预置，不可删除，不可修改名称<br>CUSTOM(自定义): 用户创建，可删除，可修改 |
| **模板删除** | DEFAULT类型不可删除<br>被渠道引用的模板不可删除<br>删除时级联删除Banner、推荐分类、推荐产品 |
| **渠道关联** | 一个渠道只能关联一个首页模板<br>未配置模板时使用系统默认模板 |

#### Banner规则

| 规则类型 | 说明 |
|---------|------|
| **Banner类型** | H5: 移动端Banner<br>PC: PC端Banner |
| **数量限制** | 同一类型最多6张启用的Banner |
| **生效类型** | immediately: 立即生效，startDate = now()<br>assign: 指定时间生效，必须提供startDate |
| **状态变更** | 从指定变立即: 自动启用，startDate = now()，清空endDate<br>从立即变指定: 必须提供startDate<br>从禁用变启用: startDate = now()<br>从启用变禁用: endDate = now() |
| **排序规则** | sort字段从0开始连续递增<br>新增: sort = maxSort + 1<br>删除: 重新分配sort保证连续性<br>更新: 重新分配其他Banner的sort |

#### 推荐产品规则

| 规则类型 | 说明 |
|---------|------|
| **产品可见性** | 渠道必须分配该产品<br>产品状态必须为可见(productStatus=1)<br>根据用户入职状态过滤 |
| **入职状态** | SIMPLE_JOINED: 已入职<br>SIMPLE_NOT_JOINED: 未入职<br>SIMPLE_JOINING: 入职中<br>SIMPLE_LEFT: 已离职 |
| **产品类型** | AGENCY_PRODUCT: 经代产品，需要入职才能展示<br>INTERNET_PRODUCT: 互联网产品，根据渠道业务规则展示 |
| **费率展示** | 已入职: "佣金最高XX%"，XX为动态计算的最高佣金比例<br>未入职: "认证拿佣金"<br>费率为0或未配置: 不展示按钮和文案 |

#### 即展首页渠道端规则

**未登录**:
- 使用自营渠道的模板
- 展示全部经代公司的产品
- 不展示按钮及任何文案

**已登录 - 已入职**:
- 使用自己渠道的模板
- 经代产品:
  - 未入职: 显示"认证拿佣金"，禁止获取链接
  - 已入职: 仅展示入职经代公司的产品，显示"佣金最高XX%"，允许获取推广链接
- 互联网产品:
  - 同时入职乐橙和东方: 过滤掉18cps给51的产品(signLicensePlate=LCBD && licensePlate=DFDD)
  - 只入职一个: 过滤掉非自己入职的经代公司的产品

**已登录 - 未入职/入职中/已离职**:
- 展示全部经代公司的产品
- 经代产品: 显示"认证拿佣金"，点击跳转入职流程
- 互联网产品:
  - 同时入职乐橙和东方: 过滤18cps给51的
  - 只有18且不支持互联网: 只展示18的产品
  - 只有51且不支持互联网: 只展示51的产品
  - 两个都没有且不支持互联网: 显示"认证拿佣金"，禁止获取链接
  - 两个都没有且仅互联网: 允许获取链接，不需要入职

#### 费率和活动计算规则

**费率计算**:
```
1. 获取基本法首年佣金子项(首年FYC，月度考核)
2. 从基本法中提取长短险比例
   - 长险: longRiskVar / 100
   - 短险: shortRiskVar / 100
3. 调用financeApiV2.getProductFeeMinMaxRate获取产品最高费率
4. maxFeeRatio = productMaxFeeRatio * longShortRatio * 100
5. 保留2位小数，向下取整(RoundingMode.DOWN)
```

**活动计算**:
```
筛选条件:
1. 活动类型: 非累计加佣(ACCUMULATED_COMMISSION)
2. 活动状态: 进行中(IN_PROGRESS)
3. 活动时间: 当前时间在活动有效期内
4. 活动范围:
   - BUSINESS_TEAM: 指定团队(包含下级)，用户部门在指定列表中
   - RATE_LEVEL: 指定费率等级，用户产品费率等级匹配
5. 排除团队: 用户部门不在排除列表中
6. 加佣方式: 比例加佣(RATIO)

计算最高加佣:
1. 遍历活动产品配置
2. 找到活动费率树的叶子节点
3. 提取所有activityFee和activityFeeList中的值
4. 取最大值作为activityMaxFeeRate
```

#### 品牌设置规则

| 规则类型 | 说明 |
|---------|------|
| **关联规则** | 一个渠道只能有一个品牌配置 |
| **saveOrUpdate** | 根据channelCode查询，存在则更新，不存在则新增 |
| **渠道端查询** | 强制使用默认租户(DEFAULT_TENANT_CODE) |

---

### 5.3 渠道Banner规则

| 规则类型 | 说明 |
|---------|------|
| **Banner类型** | LCYF: 云服首页<br>LCYF_CHANNEL: 云服渠道首页<br>H5: 移动端(适用于即展)<br>PC: PC端(适用于即展) |
| **数量限制** | 同一类型最多6张启用的Banner |
| **生效类型** | immediately: 立即生效<br>assign: 指定时间生效 |
| **状态控制** | ENABLE: 启用<br>DISABLE: 禁用<br>启禁用时更新endDate为当前时间 |
| **排序规则** | sort从0开始连续递增<br>新增、删除、更新都会重新分配sort保证连续性 |
| **对外接口** | 需要限流保护(如: outer-banner-lcyf)<br>强制使用默认租户<br>只返回启用状态的Banner |

---

### 5.4 字典管理规则

#### 字典类型规则

| 规则类型 | 说明 |
|---------|------|
| **唯一性** | 字典编码(code)全局唯一<br>字典名称(name)全局唯一 |
| **删除限制** | 必须先删除所有字典项才能删除字典类型<br>逻辑删除(设置deleted标志) |
| **状态控制** | ENABLE: 启用<br>DISABLE: 禁用<br>loadDict只加载启用状态的字典 |

#### 字典项规则

| 规则类型 | 说明 |
|---------|------|
| **唯一性** | 同一字典类型下name唯一<br>同一字典类型下value唯一 |
| **排序规则** | sort字段控制显示顺序<br>未提供sort时自动取当前类型下最大值+1 |
| **状态控制** | ENABLE: 启用<br>DISABLE: 禁用<br>loadDict只加载启用状态的字典项 |
| **删除方式** | 逻辑删除(设置deleted标志) |

---

### 5.6 远程服务调用汇总

| 服务 | 方法 | 说明 |
|------|------|------|
| **ProductServiceApi** | getProductServiceMainInfoListByIds | 批量查询产品主费率信息 |
| **ProductSalesApi** | getChannelProductsToaList | 查询渠道已分配的产品列表 |
| **ProductV2Api** | getProductBaseItem | 查询产品基础配置 |
| **FinanceApi** | getUserRelatedMeasureItemDetails | 查询用户关联的基本法子项 |
| **FinanceApiV2** | getProductFeeMinMaxRate | 查询产品费率最大值<br>getOperatorActivityInProductServiceId: 查询运营活动 |
| **SignerApi** | getEnableSignerAgentByLoginUniqueId | 查询签单员代理人信息 |

---

### 5.7 枚举类型汇总

#### 系统配置相关

| 枚举 | 值 | 说明 |
|------|----|----|
| **LicensePlateEnum** | LCBD | 乐橙保代 |
| | DFDD | 东方代代 |
| | MS | 铭盛 |
| **EnableStatusEnum** | ENABLE | 启用 |
| | DISABLE | 禁用 |

#### 即展配置相关

| 枚举 | 值 | 说明 |
|------|----|----|
| **HomePageTemplateTypeEnum** | DEFAULT | 默认模板 |
| | CUSTOM | 自定义模板 |
| **HomePageBannerTypeEnum** | H5 | 移动端Banner |
| | PC | PC端Banner |
| **ChannelBannerEffectTypeEnum** | immediately | 立即生效 |
| | assign | 指定时间生效 |
| **ChannelBannerTypeEnum** | LCYF | 云服首页 |
| | LCYF_CHANNEL | 云服渠道首页 |
| | H5 | 移动端 |
| | PC | PC端 |
| **ProductSaleTypeEnum** | AGENCY_PRODUCT | 经代产品 |
| | INTERNET_PRODUCT | 互联网产品 |
| **TeamSaleInternetRuleEnum** | NOT_SUPPORT | 不支持互联网销售 |
| | ONLY_INTERNET | 仅互联网 |
| **EntryStatusSimpleEnum** | SIMPLE_JOINED | 已入职 |
| | SIMPLE_NOT_JOINED | 未入职 |
| | SIMPLE_JOINING | 入职中 |
| | SIMPLE_LEFT | 已离职 |

#### 活动相关

| 枚举 | 值 | 说明 |
|------|----|----|
| **ActivityTypeEnum** | ACCUMULATED_COMMISSION | 累计加佣 |
| **ActivityStatusEnum** | IN_PROGRESS | 进行中 |
| **OperationActivityRangeEnum** | BUSINESS_TEAM | 指定团队 |
| | RATE_LEVEL | 指定费率等级 |
| **ActivityCommissionMethodEnum** | RATIO | 比例加佣 |

---

### 5.8 事务处理规则

| 场景 | 事务策略 |
|------|---------|
| **删除即展首页模板** | @Transactional(rollbackFor = Exception.class)<br>级联删除: 模板 → Banner → 推荐分类 → 推荐产品 |
| **更新即展首页模板详情** | @Transactional(rollbackFor = Exception.class)<br>分阶段处理: 模板名称 → Banner → 推荐分类和产品 |
| **新增/更新/删除/启禁用渠道Banner** | @Transactional(rollbackFor = Exception.class)<br>事务提交后返回最新数据(TransactionSynchronization) |
| **删除字典类型** | @Transactional(rollbackFor = Exception.class)<br>先校验字典项数量，再删除 |

---

### 5.9 权限控制

| URL前缀 | 权限要求 |
|---------|---------|
| `/api/v1/system/auth/**` | 需要登录认证 |
| `/api/v1/system/**` | 无需认证(公开接口) |
| `/api/v1/system/jz/**` | 部分需要认证，部分公开 |

**公开接口**:
- `/api/v1/system/get/{code}` - 查询系统设置
- `/api/v1/system/get/config/{code}` - 查询系统配置JSON
- `/api/v1/system/channelBanner/lcyf` - 云服首页Banner
- `/api/v1/system/jz/homePage/template/details/` - 即展首页模板详情(渠道端)
- `/api/v1/system/jz/brandConfig/get` - 渠道端查询品牌设置

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0
**参考格式**: AgreementInfoControllerV2-业务文档.md, system业务文档-人员和组织机构补充.md
**Service实现类**: `SystemSetServiceImpl`, `SystemConfigServiceImpl`, `JzConfigServiceImpl`, `ChannelBannerServiceImpl`, `DictServiceImpl`
