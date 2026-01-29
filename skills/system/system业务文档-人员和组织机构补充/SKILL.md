---
name: lcyf-system-org-supplement
description: 人员和组织机构补充模块，包括组织架构和人员信息的补充说明。当执行 java-developer 或 planner agent 需要了解此模块时激活
---

# System模块 业务逻辑详细文档补充（人员管理 & 组织机构）

## 五、人员管理

### 5.1 代理人执业信息管理 (AgentInsuranceJobController)

**URL前缀**: `/api/v1/system/auth/agentInsuranceJob`

#### 接口1: 新增保司工号

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/agentInsuranceJob/add`
**返回类型**: `CommonResult<Long>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- agentCode, supplierCode, supplierBranchCode, jobOpenType必填
- 开通类型为OPEN时:
  - jobNo必填，正则: ^[0-9a-zA-Z()\\[\\]{}#*~`-]{3,50}$
  - jobStartTime必填且必须早于当前时间
  - 错误代码: AGENT_INSURANCE_JOB_START_TIME_CHECK_FAIL

**阶段二：查询关键实体**
- 查询代理人: agentGateway.selectByCode(agentCode)
  - 获取: licenseCode, employeeCode
  - 不存在: AGENT_NOT_EXISTS
- 查询保司总公司: supplierInfoGateway.selectByCode(supplierCode)
  - 获取: supplierName, superviseCode
  - 不存在: SUPPLIER_IS_NULL
- 查询保司分支: supplierInfoGateway.selectByCode(supplierBranchCode)
  - 获取: fullName
  - 不存在: SUPPLIER_BRANCH_NOT_EXIST

**阶段三：工号开通逻辑**

**OPEN模式**:
```
insuranceJob = addCmd.getJobNo()  // 直接使用客户端工号
```

**ONLINE_OPEN模式**:
```
1. 获取云服配置(system_config)
2. 确定调用域名(根据经代公司证号)
3. 检查保司是否支持线上开通
   - 不支持: AGENT_INSURANCE_JOB_NOT_ALLOW_ONLINE_OPEN
4. 调用云服接口(lc.underwriter.agent.join):
   - 查询代理人在保司的分支机构信息
   - 获取经代公司分支信息
   - 组装业务报文
   - RSA公钥加密报文
   - 私钥签名请求
   - 发送请求到云服
   - 私钥解密响应
   - 提取underwriterJobNo
5. 异常: AGENT_INSURANCE_JOB_ONLINE_OPEN_ERROR
```

**阶段四：数据库持久化**
- 唯一性校验: selectEnableBySupplierCodeAndAgentCode()
  - 同一代理人同一保司仅一条生效
  - 重复: AGENT_INSURANCE_JOB_EXIST
- 设置默认值: jobStartTime为空→当天00:00:00
- 保存记录:
  - INSERT agent_insurance_job
  - 字段: agent_code, supplier_code, supplier_branch_code, job_no, job_open_type, job_start_time, username, password, status, remark, creator, create_time

**阶段五：关联数据更新**
- 更新代理人的工号数量:
  1. 查询该代理人所有生效工号(status=ENABLE)
  2. 统计数量
  3. 转换为简化DTO列表
  4. UPDATE agent: insuranceCount, rInsuranceJobJson
- 同步到HX系统: cxSyncToHxService.syncAgentInsuranceCompanyNo()

**关键业务规则**:
- 同一代理人同一保司仅一条生效记录
- 线上开通工号不可修改(来自云服)
- jobStartTime必须早于当前时间
- 代理人表冗余存储工号信息

---

#### 接口2: 启用/禁用保司工号

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/agentInsuranceJob/{id}`

**业务逻辑分阶段**:

**阶段一：查询记录**
- selectById(id)
- 不存在: AGENT_INSURANCE_JOB_INFO_NOT_EXIST

**阶段二：状态转换**

ENABLE→DISABLE:
```
updateCmd.setId(id)
updateCmd.setStatus(DISABLE)
updateCmd.setJobEndTime(now())
agentInsuranceJobGateway.updateById(updateCmd)
// UPDATE agent_insurance_job SET status=?, job_end_time=?
```

DISABLE状态:
- 无操作(TODO:后续支持重新启用)

**阶段三：数据变更记录**
```
changeJsons = [
  DataChangeJson(
    column: "insuranceJobStatus",
    columnName: "代理人保司工号",
    originalVal: "代理人保司工号被禁用！",
    updateVal: "代理人保司工号被禁用！"
  )
]
dataChangeRecordService.create(
  recordType: ACTION,
  event: AGENT_INFO_MODIFY,
  relatedCode: agentCode,
  changeJsons
)
```

**阶段四：同步更新**
- modifyAgentInsuranceJob(agentCode)
- cxSyncToHxService.syncAgentInsuranceCompanyNo(agentCode)

---

### 5.2 签单员管理 (SignerController)

**URL前缀**: `/api/v1/system/auth/signer`

#### 接口1: 新增签单员

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/signer/cx/add`

**入参** (SignerAgentAddCmd):
- agentCode: 代理人编码 (必填)
- channelCodeToA: 渠道ToA编码 (可选)
- channelCodeToB: 渠道ToB编码 (可选)
- deptCodeToA: 部门ToA编码 (可选)
- deptCodeTob: 部门ToB编码 (可选)

**业务逻辑分阶段**:

**阶段一：参数校验**
- channelCodeToA或channelCodeToB必选其一
  - 都为空: SIGNER_CHANNEL_TOA_AND_CHANNEL_TOB_NOT_EXIST
- deptCodeToA或deptCodeTob必选其一
  - 都为空: SIGNER_CHANNEL_TOA_AND_CHANNEL_TOB_NOT_EXIST

**阶段二：设置租户**
- setTenantCode(LoginUtil.tenantCode())

**阶段三：创建签单员**
- signerService.create(addCmd)
- INSERT signer

**关键业务规则**:
- 渠道和部门各需至少选一个
- 自动注入租户编码

---

#### 接口2: 导出签单员列表

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/signer/cx/export`

**业务逻辑分阶段**:

**阶段一：创建导出任务**
```
fileName = "签单员列表_" + now() + "_" + ObjectId.next() + ".xlsx"
exportTaskAddCmd.event = CX_SIGNER_LIST
exportTaskAddCmd.status = EXECUTING
exportTaskAddCmd.fileName = fileName
exportTaskAddCmd.userCode = LoginUtil.getUserCode()
exportTaskAddCmd.tenantCode = LoginUtil.getTenantCode()

exportTaskId = exportTaskService.create(exportTaskAddCmd)
```

**阶段二：异步导出执行**
```
lcyfTaskExecutor.execute(() -> {
  try {
    // 1. 分页查询数据(pageSize=5000)
    dataList = signerInfoGateway.selectListPage(paraMap).list

    // 2. 创建Excel文件
    excelWriter = EasyExcel.write(outputStream)
      .registerWriteHandler(LongestMatchColumnWidthStyleStrategy)
      .build()

    // 3. 写入Sheet
    sheet = EasyExcel.writerSheet(0, "签单员信息")
      .head(SignerInfoExcelDto.class)
      .build()
    excelWriter.write(signerInfoList, sheet)

    // 4. 上传OSS
    ossFile = aliOssClientV2.uploadStream(fileName, outputStream)

    // 5. 更新任务状态
    exportTaskUpdateCmd.status = SUCCESS
    exportTaskUpdateCmd.url = ossFile.url
    exportTaskService.update(exportTaskUpdateCmd)

  } catch (Exception e) {
    // 异常处理
    exportTaskUpdateCmd.status = FAILED
    exportTaskUpdateCmd.errorMsg = e.message
    exportTaskService.update(exportTaskUpdateCmd)
  }
})
```

**关键业务规则**:
- 异步执行避免超时
- 导出状态: EXECUTING → SUCCESS/FAILED
- 文件上传到OSS永久保存

---

### 5.3 推广员管理 (PromoterController)

**URL前缀**: `/api/v1/system/auth/promoter`

#### 接口1: 推广员认证申请 (即展H5端)

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/promoter/jz/apply`

**业务逻辑分阶段**:

**阶段一：设置用户信息**
- cmd.setUserCode(UserInfoContextHolder.getUserCode())

**阶段二：获取部门和团队信息**
```
userCode = cmd.userCode
dept = deptService.getUserDept(userCode)
if (dept == null) throw CHANNEL_NOT_EXIST

// 解析一级部门编码
// parentPath格式: "root_dept,parent_dept,dept_code"
deptRootCode = dept.parentPath.split(",")[2]
if (!hasText(deptRootCode)) throw CHANNEL_TOA_ROOT_NOT_EXIST
```

**阶段三：获取认证配置**
- certConfig = certConfigService.get(deptRootCode)

**阶段四：字段校验**
```
cmd.fieldValues.forEach(fieldValue -> {
  fieldDef = certConfig.findFieldDefinition(fieldValue.fieldCode)

  // 必填校验
  if (fieldDef.required && !hasText(fieldValue.value)) {
    throw FIELD_VALUE_REQUIRED
  }

  // 正则校验
  if (fieldDef.regex && !fieldValue.value.matches(fieldDef.regex)) {
    throw FIELD_VALUE_FORMAT_INVALID
  }
})
```

**阶段五：身份认证**
```
// 身份证认证
if (certConfig.idVerifyRule == ID_CARD_REQUIRED) {
  idCardCheckResp = netEasyDunApi.checkIdCard(
    idNo, name
  )
  if (idCardCheckResp.status != SUCCESS) throw ID_VERIFY_FAILED
}

// 手机号三要素认证
if (certConfig.idVerifyRule == MOBILE_THREE_ELEMENTS_REQUIRED) {
  mobileCheckResp = netEasyDunApi.checkMobileThreeElements(
    idNo, name, mobile
  )
  if (mobileCheckResp.status != SUCCESS) throw MOBILE_VERIFY_FAILED
}

// 银行卡四要素认证
if (certConfig.idVerifyRule == BANK_CARD_FOUR_CHECK_REQUIRED) {
  bankCardCheckResp = netEasyDunApi.checkBankCardFourElements(
    cardNo, name, mobile, idNo
  )
  if (bankCardCheckResp.status != SUCCESS) throw BANK_CARD_VERIFY_FAILED
}
```

**阶段六：协议签署**
```
if (certConfig.agreementSignType != null) {
  switch (certConfig.agreementSignType) {
    case PDF:
      pdf = generateAgreementPdf(...)
      signedPdf = processSignature(pdf, ...)
      break
    case HTML:
      userConfirmed = cmd.agreementConfirm == true
      if (!userConfirmed) throw AGREEMENT_NOT_CONFIRMED
      break
  }
}
```

**阶段七：白名单校验**
```
whiteListValidDto = whiteListService.queryWhiteList(...)
if (whiteListValidDto != null &&
    whiteListValidDto.type == BLACKLIST) {
  throw USER_IN_BLACKLIST
}
```

**阶段八：保存认证申请**
```
promoterSaveCmd.userCode = cmd.userCode
promoterSaveCmd.deptCode = dept.code
promoterSaveCmd.channelCode = dept.channelToACode
promoterSaveCmd.fieldValues = cmd.fieldValues
promoterSaveCmd.certStatus = PENDING
promoterSaveCmd.auditStatus = AUDITING

promoterInfoGateway.save(promoterSaveCmd)
promoterAuditService.notifyAuditRequired(userCode)
```

**关键业务规则**:
- 认证配置按一级业务团队管理
- 支持身份证/手机号/银行卡多种认证方式
- 支持PDF或HTML两种协议签署方式
- 可配置黑名单限制
- 申请后自动进入待审核状态

---

### 5.4 人员管理关键业务规则汇总

| 模块 | 关键规则 |
|------|---------|
| **代理人执业** | 同一代理人同一保司仅一条生效；线上开通工号不可修改；jobStartTime必须早于当前 |
| **签单员** | 渠道和部门各需至少选一个；支持批量替换账号；导出异步执行 |
| **推广员** | 认证配置按一级团队管理；支持多种身份认证；可配置黑名单；拒绝后可重新申请 |

---

## 六、组织机构

### 6.1 供应商管理 (SupplierInfoController)

**URL前缀**: `/api/v1/system/auth/supplier`

#### 接口1: 分页查询供应商总公司

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/supplier/page`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 将HttpServletRequest参数转换为Map
- 自动注入租户编码: LoginUtil.tenantCode()

**阶段二：强制限制级别**
- 强制设置查询级别为SUPPLIER_LEVEL_0(总公司)
- 确保不查询到下级机构

**阶段三：分页查询**
- 调用 supplierInfoService.getSupplierInfoPage(map)
- 返回 PageResult<SupplierInfoDto>

**关键业务规则**:
- 每次查询自动限制为总公司级别
- 多租户隔离(根据登录用户租户过滤)

---

#### 接口2: 查询供应商树列表

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/supplier/tree`

**入参**:
- code: 供应商编码 (必填)
- isContainRoot: 是否包含根节点 (必填)

**业务逻辑分阶段**:

**阶段一：根节点判断**
- 根据code定位要查询的供应商
- isContainRoot决定返回结果中是否包含该供应商本身

**阶段二：树形构建**
- 调用 supplierInfoService.tree(code, isContainRoot)
- 构建以指定供应商为根的树形结构

**阶段三：返回数据**
- 返回 List<SupplierSimpleInfoDto>

**树形结构示例**:
```
供应商总公司 (level=0)
├── 一级机构 (level=1)
│   ├── 二级机构 (level=2)
│   └── 二级机构 (level=2)
└── 一级机构 (level=1)
```

---

#### 接口3: 添加供应商总公司

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/supplier/add`

**必传字段** (SupplierInfoAddCmd):
- name: 简称 (NotBlank)
- fullName: 全称 (NotBlank)
- superviseCode: 银保监编码
- creditCode: 统一社会信用编码
- address: 公司地址
- type: 类型(1-保司, 2-第三方供应商)

**业务逻辑分阶段**:

**阶段一：字段默认化**
```
addCmd.setParentCode(SystemConstants.SUPPLIER_ROOT_CODE)
addCmd.setLevel(SupplierLevelEnum.SUPPLIER_LEVEL_0.getCode())
```

**阶段二：操作来源处理**
```
if (addCmd.operator == null) {
  addCmd.setOperator("供应商管理")
}
```

**阶段三：数据持久化**
- 调用 supplierInfoService.create(addCmd)
- INSERT supplier_info表

**阶段四：操作日志**
- 自动记录: 新增供应商总公司

**关键业务规则**:
- 简称与全称都必须存在且非空
- 银保监编码与社会信用编码符合国家规范
- parentCode自动设为根节点
- level强制设为0(总公司)

---

### 6.2 经代公司管理 (AgencyCompanyInfoController)

**URL前缀**: `/api/v1/system/auth/agencyCompany`

#### 接口1: 分页查询经代总公司

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/agencyCompany/page`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 接收 AgencyCompanyInfoPageQuery
- 将HttpServletRequest参数转换为Map

**阶段二：自动设置**
- 强制设置查询级别: AgencyCompanyLevelEnum.AGENCY_COMPANY_LEVEL_0(总公司)
- 注入租户编码: LoginUtil.tenantCode()

**阶段三：数据查询**
- 调用 agencyCompanyInfoService.getAgencyCompanyInfoPage(map)
- 返回分页结果

**关键业务规则**:
- 每次查询自动限制为总公司级别
- 实现租户级数据隔离

---

#### 接口2: 经代公司下的供应商关系 (总总关系)

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/agencyCompany/page/relation/supplier`

**业务逻辑分阶段**:

**阶段一：参数准备**
- 获取HttpServletRequest参数并转换为Map
- 注入租户编码

**阶段二：关系查询**
- 调用 agencyCompanyInfoService.getSupplierPageByAgencyCompanyCode()
- 返回经代公司关联的供应商总公司

**阶段三：返回结果**
- PageResult<AgencySupplierView>

**业务含义**:
- 总总关系: 经代总公司 ←→ 供应商总公司
- 一个经代总公司可关联多个供应商总公司
- 一个供应商也可被多个经代关联

---

#### 接口3: 添加经代总公司

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/agencyCompany/add`

**必传字段** (AgencyCompanyInfoAddCmd):
- superviseCode: 银保监编码 (Required)
- name: 简称 (Required)
- fullName: 全称 (NotBlank)
- level: 机构级别 (@InEnum)
- parentCode: 上级编码 (NotBlank)
- legalPerson: 法定代表人 (NotBlank)
- contactPhone: 联系人手机 (@Mobile)
- creditCode: 社会信用编码 (@CreditCode)
- businessType: 业务类型 (@InEnum)
- businessStatus: 业务合作状态 (@InEnum)
- registryStatus: 公司登记状态 (@InEnum)

**业务逻辑分阶段**:

**阶段一：参数校验**
- @Valid注解校验必填字段和枚举值
- @InEnum验证businessType, businessStatus, registryStatus

**阶段二：字段默认化**
```
addCmd.setParentCode(SystemConstants.AGENCY_COMPANY_ROOT_CODE)
addCmd.setLevel(AgencyCompanyLevelEnum.AGENCY_COMPANY_LEVEL_0)
```

**阶段三：数据持久化**
- 调用 agencyCompanyInfoService.create(addCmd)
- 保存完整的经代公司信息

**阶段四：操作日志**
- 记录: 新增经代总公司

**参数验证规则汇总**:

| 字段 | 验证规则 | 错误提示 |
|------|--------|--------|
| superviseCode | NotBlank | 银保监编码不能为空 |
| fullName | NotBlank | 经代公司名称不可为空 |
| level | InEnum(AgencyCompanyLevelEnum) | 请选择正确的机构级别 |
| parentCode | NotBlank | 请指定上级编码 |
| legalPerson | NotBlank | 请填写法定代表人 |
| contactPhone | Mobile | 联系人手机号不符合格式 |
| creditCode | CreditCode | 社会信用编码仅支持18位 |
| businessType | InEnum | 请选择业务类型 |
| businessStatus | InEnum | 请选择业务合作状态 |
| registryStatus | InEnum | 请选择公司登记状态 |

---

### 6.3 业务团队管理 (BusinessTeamController)

**URL前缀**: `/api/v1/system/auth/businessTeam`

#### 接口1: 新增一级团队

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/businessTeam/add`

**必传字段** (BusinessTeamAddCmd - Channel验证组):
- name: 团队名称 (NotBlank, Size(2-50))
- isAuditSwitch: 是否开启后台审核 (@InEnum(YesNoEnum)) (一级必传)
- auditWay: 注册审核方 (List)

**业务逻辑分阶段**:

**阶段一：参数校验**
```
if (isAuditSwitch == N) {
  // 不需要审核，清空auditWay
  businessTeamAddCmd.setAuditWay(null)
} else {
  // 需要审核，必须指定审核方
  if (CollectionUtils.isEmpty(auditWay)) {
    throw CREATE_CHANNEL_AUDIT_WAY_ERROR
  }
}
```

**阶段二：审核开关检查**
- isAuditSwitch为Y时，auditWay不能为空
- 参数不合法则报错

**阶段三：数据创建**
- 调用 businessTeamService.create(businessTeamAddCmd)
- 创建新的一级团队

**阶段四：操作日志**
- 记录: 新增一级团队

**关键验证规则**:
- isAuditSwitch只能是Y或N
- 当isAuditSwitch=Y时，auditWay不能为空
- 团队名称长度2-50个字符

---

### 6.4 渠道ToA管理 (ChannelToAController)

**URL前缀**: `/api/v1/system/auth/channelToA`

#### 接口1: 新增渠道 (即展业务端)

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/channelToA/add`

**必传字段** (ChannelToAAddCmd):
- channelName: 渠道名称 (Length(2-50))
- contactUserMobile: 渠道联系人手机 (@Mobile)
- contactUserName: 渠道联系人名称 (Length(2-50))
- licencesPlateCode: 牌照编码(多个使用',' )(NotBlank)
- licencePlateFee: 牌照费率等级设定列表 (NotEmpty, @Valid)

**业务逻辑分阶段**:

**阶段一：参数准备**
```
addCmd.setTenantCode(LoginUtil.tenantCode())
addCmd.setAppScope(ApplicationScopeEnum.BUSINESS.getCode())
addCmd.setAppCode(AppCodeEnum.JI_ZHAN.getCode())
addCmd.setAppClient(ClientTypeEnum.BUSINESS.getCode())
```

**阶段二：自动赋值**
- 租户编码: 自动注入
- 应用范围: 业务端
- 应用编码: 即展
- 应用客户端: 业务

**阶段三：数据创建**
- 调用 channelToAService.createV2(addCmd)
- 创建新渠道

**阶段四：关联创建**
- 自动创建渠道用户关系
- 创建基础费率记录

---

### 6.5 组织机构关键业务规则汇总

**层级结构**:
```
供应商: 0级(总公司) - 1~5级(分支机构)
经代公司: 0级(总公司) - 1~5级(分支机构)
业务团队: 一级(对应渠道) - 下级(多级支持)
```

**多对多关系**:
```
经代 ←→ 供应商
├─ 总总: 经代总公司 ←→ 供应商总公司
├─ 总分: 经代总公司 ←→ 供应商分支
└─ 分分: 经代分支 ←→ 供应商分支

牌照 ←→ 渠道 (一对多)
└─ 一个牌照可关联多个渠道
```

**权限控制**:
- @SaCheckPermission 权限检查
- @EnableDataPermission 数据权限检查
- LoginUtil 自动注入租户等上下文
- 多租户隔离: 查询时自动注入租户编码

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0 (补充版 - 人员管理 & 组织机构)
**参考格式**: AgreementInfoControllerV2-业务文档.md

