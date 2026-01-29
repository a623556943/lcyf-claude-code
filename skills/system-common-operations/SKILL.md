---
name: lcyf-system-common-operations
description: 系统通用操作日志与审计。java-developer 在追踪操作记录时使用；planner 在规划审计日志方案时使用。
---

# System模块 业务逻辑详细文档（公共运营）

**文档创建时间**: 2026-01-27
**文档版本**: V1.0
**参考格式**: AgreementInfoControllerV2-业务文档.md

---

## 目录

- [一、系统公告管理](#一系统公告管理)
- [二、官网文章管理](#二官网文章管理)
- [三、官网文章外部接口](#三官网文章外部接口)
- [四、关键业务规则](#四关键业务规则)

---

## 一、系统公告管理

**Controller路径**: `/api/v1/system/auth/announcement`
**负责人**: yongqin.peng
**创建时间**: 2025-09-17

### 1.1 系统公告 - 分页查询接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/announcement/page`
**返回类型**: `CommonResult<AnnouncementPageResult>`

#### 业务逻辑分阶段

**阶段一：参数处理**
- 接收 AnnouncementPageQuery 查询条件
- 扁平化 HttpServletRequest 参数为 Map
- 自动注入租户上下文

**阶段二：查询分页数据**
```
pageResult = announcementGateway.selectPage(paraMap)
// SELECT FROM announcement WHERE ... LIMIT offset, pageSize
```

**阶段三：统计各类型公告数量**
- 移除 type 过滤条件
- 查询所有公告（当前租户+应用范围）
- 初始化计数器：
  ```
  countMap: {
    "all": 0,
    "product": 0,    // 商品通知
    "platform": 0,   // 平台公告
    "activity": 0,   // 活动通知
    "system": 0      // 系统通知
  }
  ```

**阶段四：查询用户已读记录**
```
userCode = UserInfoContextHolder.getUserCode()
readRecordList = readRecordGateway.selectByUserCode(userCode)
// SELECT FROM announcement_read_record WHERE user_code = ?
readAnnouncementIds = extract(readRecordList, "announcementId")
```

**阶段五：计算统计数据**
- 遍历所有公告：
  ```
  for announcement in allList:
    countMap[announcement.type] += 1
    countMap["all"] += 1

    if announcement.id NOT IN readAnnouncementIds:
      unReadCountMap[announcement.type] += 1
      unReadCountMap["all"] += 1
  ```

**阶段六：标记分页数据已读状态**
```
for announcement in pageResult.list:
  announcement.isRead = (announcement.id IN readAnnouncementIds)
```

**返回数据结构**
```json
{
  "list": [...],           // 分页数据
  "total": 100,
  "countMap": {            // 各类型总数
    "all": 100,
    "product": 20,
    "platform": 30,
    "activity": 25,
    "system": 25
  },
  "unReadCountMap": {      // 各类型未读数
    "all": 15,
    "product": 3,
    "platform": 5,
    "activity": 4,
    "system": 3
  }
}
```

**关键业务规则**
- 公告按应用端（appCode）隔离
- 公告按租户隔离
- 已读状态按用户独立记录
- 统计数据实时计算

---

### 1.2 系统公告 - 详情接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/announcement/{id}`
**返回类型**: `CommonResult<AnnouncementDto>`

#### 业务逻辑分阶段

**阶段一：查询公告基础信息**
```
announcementDto = announcementGateway.selectById(id)
// SELECT FROM announcement WHERE id = ?
if announcementDto == null:
  return new AnnouncementDto()
```

**阶段二：查询公告详情内容**
```
announcementDetailsDto = announcementDetailsGateway.selectByAnnouncementId(id)
// SELECT FROM announcement_details WHERE announcement_id = ?
if announcementDetailsDto != null:
  announcementDto.setDetails(announcementDetailsDto.details)
```

**数据库操作**
- SELECT: announcement（公告主表）
- SELECT: announcement_details（公告详情表）

**关键业务规则**
- 公告内容单独存储（分表存储，优化查询性能）
- 不存在时返回空对象，不抛异常

---

### 1.3 系统公告 - 新增接口

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/announcement/add`
**入参**: `AnnouncementAddCmd`
**返回类型**: `CommonResult<Object>`

#### 入参字段校验

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|---------|------|
| title | String | 是 | NotBlank | 公告标题 |
| type | String | 是 | @InEnum(AnnouncementTypeEnum) | 公告类型 |
| appCode | String | 是 | @InEnum(AppCodeEnum) | 应用端 |
| appClient | String | 否 | - | 应用客户端 |
| details | String | 是 | NotBlank | 公告内容 |

#### 业务逻辑分阶段

**阶段一：参数校验**
- @Valid 注解校验必填字段
- 公告类型枚举校验（product/platform/activity/system）
- 应用端枚举校验

**阶段二：保存公告基础信息**
```
announcementId = announcementGateway.save(addCmd)
// INSERT INTO announcement (title, type, app_code, app_client, tenant_code, ...)
// VALUES (?, ?, ?, ?, ?, ...)
```

**阶段三：保存公告详情内容**
```
detailsAddCmd.setAnnouncementId(announcementId)
detailsAddCmd.setDetails(addCmd.details)
announcementDetailsGateway.save(detailsAddCmd)
// INSERT INTO announcement_details (announcement_id, details, ...)
// VALUES (?, ?, ...)
```

**数据库操作**
- INSERT: announcement（公告主表）
- INSERT: announcement_details（公告详情表）

**事务控制**
- @Transactional(rollbackFor = Exception.class)
- 确保公告主表和详情表原子性

**关键业务规则**
- 公告创建即发布，无草稿状态
- 公告与详情分表存储
- 自动记录创建人和租户信息

---

### 1.4 系统公告 - 编辑接口

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/announcement/update`
**入参**: `AnnouncementUpdateCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：参数校验**
- 同新增接口的校验规则
- id 必填

**阶段二：更新公告基础信息**
```
announcementGateway.updateById(updateCmd)
// UPDATE announcement SET title=?, type=?, app_code=?, app_client=?, updater=?, update_time=?
// WHERE id=?
```

**阶段三：更新公告详情内容**
```
detailsUpdateCmd.setAnnouncementId(updateCmd.id)
detailsUpdateCmd.setDetails(updateCmd.details)
announcementDetailsGateway.updateByAnnouncementId(detailsUpdateCmd)
// UPDATE announcement_details SET details=?, updater=?, update_time=?
// WHERE announcement_id=?
```

**数据库操作**
- UPDATE: announcement（公告主表）
- UPDATE: announcement_details（公告详情表）

**事务控制**
- @Transactional(rollbackFor = Exception.class)

**关键业务规则**
- 所有字段均可修改
- 更新不影响已读记录

---

### 1.5 系统公告 - 删除接口

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/announcement/delete/{id}`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：删除公告基础信息**
```
announcementGateway.removeById(id)
// DELETE FROM announcement WHERE id = ?
```

**阶段二：删除公告详情内容**
```
announcementDetailsGateway.removeByAnnouncementId(id)
// DELETE FROM announcement_details WHERE announcement_id = ?
```

**阶段三：删除用户已读记录**
```
readRecordGateway.removeByAnnouncementId(id)
// DELETE FROM announcement_read_record WHERE announcement_id = ?
```

**数据库操作**
- DELETE: announcement（公告主表）
- DELETE: announcement_details（公告详情表）
- DELETE: announcement_read_record（已读记录表）

**关键业务规则**
- 物理删除，不可恢复
- 级联删除关联数据

---

### 1.6 系统公告 - 获取用户未读消息数量

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/announcement/unread/count`
**返回类型**: `CommonResult<Integer>`

#### 业务逻辑分阶段

**阶段一：获取用户上下文**
```
userCode = UserInfoContextHolder.getUserCode()
appCode = UserInfoContextHolder.getAppCode()
tenantCode = UserInfoContextHolder.getTenantCode()
```

**阶段二：查询未读数量**
```
unreadCount = announcementGateway.selectUnreadCount(userCode, appCode, tenantCode)
// SELECT COUNT(*) FROM announcement a
// WHERE a.app_code = ? AND a.tenant_code = ?
// AND NOT EXISTS (
//   SELECT 1 FROM announcement_read_record r
//   WHERE r.announcement_id = a.id AND r.user_code = ?
// )
```

**关键业务规则**
- 按用户、应用、租户三维度统计
- 通过 NOT EXISTS 子查询实现未读判断

---

### 1.7 系统公告 - 已读消息

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/announcement/read`
**入参**: `AnnouncementReadCmd`
**返回类型**: `CommonResult<Boolean>`

#### 业务逻辑分阶段

**阶段一：参数校验**
```
cmd.announcementIds (Set<Long>, Required)
userCode = UserInfoContextHolder.getUserCode()
```

**阶段二：查询公告是否存在**
```
announcementList = announcementGateway.selectInIds(announcementIds)
// SELECT FROM announcement WHERE id IN (?, ?, ...)
```

**阶段三：查询用户已读记录**
```
readList = readRecordGateway.selectByAnnouncementIdsAndUserCode(announcementIds, userCode)
// SELECT FROM announcement_read_record WHERE announcement_id IN (?, ...) AND user_code = ?
readAnnouncementIds = extract(readList, "announcementId")
```

**阶段四：筛选未读公告**
```
readRecordAddCmdList = []
for announcement in announcementList:
  if announcement.id NOT IN readAnnouncementIds:
    addCmd = new AnnouncementReadRecordAddCmd()
    addCmd.setAnnouncementId(announcement.id)
    addCmd.setUserCode(userCode)
    readRecordAddCmdList.add(addCmd)
```

**阶段五：批量保存已读记录**
```
if !readRecordAddCmdList.isEmpty():
  readRecordGateway.saveBatch(readRecordAddCmdList)
  // INSERT INTO announcement_read_record (announcement_id, user_code, read_time, ...)
  // VALUES (?, ?, ?, ...), (?, ?, ?, ...), ...
```

**数据库操作**
- SELECT: announcement（校验公告存在性）
- SELECT: announcement_read_record（查询已读记录）
- INSERT: announcement_read_record（批量插入已读记录）

**关键业务规则**
- 支持批量标记已读
- 重复标记自动去重（先查询已读，再插入未读）
- 已读记录不可撤销

---

## 二、官网文章管理

**Controller路径**: `/api/v1/system/auth/newsInfo`
**负责人**: zhouyuhang
**创建时间**: 2024-07-22

### 2.1 官网文章 - 分页查询接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/newsInfo/page`
**返回类型**: `CommonResult<PageResult<NewsInfoDto>>`

#### 业务逻辑分阶段

**阶段一：参数处理**
- 接收 NewsInfoPageQuery 查询条件
- 扁平化 HttpServletRequest 参数为 Map
- 注入租户编码：map.put("tenantCode", LoginUtil.tenantCode())

**阶段二：设置排序规则**
```
paraMap.putAll(MapUtils.builder().orderBy(NewsInfoDto::getCreateTime).desc().build())
// ORDER BY create_time DESC
```

**阶段三：执行分页查询**
```
pageResult = newsInfoGateway.selectPage(paraMap)
// SELECT FROM news_info WHERE tenant_code = ? ORDER BY create_time DESC LIMIT offset, pageSize
```

**阶段四：回填更新人姓名**
- 提取所有更新人ID：`userIds = extract(pageResult.list, "updater")`
- 批量查询用户信息：
  ```
  userList = userInfoService.getTenantIgnoreUserListByIds(userIds)
  // 忽略租户查询（可能是跨租户操作人员）
  userMap = toMap(userList, "id")
  ```
- 回填用户姓名：
  ```
  for newsInfo in pageResult.list:
    if newsInfo.updater != null:
      userInfoDto = userMap.get(Long.parseLong(newsInfo.updater))
      if userInfoDto != null:
        newsInfo.updater = userInfoDto.nickName
  ```

**关键业务规则**
- 按创建时间倒序排列（最新文章在前）
- 租户隔离查询
- 更新人显示昵称（可能跨租户）

---

### 2.2 官网文章 - 置顶列表

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/newsInfo/list/top`
**返回类型**: `CommonResult<List<NewsInfoDto>>`

#### 业务逻辑分阶段

**阶段一：查询置顶文章**
```
newsList = newsInfoGateway.selectTopList()
// SELECT FROM news_info WHERE is_top = 'Y' AND publish_status = '1'
// ORDER BY sort DESC
```

**关键业务规则**
- 只查询已置顶且已发布的文章
- 按 sort 字段倒序排列（sort 值越大越靠前）

---

### 2.3 官网文章 - 置顶顺序调整

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/newsInfo/update/top/sort`
**入参**: `NewsInfoTopUpdateCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：参数校验**
```
ValidationUtils.validate(updateCmd)
newsInfoList = updateCmd.newsInfoList (List<{id, sort}>)
```

**阶段二：批量更新顺序**
```
if !newsInfoList.isEmpty():
  for item in newsInfoList:
    newsInfoGateway.updateSortById(item.id, item.sort)
    // UPDATE news_info SET sort = ? WHERE id = ?
```

**关键业务规则**
- 支持批量调整顺序
- 前端传入新的 sort 值，直接更新
- 操作日志记录：@OperateLog(type=UPDATE, description="置顶顺序调整")

---

### 2.4 官网文章 - 详情接口

**HTTP方法**: `GET`
**URL**: `/api/v1/system/auth/newsInfo/{id}`
**返回类型**: `CommonResult<NewsInfoDto>`

#### 业务逻辑分阶段

**阶段一：查询文章详情**
```
newsInfoDto = newsInfoGateway.selectById(id)
// SELECT FROM news_info WHERE id = ?
```

**关键业务规则**
- 返回完整文章信息（包括正文）

---

### 2.5 官网文章 - 新增接口

**HTTP方法**: `POST`
**URL**: `/api/v1/system/auth/newsInfo/add`
**入参**: `NewsInfoAddCmd`
**返回类型**: `CommonResult<Object>`

#### 入参字段校验

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|---------|------|
| title | String | 是 | NotBlank | 文章标题 |
| coverObjectId | String | 是 | NotBlank | 文章封面 |
| summary | String | 是 | NotBlank | 文章摘要 |
| tag | String | 是 | NotBlank | 文章标签（1-品牌动态 2-新品上线） |
| isTop | String | 是 | NotBlank | 是否首页置顶（Y/N） |
| text | String | 否 | - | 正文 |

#### 业务逻辑分阶段

**阶段一：置顶数量校验**
```
if addCmd.isTop == "Y":
  newsTopList = getNewsTopList()
  // 查询当前置顶文章

  if newsTopList.size() >= 4:
    throw NEWS_TOP_LEVEL_ERROR  // 最多允许4个置顶文章
```

**阶段二：计算置顶顺序**
```
if addCmd.isTop == "Y":
  if !newsTopList.isEmpty():
    lastNewsInfoDto = newsTopList.getLast()
    addCmd.setSort(lastNewsInfoDto.sort - 1)  // 排在最后
```

**阶段三：设置默认发布状态**
```
addCmd.setPublishTime(LocalDateTime.now())
addCmd.setPublishStatus(NewsPublishStatusEnum.PUBLISH.getCode())  // 默认已发布
```

**阶段四：保存文章**
```
newsId = newsInfoGateway.save(addCmd)
// INSERT INTO news_info (title, cover_object_id, summary, tag, is_top, text,
//                         publish_status, publish_time, sort, tenant_code, ...)
// VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ...)
```

**数据库操作**
- INSERT: news_info（文章表）

**关键业务规则**
- 最多同时存在 4 个置顶文章
- 新增文章默认已发布
- 置顶文章按 sort 字段排序（后加入的排在后面）
- 自动记录发布时间

---

### 2.6 官网文章 - 编辑接口

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/newsInfo/update`
**入参**: `NewsInfoUpdateCmd`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：查询文章是否存在**
```
newsInfoDto = newsInfoGateway.selectById(updateCmd.id)
if newsInfoDto == null:
  throw NEWS_IS_NULL
```

**阶段二：置顶数量校验（如果开启置顶）**
```
if updateCmd.isTop == "Y":
  newsTopList = getNewsTopList()
  // 过滤掉自身已经置顶过的数据
  filterNewsTopList = newsTopList.stream()
    .filter(news -> !news.id.equals(newsInfoDto.id))
    .toList()

  if filterNewsTopList.size() >= 4:
    throw NEWS_TOP_LEVEL_ERROR
```

**阶段三：计算置顶顺序（如果开启置顶）**
```
if updateCmd.isTop == "Y":
  if !newsTopList.isEmpty():
    lastNewsInfoDto = newsTopList.getLast()
    updateCmd.setSort(lastNewsInfoDto.sort - 1)
```

**阶段四：处理发布状态变更**
```
if updateCmd.publishStatus == NewsPublishStatusEnum.NO_PUBLISH.code:
  // 如果是已下架
  updateCmd.setSort(0L)
  updateCmd.setIsTop(YesNoEnum.N.code)
```

**阶段五：更新文章**
```
newsInfoGateway.updateById(updateCmd)
// UPDATE news_info SET title=?, cover_object_id=?, summary=?, tag=?,
//                      is_top=?, text=?, publish_status=?, publish_time=?, sort=?, ...
// WHERE id=?
```

**数据库操作**
- UPDATE: news_info（文章表）

**关键业务规则**
- 置顶数量限制：同一时间最多 4 个（不包括自身）
- 下架文章自动取消置顶并清空 sort
- 编辑不改变发布时间（除非明确修改）

---

### 2.7 官网文章 - 删除接口

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/newsInfo/delete/{id}`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：删除文章**
```
newsInfoGateway.removeById(id)
// DELETE FROM news_info WHERE id = ?
```

**数据库操作**
- DELETE: news_info（物理删除）

**关键业务规则**
- 物理删除，不可恢复
- 操作日志记录：@OperateLog(type=DELETE, description="删除接口")

---

### 2.8 官网文章 - 下架接口

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/newsInfo/takeDown/{id}`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：查询文章是否存在**
```
newsInfoDto = newsInfoGateway.selectById(id)
if newsInfoDto == null:
  throw NEWS_IS_NULL
```

**阶段二：校验当前状态**
```
if newsInfoDto.publishStatus == NewsPublishStatusEnum.NO_PUBLISH.code:
  throw NEWS_NO_PUBLISH  // 已经是下架状态
```

**阶段三：执行下架操作**
```
updateCmd = new NewsInfoUpdateCmd()
updateCmd.setId(id)
updateCmd.setPublishStatus(NewsPublishStatusEnum.NO_PUBLISH.code)
updateCmd.setSort(0L)           // 清空排序
updateCmd.setIsTop(YesNoEnum.N.code)  // 取消置顶

newsInfoGateway.updateById(updateCmd)
// UPDATE news_info SET publish_status='2', sort=0, is_top='N' WHERE id=?
```

**数据库操作**
- UPDATE: news_info（更新发布状态）

**关键业务规则**
- 下架文章自动取消置顶
- 下架文章清空 sort（不参与排序）
- 已下架的文章不允许重复下架

---

### 2.9 官网文章 - 上架接口

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/newsInfo/takeUp/{id}`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：查询文章是否存在**
```
newsInfoDto = newsInfoGateway.selectById(id)
if newsInfoDto == null:
  throw NEWS_IS_NULL
```

**阶段二：校验当前状态**
```
if newsInfoDto.publishStatus == NewsPublishStatusEnum.PUBLISH.code:
  throw NEWS_PUBLISH  // 已经是发布状态
```

**阶段三：执行上架操作**
```
updateCmd = new NewsInfoUpdateCmd()
updateCmd.setId(id)
updateCmd.setPublishStatus(NewsPublishStatusEnum.PUBLISH.code)

newsInfoGateway.updateById(updateCmd)
// UPDATE news_info SET publish_status='1' WHERE id=?
```

**数据库操作**
- UPDATE: news_info（更新发布状态）

**关键业务规则**
- 上架不自动置顶（需单独操作）
- 已发布的文章不允许重复上架

---

### 2.10 官网文章 - 取消置顶

**HTTP方法**: `PUT`
**URL**: `/api/v1/system/auth/newsInfo/cancelTop/{id}`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：查询文章是否存在**
```
newsInfoDto = newsInfoGateway.selectById(id)
if newsInfoDto == null:
  throw NEWS_IS_NULL
```

**阶段二：校验置顶状态**
```
if newsInfoDto.isTop == YesNoEnum.N.code:
  throw NEWS_CANCEL_TOP  // 已经取消置顶
```

**阶段三：执行取消置顶操作**
```
updateCmd = new NewsInfoUpdateCmd()
updateCmd.setId(id)
updateCmd.setIsTop(YesNoEnum.N.code)
updateCmd.setSort(0L)  // 清空排序

newsInfoGateway.updateById(updateCmd)
// UPDATE news_info SET is_top='N', sort=0 WHERE id=?
```

**数据库操作**
- UPDATE: news_info（取消置顶）

**关键业务规则**
- 取消置顶清空 sort 字段
- 已取消置顶的文章不允许重复操作

---

### 2.11 官网文章 - 批量删除接口

**HTTP方法**: `DELETE`
**URL**: `/api/v1/system/auth/newsInfo/batch-delete`
**入参**: `ids (String, 逗号分隔)`
**返回类型**: `CommonResult<Object>`

#### 业务逻辑分阶段

**阶段一：解析ID列表**
```
ids = Arrays.stream(idsString.split(","))
  .map(Long::parseLong)
  .collect(Collectors.toList())
```

**阶段二：批量删除**
```
newsInfoGateway.removeBatchByIds(ids)
// DELETE FROM news_info WHERE id IN (?, ?, ...)
```

**数据库操作**
- DELETE: news_info（批量物理删除）

**关键业务规则**
- 支持批量删除
- 物理删除，不可恢复

---

## 三、官网文章外部接口

**Controller路径**: `/api/v1/system/outer/newsInfo`
**负责人**: zhouyuhang
**创建时间**: 2024-07-22
**说明**: 提供给官网调用的公开接口，包含限流保护

### 3.1 官网文章 - 文章置顶列表（官网调用）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/outer/newsInfo/list/top`
**返回类型**: `CommonResult<List<NewsInfoDto>>`

#### 业务逻辑分阶段

**阶段一：租户编码处理**
```
if !StringUtils.hasText(tenantCode):
  tenantCode = DEFAULT_TENANT_CODE  // 默认 "XBBP"
```

**阶段二：查询置顶文章**
```
newsList = newsInfoGateway.selectTopListOuter(tenantCode)
// SELECT FROM news_info WHERE is_top = 'Y' AND publish_status = '1' AND tenant_code = ?
// ORDER BY sort DESC
```

**限流保护**
- @RateLimiter(name = "outer-newsInfo-listTop")
- 防止外部接口被恶意调用

**关键业务规则**
- 默认租户：XBBP
- 只返回已发布且置顶的文章
- 按 sort 倒序排列

---

### 3.2 官网文章 - 文章已发布分页列表（官网调用）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/outer/newsInfo/list/page`
**返回类型**: `CommonResult<PageResult<NewsInfoDto>>`

#### 业务逻辑分阶段

**阶段一：参数处理**
- 扁平化 HttpServletRequest 参数为 Map
- 租户编码处理：
  ```
  if !map.containsKey("tenantCode") || map.get("tenantCode") == null:
    map.put("tenantCode", DEFAULT_TENANT_CODE)
  ```

**阶段二：强制过滤已发布文章**
```
map.put("publishStatus", "1")  // 只查询已发布
```

**阶段三：设置排序规则**
```
paraMap.putAll(MapUtils.builder().orderBy(NewsInfoDto::getPublishTime).desc().build())
// ORDER BY publish_time DESC
```

**阶段四：执行分页查询**
```
pageResult = newsInfoGateway.selectPage(paraMap)
// SELECT FROM news_info WHERE publish_status='1' AND tenant_code=?
// ORDER BY publish_time DESC LIMIT offset, pageSize
```

**限流保护**
- @RateLimiter(name = "outer-newsInfo-page")

**关键业务规则**
- 强制只查询已发布文章（publishStatus='1'）
- 按发布时间倒序排列（不是创建时间）
- 默认租户：XBBP
- 外部接口无权限控制

---

### 3.3 官网文章 - 详情接口（官网调用）

**HTTP方法**: `GET`
**URL**: `/api/v1/system/outer/newsInfo/{id}`
**返回类型**: `CommonResult<NewsInfoDto>`

#### 业务逻辑分阶段

**阶段一：查询文章详情**
```
newsInfoDto = newsInfoGateway.selectById(id)
// SELECT FROM news_info WHERE id = ?
```

**限流保护**
- @RateLimiter(name = "outer-newsInfo-get")

**关键业务规则**
- 不校验发布状态（可能用于预览）
- 限流保护防止恶意访问

---

## 四、关键业务规则

### 4.1 系统公告业务规则

#### 4.1.1 公告类型枚举

| 类型码 | 说明 | 场景 |
|--------|------|------|
| product | 商品通知 | 商品上下架、价格变动 |
| platform | 平台公告 | 系统维护、功能更新 |
| activity | 活动通知 | 促销活动、优惠信息 |
| system | 系统通知 | 账户变更、审核结果 |

#### 4.1.2 可见范围控制

**应用端隔离**
- appCode：JI_ZHAN（即展）/ CUN_XIANG（村享）
- 同一公告可配置多个应用端可见

**应用客户端隔离**
- appClient：BUSINESS（业务端）/ CUSTOMER（客户端）
- 细分可见范围

**租户隔离**
- 每个租户独立的公告列表
- 多租户系统自动注入 tenantCode

#### 4.1.3 已读状态管理

**已读记录存储**
- 表：announcement_read_record
- 主键：(announcement_id, user_code)
- 特点：一对多关系（一个公告对应多个用户已读记录）

**已读逻辑**
- 标记已读：INSERT INTO announcement_read_record
- 判断已读：EXISTS 子查询
- 重复标记：先查询已读，再插入未读（防止重复）

**统计逻辑**
- 总数统计：按类型分组计数
- 未读统计：排除 EXISTS 已读记录

#### 4.1.4 数据库设计

**表结构**
```
announcement (公告主表)
├── id (主键)
├── title (标题)
├── type (类型)
├── app_code (应用端)
├── app_client (应用客户端)
├── tenant_code (租户编码)
├── creator, create_time
└── updater, update_time

announcement_details (公告详情表)
├── id (主键)
├── announcement_id (公告ID)
└── details (富文本内容)

announcement_read_record (已读记录表)
├── id (主键)
├── announcement_id (公告ID)
├── user_code (用户编码)
└── read_time (已读时间)
```

**表分离原因**
- details 字段较大（富文本），分表提升查询性能
- 已读记录独立存储，便于统计和清理

---

### 4.2 官网文章业务规则

#### 4.2.1 文章发布状态枚举

| 状态码 | 说明 | 允许的操作 |
|--------|------|------------|
| 1 | 已发布 | 编辑、下架、置顶/取消置顶、删除 |
| 2 | 已下架 | 编辑、上架、删除 |

#### 4.2.2 置顶管理规则

**数量限制**
- 最多同时 4 个置顶文章
- 新增/编辑时校验数量（不包括自身）

**排序规则**
- sort 字段倒序排列（DESC）
- 新置顶文章：sort = 当前最后一个的 sort - 1
- 取消置顶：sort = 0

**置顶约束**
- 下架文章自动取消置顶
- 置顶文章必须是已发布状态
- 置顶顺序支持手动调整

#### 4.2.3 文章标签枚举

| 标签码 | 说明 |
|--------|------|
| 1 | 品牌动态 |
| 2 | 新品上线 |

#### 4.2.4 上架下架逻辑

**下架操作**
```
publishStatus: 1 → 2
isTop: Y → N
sort: 原值 → 0
```

**上架操作**
```
publishStatus: 2 → 1
isTop: 保持原值
sort: 保持原值（如果之前取消置顶则为0）
```

**业务规则**
- 下架文章不在官网显示
- 下架文章自动取消置顶
- 上架不自动恢复置顶（需手动操作）

#### 4.2.5 外部接口限流

**限流策略**
- listTop: 置顶列表限流（防止频繁查询）
- page: 分页列表限流
- get: 详情接口限流

**限流配置**
- @RateLimiter(name = "outer-newsInfo-*")
- 使用 Resilience4j 框架实现
- 配置文件指定具体限流参数

#### 4.2.6 租户默认值

**默认租户编码**
- DEFAULT_TENANT_CODE = "XBBP"
- 外部接口未传租户时使用默认值
- 适用于官网公开内容

#### 4.2.7 排序规则

**内部管理接口**
- ORDER BY create_time DESC（按创建时间）

**外部接口**
- ORDER BY publish_time DESC（按发布时间）

**置顶列表**
- ORDER BY sort DESC（按排序值）

---

### 4.3 数据权限控制

#### 4.3.1 多租户隔离

**系统公告**
- 自动注入租户编码（来自登录上下文）
- 查询、统计均按租户隔离

**官网文章**
- 内部接口：自动注入租户编码
- 外部接口：支持指定租户或使用默认值

#### 4.3.2 应用端隔离

**系统公告**
- 按 appCode 和 appClient 组合控制可见范围
- 同一公告可配置多端可见

**官网文章**
- 按租户隔离（不区分应用端）
- 适用于官网公开内容

---

### 4.4 操作日志记录

**自动记录操作**
- @OperateLog(type=ADD/UPDATE/DELETE, description="...")
- 记录操作人、操作时间、操作类型
- 用于审计和追溯

**记录的操作**
- 官网文章：新增、编辑、删除、上下架、置顶调整

---

### 4.5 事务控制

**事务边界**
- 系统公告：新增、编辑、删除（公告主表 + 详情表）
- @Transactional(rollbackFor = Exception.class)

**原子性保证**
- 主表和详情表要么同时成功，要么同时回滚
- 删除操作级联删除关联数据

---

### 4.6 远程服务调用汇总

| 服务 | 方法 | 说明 |
|------|------|------|
| UserInfoService | getTenantIgnoreUserListByIds | 查询用户信息（忽略租户） |

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0
**Service实现类**: `AnnouncementServiceImpl`, `NewsInfoServiceImpl`
**参考模板**: AgreementInfoControllerV2-业务文档.md
