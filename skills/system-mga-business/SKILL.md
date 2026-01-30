---
name: mga-business
description: |
  【模块定位】MGA业务模块

  【支持的代理】
  - java-developer: 实现MGA业务功能
  - planner: 规划MGA体系

  【触发关键词】
  MGA、mga、业务

  【必须调用】
  java-developer: 任务涉及"MGA"、"MGA业务" → MUST
  planner: 规划"MGA集成"、"MGA业务方案" → MUST
---

# System模块 MGA业务详细文档

**Controller路径**: `/api/v1/system/auth/mga*`
**负责人**: zhouyuhang
**创建时间**: 2025-01-17

---

## 目录

- [一、MGA业务概述](#一mga业务概述)
- [二、MGA代理人管理](#二mga代理人管理)
- [三、MGA代理人执业信息管理](#三mga代理人执业信息管理)
- [四、MGA经代供应商渠道关系管理](#四mga经代供应商渠道关系管理)
- [五、关键业务规则](#五关键业务规则)

---

## 一、MGA业务概述

### 1.1 MGA业务定义

**MGA (Managing General Agent)** 是一种特殊的代理人模式，与普通代理人的主要区别：

| 维度 | 普通代理人 | MGA代理人 |
|------|-----------|-----------|
| 所属关系 | 归属于经代公司 | 归属于渠道（第三方机构） |
| 组织结构 | 在经代公司组织架构下 | 独立于经代公司组织架构 |
| 入职流程 | 直接入职经代公司 | 先建立渠道关系，再入职保司 |
| 管理方式 | 经代公司直接管理 | 渠道管理，经代公司间接管理 |
| 执业关系 | 经代公司 → 保司 | 渠道 → 经代公司 → 保司（三方关系）|

### 1.2 核心业务实体关系

```
渠道ToB (Channel)
    ↓ (关联)
渠道牌照 (License) + 经代公司 (Agency) + 保司 (Supplier)
    ↓ (总总关系 ZZ)
牌照分支 + 经代分支 + 保司分支
    ↓ (分分关系 FF)
MGA代理人 (MgaAgent)
    ↓ (入职)
保司工号 (MgaAgentInsuranceJob)
```

### 1.3 关系层级说明

**总总关系 (ZZ - 总公司对总公司)**:
- 渠道ToB ←→ 渠道牌照(总公司) ←→ 经代公司(总公司) ←→ 保司(总公司)
- 必须先建立总总关系，才能建立分分关系

**分分关系 (FF - 分支对分支)**:
- 基于总总关系，建立分支机构之间的关联
- 渠道牌照分支 ←→ 经代公司分支 ←→ 保司分支
- MGA代理人必须归属于某个分分关系

---

## 二、MGA代理人管理

**Controller**: `MgaAgentController`
**URL前缀**: `/api/v1/system/auth/mgaAgent`

### 2.1 分页查询MGA代理人

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/page`
**返回类型**: `PageResult<MgaAgentDto>`

#### 业务逻辑分阶段

**阶段一：参数处理**
- 扁平化HttpServletRequest参数为Map
- 自动注入租户编码：LoginUtil.tenantCode()

**阶段二：保司过滤查询（可选）**
```
if (query.supplierCode != null) {
  // 1. 查询该保司下所有生效工号的代理人编码
  agentCodes = mgaAgentInsuranceJobGateway
    .selectAgentCodeBySupplierCode(supplierCode, supplierBranchCode, ENABLE)
    .map(dto -> dto.agentCode)
    .toSet()

  // 2. 如果没有代理人，返回空
  if (isEmpty(agentCodes)) return PageResult.empty()

  // 3. 移除保司过滤条件，改用代理人编码IN查询
  paraMap.remove("supplierCode")
  paraMap.remove("supplierBranchCode")
  paraMap = MapUtils.builder(paraMap)
    .field(AgentDto::getCode, agentCodes)
    .op(InList.class)
    .build()
}
```

**阶段三：分页查询**
- 调用 mgaAgentGateway.selectPage(paraMap)

**阶段四：填充关联数据**
```
fillName(list):
  // 1. 批量查询渠道名称
  channelCodes = list.map(dto -> dto.channelCodeToB).toSet()
  channelNameMap = channelToBGateway.selectByCodeSet(channelCodes)
    .toMap(code -> name)

  // 2. 批量查询牌照、分支、经代公司名称
  licenseCodes = list.map(dto -> [
    dto.licenseCode,
    dto.branchCode,
    dto.agencyCode
  ]).flatten().toSet()
  licenseNameMap = agencyCompanyInfoGateway
    .selectListByCode(licenseCodes)
    .toMap(code -> fullName)

  // 3. 批量查询代理人入职保司数量
  agentCodes = list.map(dto -> dto.code).toSet()
  agentInsuranceJobMap = mgaAgentInsuranceJobGateway
    .selectByAgentCode(agentCodes, ENABLE)
    .groupBy(dto -> dto.agentCode)

  // 4. 回填数据
  list.forEach(item -> {
    item.channelNameToB = channelNameMap.get(item.channelCodeToB)
    item.licenseName = licenseNameMap.get(item.licenseCode)
    item.branchName = licenseNameMap.get(item.branchCode)
    item.agencyName = licenseNameMap.get(item.agencyCode)
    item.agentInsuranceJobCount = agentInsuranceJobMap
      .get(item.code).size()
  })
```

**关键业务规则**:
- 支持按保司工号反向查询MGA代理人
- 自动统计代理人入职保司数量
- 多租户数据隔离

---

### 2.2 导出MGA代理人

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/export`
**返回类型**: `Boolean`

#### 业务逻辑分阶段

**阶段一：创建导出任务**
```
fileName = "MGA代理人列表_" + now() + "_" + ObjectId.next() + ".xlsx"
exportTaskAddCmd = ExportTaskAddCmd.builder()
  .event(CX_MGA_AGENT_LIST)
  .status(EXECUTING)
  .fileName(fileName)
  .userCode(LoginUtil.getUserCode())
  .tenantCode(LoginUtil.getTenantCode())
  .build()

exportTaskId = exportTaskService.create(exportTaskAddCmd)
```

**阶段二：异步导出执行**
```
lcyfTaskExecutor.execute(() -> {
  MDCUtil.putAll(contextMap) // 传递MDC上下文

  try {
    // 1. 分页查询数据(pageSize=5000)
    dataList = mgaAgentGateway.selectListPage(paraMap).list

    // 2. 填充关联信息
    fillName(dataList)

    // 3. 脱敏处理
    exportList = dataList.map(dto -> {
      exportVo = assembler.convertExportVo(dto)
      // 脱敏姓名、身份证、手机号
      exportVo.name = sensitiveProcessor.idCardChineseName(dto.name)
      exportVo.idNo = sensitiveProcessor.idCard(dto.idNo)
      exportVo.mobile = sensitiveProcessor.mobilePhone(dto.mobile)
      return exportVo
    })

    // 4. 查询保司工号信息
    agentCodes = exportList.map(vo -> vo.code).toSet()
    jobList = mgaAgentInsuranceJobGateway
      .selectByAgentCode(agentCodes, ENABLE)
    jobMap = jobList.groupBy(dto -> dto.agentCode)

    // 5. 组装导出数据（含保司工号列表）
    exportList.forEach(vo -> {
      jobs = jobMap.get(vo.code)
      vo.insuranceCompanies = jobs.map(job ->
        InsuranceCompanyInfoExportVo.builder()
          .supplierName(job.supplierName)
          .supplierBranchName(job.supplierBranchName)
          .jobNo(job.jobNo)
          .build()
      )
    })

    // 6. 创建Excel文件
    excelWriter = EasyExcel.write(outputStream)
      .registerWriteHandler(LongestMatchColumnWidthStyleStrategy)
      .registerWriteHandler(HorizontalCellStyleStrategy) // 样式策略
      .build()

    // 7. 写入Sheet
    sheet = EasyExcel.writerSheet(0, "MGA代理人信息")
      .head(MgaAgentExportVo.class)
      .build()
    excelWriter.write(exportList, sheet)

    // 8. 上传OSS
    ossFile = aliOssClientV2.uploadStream(fileName, outputStream)

    // 9. 更新任务状态
    exportTaskUpdateCmd.status = SUCCESS
    exportTaskUpdateCmd.url = ossFile.url
    exportTaskService.update(exportTaskUpdateCmd)

  } catch (Exception e) {
    log.error("导出失败", e)
    exportTaskUpdateCmd.status = FAILED
    exportTaskUpdateCmd.errorMsg = e.message
    exportTaskService.update(exportTaskUpdateCmd)
  }
})
```

**关键业务规则**:
- 异步导出避免超时
- 导出数据脱敏处理
- 包含代理人的所有保司工号信息
- 导出状态：EXECUTING → SUCCESS/FAILED
- 文件上传到OSS永久保存

---

### 2.3 MGA代理人详情

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/details`
**返回类型**: `MgaAgentDto`

#### 业务逻辑分阶段

**阶段一：查询代理人**
- mgaAgentGateway.selectById(id)

**阶段二：填充关联信息**
- 调用 fillName(mgaAgentDto)
- 填充：渠道名称、牌照名称、分支名称、经代名称、入职保司数量

---

### 2.4 新增MGA代理人

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mgaAgent/add`
**返回类型**: `Long` (代理人ID)

#### 业务逻辑分阶段

**阶段一：渠道校验**
```
channelToBDto = channelToBGateway.selectByCode(addCmd.channelCodeToB)
if (channelToBDto == null) {
  throw MGA_CHANNEL_NOT_EXIST
}
addCmd.setChannelNameToB(channelToBDto.channelName)
```

**阶段二：总总关系校验**
```
// 查询渠道+经代公司+牌照 三方总总关系
mgaAgencySupplierChannelRelDtos = mgaAgencySupplierChannelRelGateway
  .selectByAgencyChannelCode(
    addCmd.channelCodeToB,
    addCmd.agencyCode,
    addCmd.licenseCode
  )

if (isEmpty(mgaAgencySupplierChannelRelDtos)) {
  throw MGA_CHANNEL_AGENCY_NOT_EXIST // 当前中介机构未与渠道建立关联
}
```

**阶段三：分分关系校验**
```
// 查询牌照分支+经代分支+保司分支 三方分分关系
parentIdList = mgaAgencySupplierChannelRelDtos.map(dto -> dto.id)
mgaAgencySupplierChannelRelDtoList = mgaAgencySupplierChannelRelGateway
  .selectBranchListByParentId(parentIdList)

// 检查代理人的分支编码是否在分分关系中
branchCodeList = mgaAgencySupplierChannelRelDtoList
  .map(dto -> dto.branchChannelLicenseCode)

if (isEmpty(branchCodeList) || !branchCodeList.contains(addCmd.branchCode)) {
  throw MGA_CHANNEL_AGENCY_NOT_EXIST
}
```

**阶段四：代理人唯一性校验**
```
// 1. 检查该身份证号是否已是普通代理人（未离职）
agentDtoList = agentGateway.selectListByIdNo(addCmd.idNo)
  .filter(item -> item.entryStatus != SEPARATED)

if (!isEmpty(agentDtoList)) {
  throw MGA_ID_NO_EXIST // 当前MGA代理人为我司代理人，不可重复入职
}

// 2. 检查该身份证号+牌照分支+经代 是否已是MGA代理人（未离职）
mgaAgentDtos = mgaAgentGateway.selectListByIdNoLicenseAgencyCode(
  addCmd.idNo,
  addCmd.branchCode,
  addCmd.agencyCode
).filter(item -> item.entryStatus != SEPARATED)

if (!isEmpty(mgaAgentDtos)) {
  throw MGA_AGENT_EXIST // 当前MGA代理人信息已存在，不可重复入职
}
```

**阶段五：处理重新入职**
```
// 查询该身份证号+牌照分支+经代 下的已离职MGA代理人
resignList = mgaAgentGateway.selectListByIdNoLicenseAgencyCode(
  addCmd.idNo,
  addCmd.branchCode,
  addCmd.agencyCode
).filter(item -> item.entryStatus == SEPARATED)

// 删除历史离职记录（重新入职会创建新记录）
if (!isEmpty(resignList)) {
  mgaAgentGateway.removeByIds(resignList.map(dto -> dto.id))
}
```

**阶段六：生成代理人编码**
```
agentCode = "MGA" + IdUtil.getSnowflakeNextIdStr()
addCmd.setCode(agentCode)
```

**阶段七：自动解析身份证信息**
```
// 1. 解析生日
birthday = LocalDate.parse(
  addCmd.idNo.substring(6, 14),
  DateTimeFormatter.ofPattern("yyyyMMdd")
)
addCmd.setBirthday(birthday)

// 2. 解析性别（第17位：奇数=男，偶数=女）
sexCode = Integer.parseInt(addCmd.idNo.substring(16, 17))
sex = sexCode % 2 == 1 ? SexEnum.MALE : SexEnum.FEMALE
addCmd.setSex(sex.code)
```

**阶段八：保存代理人**
- mgaAgentGateway.save(addCmd)
- 返回新生成的代理人ID

**关键业务规则**:
- MGA代理人编码格式：MGA + 雪花ID
- 必须先建立渠道-经代-牌照的总总关系和分分关系
- MGA代理人不能同时是普通代理人
- 同一身份证+牌照分支+经代只能有一条在职记录
- 重新入职会删除历史离职记录
- 自动从身份证号解析生日和性别

---

### 2.5 编辑MGA代理人

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgent/update`

#### 业务逻辑分阶段

**阶段一：查询代理人**
```
mgaAgentDto = mgaAgentGateway.selectById(updateCmd.id)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段二：更新代理人**
- mgaAgentGateway.updateById(updateCmd)

**阶段三：记录数据变更**
```
changeJsons = dataChangeRecordService.compare(updateCmd, mgaAgentDto)
dataChangeRecordService.create(
  recordType: COMPARE,
  event: MGA_AGENT_INFO_MODIFY,
  relatedCode: mgaAgentDto.code,
  changeJsons: changeJsons
)
```

**关键业务规则**:
- 所有字段变更都会记录到数据变更表
- 使用对比方式记录变更（自动比对修改前后差异）

---

### 2.6 MGA代理人离职

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgent/resign/{id}`

#### 业务逻辑分阶段

**阶段一：查询代理人**
```
mgaAgentDto = mgaAgentGateway.selectById(id)
if (mgaAgentDto == null || mgaAgentDto.entryStatus != JOINED) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段二：禁用所有保司工号**
```
updateCmd = MgaAgentInsuranceJobUpdateCmd.builder()
  .status(DISABLE)
  .jobEndTime(now())
  .build()

mgaAgentInsuranceJobGateway.updateByAgentCode(
  mgaAgentDto.code,
  updateCmd
)

// 记录工号禁用日志
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
  event: MGA_AGENT_INFO_MODIFY,
  relatedCode: mgaAgentDto.code,
  changeJsons: changeJsons
)
```

**阶段三：更新代理人离职状态**
```
resignCmd = MgaAgentUpdateCmd.builder()
  .id(id)
  .entryStatus(SEPARATED)
  .resignationTime(now())
  .build()

mgaAgentGateway.updateById(resignCmd)

// 记录离职日志
dataChangeRecordService.create(
  recordType: COMPARE,
  event: MGA_AGENT_INFO_MODIFY,
  relatedCode: mgaAgentDto.code,
  changeJsons: compare(resignCmd, mgaAgentDto)
)
```

**关键业务规则**:
- 离职时自动禁用该代理人的所有保司工号
- 保司工号的jobEndTime设为当前时间
- 代理人状态变更为SEPARATED（已离职）
- 记录resignationTime（离职时间）
- 离职操作分两次记录数据变更日志

---

### 2.7 批量离职MGA代理人

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgent/resign/batch`

#### 业务逻辑分阶段

- 遍历ID列表，逐个调用单个离职接口
- `ids.forEach(id -> resign(id))`

---

### 2.8 导入MGA代理人

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mgaAgent/import`
**返回类型**: `CommonResult<Object>` (成功返回null，失败返回错误信息)

#### 业务逻辑分阶段

**阶段一：解析Excel文件**
```
mgaAgentImportReadListener = new MgaAgentImportReadListener(this)
EasyExcel.read(file.inputStream, MgaAgentImportDto.class, listener)
  .ignoreEmptyRow(true)
  .sheet()
  .doRead()
```

**阶段二：校验导入数据**
```
// 在监听器中逐行校验
buildAgentAddCmd(data, rowErrorMsg, rowIndex):
  // 1. 校验该身份证号是否已是普通代理人
  agentDtoList = agentGateway.selectListByIdNo(data.idNo)
    .filter(item -> item.entryStatus != SEPARATED)
  if (!isEmpty(agentDtoList)) {
    throw MGA_ID_NO_EXIST(rowIndex + "行，")
  }

  // 2. 查询牌照分支机构
  if (!hasText(data.branchSuperviseCode)) {
    rowErrorMsg.add(rowIndex + "行-MGA渠道分支银保监机构编号为空")
  } else {
    branchInfoDto = agencyCompanyInfoGateway
      .selectBySuperviseCode(data.branchSuperviseCode)
    if (branchInfoDto == null) {
      rowErrorMsg.add(rowIndex + "行-MGA渠道分支银保监机构编号在系统中未找到")
    } else {
      addCmd.branchCode = branchInfoDto.code
      addCmd.licenseCode = branchInfoDto.parentCode
    }
  }

  // 3. 查询经代公司
  if (!hasText(data.agencySuperviseCode)) {
    rowErrorMsg.add(rowIndex + "行-经代公司机构银保监编码为空")
  } else {
    agencyCompanyInfoDto = agencyCompanyInfoGateway
      .selectBySuperviseCode(data.agencySuperviseCode)
    if (agencyCompanyInfoDto == null) {
      rowErrorMsg.add(rowIndex + "行-经代公司机构银保监编码在系统中未找到")
    } else {
      addCmd.agencyCode = agencyCompanyInfoDto.code
    }
  }

  // 4. 检查MGA代理人是否已存在（未离职）
  if (hasText(addCmd.idNo) && hasText(addCmd.branchCode)
      && hasText(addCmd.agencyCode)) {
    mgaAgentDtos = mgaAgentGateway.selectListByIdNoLicenseAgencyCode(
      addCmd.idNo, addCmd.branchCode, addCmd.agencyCode
    ).filter(item -> item.entryStatus != SEPARATED)

    if (!isEmpty(mgaAgentDtos)) {
      throw MGA_AGENT_EXIST(rowIndex + "行，")
    }

    // 标记离职记录待删除
    resignList = mgaAgentDtos.filter(item -> item.entryStatus == SEPARATED)
    if (!isEmpty(resignList)) {
      addCmd.agentIds = resignList.map(dto -> dto.id)
    }
  }

  // 5. 校验总总关系和分分关系
  if (hasText(addCmd.channelCodeToB) && hasText(addCmd.agencyCode)
      && hasText(addCmd.licenseCode)) {
    mgaAgencySupplierChannelRelDtos = mgaAgencySupplierChannelRelGateway
      .selectByAgencyChannelCode(
        addCmd.channelCodeToB,
        addCmd.agencyCode,
        addCmd.licenseCode
      )

    if (isEmpty(mgaAgencySupplierChannelRelDtos)) {
      rowErrorMsg.add(rowIndex + "行-" +
        MGA_CHANNEL_AGENCY_NOT_EXIST.msg)
    } else if (hasText(addCmd.branchCode)) {
      // 校验分分关系
      parentIdList = mgaAgencySupplierChannelRelDtos.map(dto -> dto.id)
      branchRelDtoList = mgaAgencySupplierChannelRelGateway
        .selectBranchListByParentId(parentIdList)

      branchCodeList = branchRelDtoList
        .map(dto -> dto.branchChannelLicenseCode)

      if (!branchCodeList.contains(addCmd.branchCode)) {
        rowErrorMsg.add(rowIndex + "行-" +
          MGA_BRANCH_CHANNEL_AGENCY_NOT_EXIST.msg)
      }
    }
  }

  // 6. 无错误时生成代理人编码和解析身份证
  if (isEmpty(rowErrorMsg)) {
    addCmd.code = "MGA" + IdUtil.getSnowflakeNextIdStr()
    addCmd.birthday = LocalDate.parse(
      addCmd.idNo.substring(6, 14),
      DateTimeFormatter.ofPattern("yyyyMMdd")
    )
    sexCode = Integer.parseInt(addCmd.idNo.substring(16, 17))
    addCmd.sex = sexCode % 2 == 1 ? MALE : FEMALE
  }

  // 7. JSR303参数校验
  ValidatorFactory factory = Validation.buildDefaultValidatorFactory()
  Validator validator = factory.getValidator()
  violations = validator.validate(addCmd)
  violations.forEach(violation ->
    rowErrorMsg.add(rowIndex + "行-" + violation.message)
  )

  return addCmd
```

**阶段三：收集错误信息**
```
errorList = listener.getErrorMsg()
if (!isEmpty(errorList)) {
  // 返回所有错误信息（换行分隔）
  return String.join("\r\n", errorList)
}
```

**阶段四：批量保存代理人**
```
// 1. 删除历史离职记录
removeIds = listener.successMap.values()
  .flatMap(cmd -> cmd.agentIds)
  .toList()

if (!isEmpty(removeIds)) {
  mgaAgentGateway.removeByIds(removeIds)
}

// 2. 批量插入新代理人
addCmdList = listener.successMap.values()
if (isEmpty(addCmdList)) {
  throw MGA_IMPORT_EMPTY_DATA
}

mgaAgentGateway.saveBatch(addCmdList)
```

**关键业务规则**:
- 导入模板字段：姓名、身份证、手机号、渠道分支银保监编号、经代公司银保监编号等
- 逐行校验，收集所有错误信息一次性返回
- 使用银保监编码查询机构（不使用机构编码）
- 重新入职时删除历史离职记录
- 所有校验通过后才批量保存
- 导入失败时回滚整个事务

---

### 2.9 导出MGA代理人模板

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/export/template`

#### 业务逻辑分阶段

**阶段一：加载地区树数据**
```
if (areaTreeList == null) {
  areaTreeNode = aliOssClientV2.getObject("system/area/area_tree.json")
  areaTreeList = objectMapper.readValue(
    areaTreeNode.toString(),
    new TypeReference<ArrayNode>() {}
  )
}
```

**阶段二：创建Excel模板**
```
response.setContentType("application/vnd.ms-excel")
response.setCharacterEncoding("utf-8")
fileName = URLEncoder.encode(
  "MGA代理人导入模板",
  StandardCharsets.UTF_8
)
response.setHeader("Content-disposition",
  "attachment;filename=" + fileName + ".xlsx")

// 创建ExcelWriter
excelWriter = EasyExcel.write(response.outputStream)
  .registerWriteHandler(LongestMatchColumnWidthStyleStrategy)
  .registerWriteHandler(HorizontalCellStyleStrategy)
  .registerWriteHandler(SelectCellWriteHandler) // 下拉框处理器
  .build()

// 写入Sheet
sheet = EasyExcel.writerSheet(0, "MGA代理人信息")
  .head(MgaAgentImportDto.class)
  .build()

excelWriter.write(Collections.emptyList(), sheet)
excelWriter.finish()
```

**阶段三：设置下拉框（SelectCellWriteHandler）**
```
// 性别下拉框
sexOptions = ["男", "女"]

// 学历下拉框
educationOptions = EducationEnum.values().map(e -> e.desc)

// 代理人级别下拉框
agentLevelOptions = AgentLevelEnum.values().map(e -> e.desc)

// 代理人性质下拉框
workNatureOptions = WorkNatureEnum.values().map(e -> e.desc)

// 代理人资质下拉框
agentQualityOptions = AgentQualityEnum.values().map(e -> e.desc)

// 户籍地址下拉框（三级联动）
provinceOptions = areaTreeList.map(node -> node.get("label"))
cityOptions = areaTreeList.flatMap(node ->
  node.get("children").map(child -> child.get("label"))
)
districtOptions = areaTreeList.flatMap(node ->
  node.get("children").flatMap(child ->
    child.get("children").map(grandchild -> grandchild.get("label"))
  )
)
```

**关键业务规则**:
- 模板包含下拉框约束，避免导入数据格式错误
- 地区数据从OSS加载（缓存到内存）
- 下拉框使用描述值（如"男"），导入时转换为编码

---

### 2.10 查询账号关联的MGA代理人

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/account/query`
**返回类型**: `List<AgentDto>`

#### 业务逻辑分阶段

**阶段一：查询账号关联关系**
```
mgaAgentLoginRelDtos = mgaAgentLoginRelGateway
  .selectByLoginUniqueId(loginUniqueId)
```

**阶段二：查询MGA代理人信息**
```
if (isEmpty(mgaAgentLoginRelDtos)) {
  return emptyList()
}

agentCodes = mgaAgentLoginRelDtos.map(dto -> dto.agentCode)
agentDtoList = mgaAgentGateway.selectByCodeSet(agentCodes)

return agentDtoList
```

---

### 2.11 查询账号可关联的MGA代理人

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/account/related/page`
**返回类型**: `PageResult<MgaAgentDto>`

#### 业务逻辑分阶段

**阶段一：参数校验**
```
if (!hasText(query.channelCodeToB)) {
  return error(500, "渠道编码不能为空")
}
```

**阶段二：查询可关联的代理人**
```
// 1. 查询该渠道下的所有MGA代理人
paraMap.put("channelCodeToB", query.channelCodeToB)
mgaAgentDtoPage = mgaAgentGateway.selectPage(paraMap)

// 2. 过滤已关联的代理人（可选）
// 通常前端会传递loginUniqueId，用于过滤已关联的代理人

return mgaAgentDtoPage
```

---

### 2.12 关联MGA代理人

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mgaAgent/loginRel/add`

#### 业务逻辑分阶段

**阶段一：查询账号信息**
```
userInfoDto = userInfoGateway.selectByLoginUniqueId(addCmd.loginUniqueId)
if (userInfoDto == null) {
  throw USER_NOT_EXIST
}
```

**阶段二：查询MGA代理人**
```
mgaAgentDto = mgaAgentGateway.selectByCode(addCmd.agentCode)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段三：渠道匹配校验**
```
// 查询账号所属渠道
channelUserRels = channelUserRelGateway.selectByUserCode(userInfoDto.userCode)
userChannelCodes = channelUserRels.map(rel -> rel.channelCode).toSet()

// 校验MGA代理人的渠道是否匹配
if (!userChannelCodes.contains(mgaAgentDto.channelCodeToB)) {
  throw MGA_AGENT_CHANNEL_NOT_MATCH // 当前MGA代理人和账号所属渠道不匹配
}
```

**阶段四：唯一性校验**
```
existingRel = mgaAgentLoginRelGateway.selectByLoginUniqueId(
  addCmd.loginUniqueId
)

if (!isEmpty(existingRel)) {
  throw MGA_AGENT_REL_ALREADY_EXISTS // 当前账号已关联MGA代理人
}
```

**阶段五：创建关联关系**
```
mgaAgentLoginRelGateway.save(addCmd)
```

**关键业务规则**:
- 一个账号只能关联一个MGA代理人
- 账号和MGA代理人必须属于同一渠道
- 账号必须存在且有效

---

### 2.13 解除关联MGA代理人

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgent/loginRel/delete`

#### 业务逻辑分阶段

**阶段一：查询关联关系**
```
existingRel = mgaAgentLoginRelGateway.selectByLoginUniqueId(
  delCmd.loginUniqueId
)

if (isEmpty(existingRel)) {
  throw MGA_AGENT_REL_NOT_EXISTS
}
```

**阶段二：删除关联关系**
```
mgaAgentLoginRelGateway.removeByLoginUniqueId(delCmd.loginUniqueId)
```

---

### 2.14 云服渠道端MGA代理人分页查询

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/lcyf/page`
**返回类型**: `PageResult<MgaAgentLcyfView>`

#### 业务逻辑分阶段

**阶段一：参数处理**
```
objectMap = MapUtils.flat(request.getParameterMap())
objectMap.put("tenantCode", LoginUtil.tenantCode())
objectMap.put("channelCodeToB", LoginUtil.channelCode()) // 自动过滤当前登录渠道
```

**阶段二：分页查询**
```
pageResult = mgaAgentGateway.selectPageLcyf(objectMap, query)
```

**关键业务规则**:
- 自动过滤当前登录渠道的MGA代理人
- 用于云服渠道端展示自己渠道的MGA代理人

---

### 2.15 查询云服MGA代理人详情

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgent/get/lcyf/details`
**返回类型**: `MgaAgentUserDto`

#### 业务逻辑分阶段

**阶段一：查询MGA代理人**
```
mgaAgentDto = mgaAgentGateway.selectById(id)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段二：查询关联的账号信息**
```
mgaAgentLoginRel = mgaAgentLoginRelGateway.selectByAgentCode(
  mgaAgentDto.code
)

if (mgaAgentLoginRel != null) {
  userInfoDto = userInfoGateway.selectByLoginUniqueId(
    mgaAgentLoginRel.loginUniqueId
  )
}
```

**阶段三：组装返回数据**
```
mgaAgentUserDto = MgaAgentUserDto.builder()
  .mgaAgent(mgaAgentDto)
  .userInfo(userInfoDto)
  .build()

return mgaAgentUserDto
```

**关键业务规则**:
- 返回MGA代理人信息和关联的账号信息
- 用于云服渠道端查看MGA代理人详情

---

## 三、MGA代理人执业信息管理

**Controller**: `MgaAgentInsuranceJobController`
**URL前缀**: `/api/v1/system/auth/mgaAgentInsuranceJob`

### 3.1 分页查询保司工号

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/page`
**返回类型**: `PageResult<MgaAgentInsuranceJobDto>`

#### 业务逻辑分阶段

**阶段一：分页查询**
```
paraMap = MapUtils.flat(request.getParameterMap())
pageResult = mgaAgentInsuranceJobGateway.selectPage(paraMap)
```

**阶段二：填充关联信息**
```
list = pageResult.list

// 1. 批量查询保司分支机构名称
branchCodes = list.map(dto -> dto.supplierBranchCode)
branchCodeMap = supplierInfoGateway.selectByCodeSet(branchCodes)
  .toMap(code -> SupplierInfoDto)

// 2. 批量查询创建人姓名
userIds = list.map(dto -> Long.parseLong(dto.creator))
userInfoMap = userInfoGateway.selectTenantIgnoreUserListByIds(userIds)
  .toMap(id -> UserInfoDto)

// 3. 回填数据
list.forEach(item -> {
  supplierInfoDto = branchCodeMap.get(item.supplierBranchCode)
  if (supplierInfoDto != null) {
    item.supplierBranchName = supplierInfoDto.fullName
    item.supplierName = supplierInfoDto.parentName
    item.areaSchema = supplierInfoDto.areaSchema
  }
  item.creatorName = userInfoMap.get(Long.parseLong(item.creator)).nickName
})
```

---

### 3.2 保司工号详情

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/{id}`
**返回类型**: `MgaAgentInsuranceJobDto`

#### 业务逻辑分阶段

- mgaAgentInsuranceJobGateway.selectById(id)

---

### 3.3 新增保司工号

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/add`

#### 业务逻辑分阶段

**阶段一：MGA代理人校验**
```
mgaAgentDto = mgaAgentGateway.selectByCode(addCmd.agentCode)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段二：唯一性校验**
```
// 同一代理人同一保司仅能有一条生效记录
exists = mgaAgentInsuranceJobGateway.existsByAgentAndSupplierCode(
  addCmd.agentCode,
  addCmd.supplierCode,
  EnableStatusEnum.ENABLE
)

if (exists) {
  throw MGA_AGENT_INSURANCE_JOB_EXIST // mga代理人已存在该保司，不可重复入职
}
```

**阶段三：总总关系校验**
```
// 检查代理人入职牌照+经代公司+保司是否有总总关系
mgaAgencySupplierChannelRelDto = mgaAgencySupplierChannelRelGateway
  .selectRelationByAllCode(
    mgaAgentDto.channelCodeToB,
    mgaAgentDto.agencyCode,
    addCmd.supplierCode,
    mgaAgentDto.licenseCode
  )

if (mgaAgencySupplierChannelRelDto == null) {
  throw MGA_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段四：分分关系校验**
```
// 检查代理人入职牌照+经代公司+保司分支机构是否有分分关系
branchRelation = mgaAgencySupplierChannelRelGateway
  .selectBranchRelationByCodeAndParentId(
    addCmd.supplierBranchCode,
    mgaAgentDto.branchCode,
    mgaAgencySupplierChannelRelDto.id
  )

if (branchRelation == null) {
  throw MGA_BRANCH_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段五：保存保司工号**
```
mgaAgentInsuranceJobGateway.save(addCmd)
```

**关键业务规则**:
- 同一代理人同一保司仅能有一条生效记录
- 必须满足：渠道+经代+保司的总总关系
- 必须满足：牌照分支+经代分支+保司分支的分分关系
- 保司工号入职时间默认为当天00:00:00

---

### 3.4 编辑保司工号

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/update`

#### 业务逻辑分阶段

**阶段一：查询保司工号**
```
mgaAgentInsuranceJobDto = mgaAgentInsuranceJobGateway.selectById(
  updateCmd.id
)
if (mgaAgentInsuranceJobDto == null) {
  throw MGA_AGENT_INSURANCE_JOB_NOT_EXIST
}
```

**阶段二：MGA代理人校验**
```
mgaAgentDto = mgaAgentGateway.selectByCode(
  mgaAgentInsuranceJobDto.agentCode
)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段三：总总关系校验**
```
mgaAgencySupplierChannelRelDto = mgaAgencySupplierChannelRelGateway
  .selectRelationByAllCode(
    mgaAgentDto.channelCodeToB,
    mgaAgentDto.agencyCode,
    mgaAgentInsuranceJobDto.supplierCode,
    mgaAgentDto.licenseCode
  )

if (mgaAgencySupplierChannelRelDto == null) {
  throw MGA_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段四：分分关系校验**
```
branchRelation = mgaAgencySupplierChannelRelGateway
  .selectBranchRelationByCodeAndParentId(
    updateCmd.supplierBranchCode,
    mgaAgentDto.branchCode,
    mgaAgencySupplierChannelRelDto.id
  )

if (branchRelation == null) {
  throw MGA_BRANCH_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段五：更新保司工号**
```
mgaAgentInsuranceJobGateway.updateById(updateCmd)
```

**关键业务规则**:
- 可编辑字段：保司分支机构、工号、备注
- 不可编辑字段：代理人编码、保司编码
- 编辑时仍需校验总总关系和分分关系

---

### 3.5 禁用保司工号

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/disable/{id}`

#### 业务逻辑分阶段

**阶段一：查询保司工号**
```
mgaAgentInsuranceJobDto = mgaAgentInsuranceJobGateway.selectById(id)

if (mgaAgentInsuranceJobDto == null ||
    mgaAgentInsuranceJobDto.status == DISABLE) {
  throw MGA_AGENT_INSURANCE_JOB_NOT_EXIST("或已禁用")
}
```

**阶段二：查询MGA代理人**
```
mgaAgentDto = mgaAgentGateway.selectByCode(
  mgaAgentInsuranceJobDto.agentCode
)
if (mgaAgentDto == null) {
  throw MGA_AGENT_NOT_EXIST
}
```

**阶段三：更新工号状态**
```
updateCmd = MgaAgentInsuranceJobUpdateCmd.builder()
  .id(id)
  .status(DISABLE)
  .jobEndTime(now())
  .build()

mgaAgentInsuranceJobGateway.updateById(updateCmd)
```

**阶段四：记录数据变更**
```
changeJsons = [
  DataChangeJson(
    column: "insuranceJobStatus",
    columnName: "代理人保司工号",
    type: NORMAL,
    originalVal: "代理人保司工号被禁用！",
    updateVal: "代理人保司工号被禁用！"
  )
]

dataChangeRecordService.create(
  recordType: ACTION,
  event: MGA_AGENT_INFO_MODIFY,
  relatedCode: mgaAgentDto.code,
  changeJsons: changeJsons
)
```

**关键业务规则**:
- 禁用工号时设置jobEndTime为当前时间
- 禁用后不可再次禁用
- 记录数据变更日志

---

### 3.6 导入保司工号

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/import`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：解析Excel文件**
```
listener = new MgaAgentInsuranceJobImportReadListener(this)
EasyExcel.read(file.inputStream, MgaAgentInsuranceJobImportDto.class, listener)
  .ignoreEmptyRow(true)
  .sheet()
  .doRead()
```

**阶段二：逐行校验（在监听器中）**
```
// 1. 校验MGA代理人是否存在
// 2. 校验保司总公司是否存在
// 3. 校验保司分支机构是否存在
// 4. 校验总总关系
// 5. 校验分分关系
// 6. 校验唯一性
```

**阶段三：批量保存**
```
errorList = listener.getErrorMsg()
if (!isEmpty(errorList)) {
  return String.join("\r\n", errorList)
}

// 批量保存保司工号
mgaAgentInsuranceJobGateway.saveBatch(listener.successList)
```

---

### 3.7 导出保司工号模板

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mgaAgentInsuranceJob/export`

#### 业务逻辑分阶段

- 与MGA代理人导出模板类似
- 模板字段：MGA代理人编码、保司银保监编码、保司分支银保监编码、工号、备注

---

## 四、MGA经代供应商渠道关系管理

**Controller**: `MgaAgencySupplierChannelRelController`
**URL前缀**: `/api/v1/system/auth/mga/three/rel`

### 4.1 MGA渠道机构列表（总总关系）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mga/three/rel/list`
**返回类型**: `List<MgaAgencySupplierChannelRelDto>`

#### 业务逻辑分阶段

**阶段一：参数准备**
```
objectMap = MapUtils.flat(request.getParameterMap())
objectMap.put("tenantCode", LoginUtil.tenantCode())
objectMap.put("relation", AgencySupplierRelationEnum.ZZ.code) // 强制查询总总关系
```

**阶段二：渠道校验**
```
channelToBDto = channelToBGateway.selectByCode(query.channelCode)

if (channelToBDto == null ||
    !objectMap.get("tenantCode").equals(channelToBDto.tenantCode)) {
  return emptyList()
}

objectMap.put("channelCode", channelToBDto.channelCode)
```

**阶段三：查询总总关系**
```
mgaAgencySupplierChannelRelDtos = mgaAgencySupplierChannelRelGateway
  .selectList(objectMap)

if (isEmpty(mgaAgencySupplierChannelRelDtos)) {
  return emptyList()
}
```

**阶段四：填充机构名称**
```
fillCompanyName(mgaAgencySupplierChannelRelDtos, 1): // tag=1表示只填充总公司
  // 1. 收集所有编码
  channelLicenseCodeSet = dtos.map(dto -> dto.channelLicenseCode).toSet()
  agencyCompanyCodeSet = dtos.map(dto -> dto.agencyCompanyCode).toSet()
  supplierCodeSet = dtos.map(dto -> dto.supplierCode).toSet()

  // 2. 批量查询牌照和经代公司
  agencyCompanyCodeSet.addAll(channelLicenseCodeSet)
  agencyCodeNameMap = agencyCompanyInfoGateway
    .selectListByCode(agencyCompanyCodeSet)
    .toMap(code -> AgencyCompanyInfoDto)

  // 3. 批量查询保司
  supplierCodeNameMap = supplierInfoGateway
    .selectByCodeSet(supplierCodeSet)
    .toMap(code -> SupplierInfoDto)

  // 4. 回填名称
  dtos.forEach(item -> {
    item.agencyCompanyName = agencyCodeNameMap
      .get(item.agencyCompanyCode).fullName
    item.channelLicenseName = agencyCodeNameMap
      .get(item.channelLicenseCode).fullName
    item.supplierName = supplierCodeNameMap
      .get(item.supplierCode).fullName
  })
```

**关键业务规则**:
- 只查询总总关系（ZZ）
- 自动过滤租户和渠道
- 批量填充机构名称

---

### 4.2 MGA分支机构列表（分分关系）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mga/three/rel/branch/list/{id}`
**返回类型**: `List<MgaAgencySupplierChannelRelDto>`

#### 业务逻辑分阶段

**阶段一：查询总总关系**
```
relDo = mgaAgencySupplierChannelRelGateway.getById(id)
if (relDo == null) {
  throw MGA_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段二：查询分分关系**
```
list = mgaAgencySupplierChannelRelGateway.selectBranchListByParentId(id)
```

**阶段三：填充机构名称**
```
fillCompanyName(list, 1 | 2): // tag=3表示填充总公司和分公司
  // tag二进制位：
  // bit 0 (1): 填充总公司字段
  // bit 1 (2): 填充分公司字段

  // 收集总公司编码（tag & 1 > 0）
  if ((tag & 1) > 0) {
    channelLicenseCodeSet.add(dto.channelLicenseCode)
    agencyCompanyCodeSet.add(dto.agencyCompanyCode)
    supplierCodeSet.add(dto.supplierCode)
  }

  // 收集分公司编码（tag & 2 > 0）
  if ((tag & 2) > 0) {
    channelLicenseCodeSet.add(dto.branchChannelLicenseCode)
    agencyCompanyCodeSet.add(dto.branchAgencyCompanyCode)
    supplierCodeSet.add(dto.branchSupplierCode)
  }

  // 批量查询并回填名称
  ...
```

**关键业务规则**:
- 基于总总关系ID查询分分关系
- 返回该总总关系下的所有分分关系
- 同时填充总公司和分公司名称

---

### 4.3 MGA机构关联接口（创建总总关系）

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mga/three/rel/add`

#### 业务逻辑分阶段

**阶段一：唯一性校验**
```
// 查询总总关系是否存在
mgaAgencySupplierChannelRelDto = mgaAgencySupplierChannelRelGateway
  .selectRelationByAllCode(
    addCmd.channelCode,
    addCmd.agencyCompanyCode,
    addCmd.supplierCode,
    addCmd.channelLicenseCode
  )

if (mgaAgencySupplierChannelRelDto != null) {
  throw MGA_CHANNEL_AGENCY_SUPPLIER_EXIST // 经代公司和供应商和渠道牌照机构总总关联关系已存在
}
```

**阶段二：转换参数**
```
channelRelAddCmd = mgaAgencySupplierChannelRelAssembler.convert(addCmd)
channelRelAddCmd.setRelation(AgencySupplierRelationEnum.ZZ.code)
```

**阶段三：保存总总关系**
```
mgaAgencySupplierChannelRelGateway.save(channelRelAddCmd)
```

**关键业务规则**:
- 四方关系唯一：渠道+渠道牌照+经代公司+保司
- 关系类型自动设为ZZ（总总关系）
- 总总关系是分分关系的前置条件

---

### 4.4 MGA分支机构关联接口（创建分分关系）

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/mga/three/rel/branch/add`

#### 业务逻辑分阶段

**阶段一：查询父级总总关系**
```
dto = mgaAgencySupplierChannelRelGateway.selectById(addCmd.parentId)
if (dto == null) {
  throw MGA_CHANNEL_AGENCY_SUPPLIER_NOT_EXIST
}
```

**阶段二：渠道牌照分支校验**
```
branchChannelLicense = agencyCompanyInfoGateway.selectByCode(
  addCmd.branchChannelLicenseCode
)

if (branchChannelLicense == null ||
    !branchChannelLicense.parentCode.equals(dto.channelLicenseCode)) {
  throw MGA_BRANCH_CODE_NOT_EXIST("渠道牌照")
}
```

**阶段三：经代公司分支校验**
```
branchAgencyCompany = agencyCompanyInfoGateway.selectByCode(
  addCmd.branchAgencyCompanyCode
)

if (branchAgencyCompany == null ||
    !branchAgencyCompany.parentCode.equals(dto.agencyCompanyCode)) {
  throw MGA_BRANCH_CODE_NOT_EXIST("经代公司")
}
```

**阶段四：保司分支校验**
```
supplierInfoDto = supplierInfoGateway.selectByCode(
  addCmd.branchSupplierCode
)

if (supplierInfoDto == null ||
    !supplierInfoDto.parentCode.equals(dto.supplierCode)) {
  throw MGA_BRANCH_CODE_NOT_EXIST("保险公司")
}
```

**阶段五：分分关系唯一性校验**
```
mgaAgencySupplierChannelRelDto = mgaAgencySupplierChannelRelGateway
  .selectBranchRelationByAllCode(
    dto.channelCode,
    addCmd.branchAgencyCompanyCode,
    addCmd.branchSupplierCode,
    addCmd.branchChannelLicenseCode
  )

if (mgaAgencySupplierChannelRelDto != null) {
  throw MGA_BRANCH_CHANNEL_AGENCY_SUPPLIER_EXIST // 分分关联关系已存在
}
```

**阶段六：组装并保存分分关系**
```
channelRelAddCmd = mgaAgencySupplierChannelRelAssembler.convert(addCmd)
// 继承总总关系的信息
channelRelAddCmd.setChannelCode(dto.channelCode)
channelRelAddCmd.setChannelLicenseCode(dto.channelLicenseCode)
channelRelAddCmd.setSupplierCode(dto.supplierCode)
channelRelAddCmd.setAgencyCompanyCode(dto.agencyCompanyCode)
channelRelAddCmd.setRelation(AgencySupplierRelationEnum.FF.code)
channelRelAddCmd.setParentId(addCmd.parentId)

mgaAgencySupplierChannelRelGateway.save(channelRelAddCmd)
```

**关键业务规则**:
- 必须基于总总关系创建分分关系
- 分支机构必须是对应总公司的直接下级
- 校验三个分支机构的父级关系
- 分分关系唯一性：渠道+牌照分支+经代分支+保司分支
- 继承总总关系的渠道、牌照、经代、保司编码

---

### 4.5 MGA分支机构编辑接口

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/mga/three/rel/branch/update`

#### 业务逻辑分阶段

**阶段一：更新分分关系**
```
mgaAgencySupplierChannelRelGateway.updateById(updateCmd)
```

**关键业务规则**:
- 可编辑字段：备注、状态
- 不可编辑字段：机构编码、关系类型

---

### 4.6 MGA渠道机构列表Map

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mga/three/rel/list/map`
**返回类型**: `MgaAgencySupplierChannelRelMapDto`

#### 业务逻辑分阶段

**阶段一：查询所有总总关系**
```
objectMap.put("tenantCode", LoginUtil.tenantCode())
mgaAgencySupplierChannelRelDtos = mgaAgencySupplierChannelRelGateway
  .selectList(objectMap)

if (isEmpty(mgaAgencySupplierChannelRelDtos)) {
  return new MgaAgencySupplierChannelRelMapDto()
}
```

**阶段二：收集所有机构编码**
```
// 经代公司编码
agencyCompanyCodeSet = dtos.map(dto -> dto.agencyCompanyCode).toSet()

// 渠道牌照编码
channelLicenseCodeSet = dtos.map(dto -> dto.channelLicenseCode).toSet()

// 渠道牌照分支编码
branchChannelLicenseCodeSet = dtos
  .map(dto -> dto.branchChannelLicenseCode)
  .filter(code -> hasText(code))
  .toSet()
```

**阶段三：批量查询机构信息**
```
// 合并所有经代和牌照编码
allAgencyCodeSet.addAll(agencyCompanyCodeSet)
allAgencyCodeSet.addAll(channelLicenseCodeSet)
allAgencyCodeSet.addAll(branchChannelLicenseCodeSet)

// 批量查询
agencyCompanyInfoList = agencyCompanyInfoGateway
  .selectListByCode(allAgencyCodeSet)

// 分组
agencyCompanyMap = agencyCompanyInfoList
  .filter(dto -> agencyCompanyCodeSet.contains(dto.code))
  .toMap(code -> dto)

channelLicenseMap = agencyCompanyInfoList
  .filter(dto -> channelLicenseCodeSet.contains(dto.code))
  .toMap(code -> dto)

branchChannelLicenseMap = agencyCompanyInfoList
  .filter(dto -> branchChannelLicenseCodeSet.contains(dto.code))
  .toMap(code -> dto)
```

**阶段四：组装返回数据**
```
mgaAgencySupplierChannelRelMapDto = MgaAgencySupplierChannelRelMapDto
  .builder()
  .agencyCompanyMap(agencyCompanyMap)
  .channelLicenseMap(channelLicenseMap)
  .branchChannelLicenseMap(branchChannelLicenseMap)
  .build()

return mgaAgencySupplierChannelRelMapDto
```

**关键业务规则**:
- 返回Map结构，方便前端按机构类型查询
- 包含：经代公司Map、渠道牌照Map、渠道牌照分支Map
- 用于前端下拉框数据源

---

### 4.7 通过牌照信息查渠道列表

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/mga/three/rel/license/channel/list/{licenseCode}`
**返回类型**: `List<ChannelToBDto>`

#### 业务逻辑分阶段

**阶段一：查询牌照关联的渠道**
```
channelCodeList = mgaAgencySupplierChannelRelGateway
  .selectChannelCodeByLicenseCode(licenseCode)
```

**阶段二：查询渠道详情**
```
if (isEmpty(channelCodeList)) {
  return emptyList()
}

channelToBDtoList = channelToBGateway.selectByCodeSet(channelCodeList)

return channelToBDtoList
```

**关键业务规则**:
- 反向查询：牌照 → 渠道
- 用于查询某个牌照下有哪些渠道

---

## 五、关键业务规则

### 5.1 MGA代理人管理规则

| 规则 | 说明 |
|------|------|
| **代理人编码** | MGA + 雪花ID（全局唯一） |
| **唯一性约束** | 同一身份证+牌照分支+经代只能有一条在职记录 |
| **重新入职** | 重新入职时删除历史离职记录，创建新记录 |
| **身份证解析** | 自动解析生日（6-13位）、性别（17位：奇男偶女） |
| **与普通代理人互斥** | MGA代理人不能同时是普通代理人（按身份证校验） |
| **关联关系** | 必须满足渠道-牌照-经代的总总关系和分分关系 |

### 5.2 MGA代理人执业规则

| 规则 | 说明 |
|------|------|
| **保司工号唯一性** | 同一代理人同一保司仅能有一条生效记录 |
| **关联关系校验** | 新增/编辑工号时校验总总关系和分分关系 |
| **离职联动** | 代理人离职时自动禁用所有保司工号 |
| **工号禁用** | 禁用时设置jobEndTime为当前时间，status=DISABLE |
| **工号可编辑字段** | 保司分支机构、工号、备注 |
| **工号不可编辑字段** | 代理人编码、保司编码 |

### 5.3 MGA关系管理规则

| 规则 | 说明 |
|------|------|
| **关系层级** | 总总关系（ZZ） → 分分关系（FF） |
| **总总关系** | 渠道+渠道牌照+经代公司+保司（总公司对总公司） |
| **分分关系** | 基于总总关系，建立分支机构之间的关联 |
| **唯一性约束** | 四方关系唯一：渠道+牌照+经代+保司 |
| **父子关系** | 分支机构必须是对应总公司的直接下级 |
| **继承关系** | 分分关系继承总总关系的渠道、牌照、经代、保司编码 |

### 5.4 数据权限规则

| 规则 | 说明 |
|------|------|
| **多租户隔离** | 所有查询自动注入租户编码 |
| **渠道数据隔离** | 云服渠道端只能查看自己渠道的MGA代理人 |
| **数据脱敏** | 导出时脱敏：姓名、身份证、手机号 |
| **权限注解** | @EnableDataPermission 控制数据权限 |

### 5.5 数据变更记录规则

| 事件 | 记录方式 | 触发时机 |
|------|---------|---------|
| **MGA代理人编辑** | COMPARE（对比） | 编辑代理人信息 |
| **MGA代理人离职** | COMPARE（对比） | 离职操作 |
| **保司工号禁用** | ACTION（动作） | 禁用工号、代理人离职 |

### 5.6 导入导出规则

| 规则 | 说明 |
|------|------|
| **导入校验** | 逐行校验，收集所有错误一次性返回 |
| **导入事务** | 所有校验通过后才批量保存，失败则回滚 |
| **导出异步** | 导出任务异步执行，避免超时 |
| **导出脱敏** | 姓名、身份证、手机号脱敏 |
| **导出状态** | EXECUTING → SUCCESS/FAILED |
| **文件存储** | 导出文件上传到OSS永久保存 |

### 5.7 状态枚举

#### 入职状态 (EntryStatusEnum)
| 状态码 | 说明 |
|--------|------|
| JOINED | 在职 |
| SEPARATED | 已离职 |

#### 启用状态 (EnableStatusEnum)
| 状态码 | 说明 |
|--------|------|
| ENABLE | 启用 |
| DISABLE | 禁用 |

#### 关系类型 (AgencySupplierRelationEnum)
| 状态码 | 说明 |
|--------|------|
| ZZ | 总总关系（总公司对总公司） |
| FF | 分分关系（分支对分支） |

### 5.8 业务流程图

#### MGA代理人入职流程
```
1. 创建三方关系
   ├─ 创建总总关系：渠道+牌照(总)+经代(总)+保司(总)
   └─ 创建分分关系：牌照分支+经代分支+保司分支

2. 新增MGA代理人
   ├─ 校验渠道存在
   ├─ 校验总总关系存在
   ├─ 校验分分关系存在
   ├─ 校验不是普通代理人
   ├─ 校验不重复入职
   ├─ 处理重新入职（删除历史离职记录）
   ├─ 生成代理人编码（MGA + 雪花ID）
   ├─ 解析身份证（生日、性别）
   └─ 保存代理人

3. 新增保司工号
   ├─ 校验代理人存在
   ├─ 校验不重复入职同一保司
   ├─ 校验总总关系（代理人牌照+经代+保司）
   ├─ 校验分分关系（代理人分支+保司分支）
   └─ 保存保司工号
```

#### MGA代理人离职流程
```
1. 离职操作
   ├─ 校验代理人存在且在职
   ├─ 禁用所有保司工号
   │   ├─ 设置status=DISABLE
   │   ├─ 设置jobEndTime=now()
   │   └─ 记录数据变更日志
   ├─ 更新代理人状态
   │   ├─ 设置entryStatus=SEPARATED
   │   ├─ 设置resignationTime=now()
   │   └─ 记录数据变更日志
   └─ 事务提交
```

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0
**Service实现类**:
- `MgaAgentServiceImpl`
- `MgaAgentInsuranceJobServiceImpl`
- `MgaAgencySupplierChannelRelServiceImpl`
