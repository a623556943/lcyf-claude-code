---
name: lcyf-system-internal-api
description: 系统内部接口与网关。java-developer 在调用内部服务接口时使用；planner 在规划内部 API 网关时使用。
---

# System模块 中介核心内部接口业务文档

**Controller路径**: `/api/v1/system`
**负责人**: yuhang
**创建时间**: 2024-08-01
**最后更新**: 2026-01-27

---

## 目录

- [一、HX系统内部接口 (InnerHxController)](#一hx系统内部接口-innerhxcontroller)
  - [1.1 公共接口](#11-公共接口)
  - [1.2 账号管理接口](#12-账号管理接口)
  - [1.3 权限管理接口](#13-权限管理接口)
  - [1.4 白名单接口](#14-白名单接口)
  - [1.5 黑名单接口](#15-黑名单接口)
  - [1.6 供应商接口](#16-供应商接口)
- [二、HX账号管理接口 (AccountHxController)](#二hx账号管理接口-accounthxcontroller)
  - [2.1 批量创建账号](#21-批量创建账号)
  - [2.2 同步渠道部门账号](#22-同步渠道部门账号)
- [三、HX白名单接口 (WhiteListHxController)](#三hx白名单接口-whitelisthxcontroller)
  - [3.1 白名单身份验证](#31-白名单身份验证)
  - [3.2 白名单分页查询](#32-白名单分页查询)
  - [3.3 投保签名白名单查询](#33-投保签名白名单查询)
- [四、关键业务规则](#四关键业务规则)

---

## 一、HX系统内部接口 (InnerHxController)

**URL前缀**: `/api/v1/system`
**说明**: 中介核心系统对外提供的内部接口，供HX系统调用

### 1.1 公共接口

#### 接口1: 获取地区信息

**HTTP方法**: `GET`
**URL**: `/inner/common/queryAreaInfo`
**返回类型**: `String` (JSON格式)

**业务逻辑分阶段**:

**阶段一：查询区域信息**
- 调用 agentServiceV2.queryAgentAreaDetails()
- 获取代理人入职所需的省市区信息

**阶段二：返回结果**
- 返回完整的区域树形结构数据
- JSON格式包含省、市、区三级层次

**关键业务规则**:
- 无需认证即可访问
- 数据用于代理人入职流程中的地区选择

---

### 1.2 账号管理接口

#### 接口1: 账号分页查询（名称模糊）

**HTTP方法**: `POST`
**URL**: `/inner/hx/account/admin/name/page/user`
**入参**: `AccountInfoHxPageReqDto`
- nickName: 账号昵称（模糊查询）
- pageNum: 页码
- pageSize: 每页数量

**返回类型**: `CommonResult<PageResult<AccountInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
```java
TenantContextHolder.setIgnore(true)
// 设置租户隔离忽略标识，允许跨租户查询
```

**阶段二：分页查询**
- 调用 accountHxService.pageAccountInfoHxRespDto(accountInfoHxPageReqDto)
- 根据名称模糊匹配账号信息
- 支持跨租户查询

**阶段三：返回结果**
- 返回账号分页列表
- 包含账号基本信息：id, userCode, nickName, mobile等

**关键业务规则**:
- 跨租户查询（TenantContextHolder.setIgnore(true)）
- 无需认证即可访问
- 名称支持模糊匹配

---

#### 接口2: 通过手机号查询账号

**HTTP方法**: `POST`
**URL**: `/inner/hx/account/admin/mobile/query/user`
**入参**: `AccountInfoHxReqDto`
- mobiles: 手机号集合（Set<String>）

**返回类型**: `CommonResult<List<AccountInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
```java
if (CollectionUtils.isEmpty(accountInfoHxReqDto.getMobiles())) {
    throw new ServiceException(GlobalErrorCodeConstants.BAD_REQUEST)
}
```

**阶段二：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)
- 允许跨租户查询

**阶段三：批量查询**
- 调用 accountHxService.getAccountByMobiles(mobiles)
- 根据手机号集合批量查询账号信息

**阶段四：返回结果**
- 返回账号列表（可能为空列表）
- 不存在的手机号不返回数据

**关键业务规则**:
- 手机号集合不能为空
- 支持批量查询（多个手机号）
- 跨租户查询
- 无需认证

---

#### 接口3: 通过账号ID查询账号

**HTTP方法**: `POST`
**URL**: `/inner/hx/account/admin/id/query/user`
**入参**: `AccountInfoHxReqDto`
- accountIds: 账号ID集合（Set<String>）

**返回类型**: `CommonResult<List<AccountInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 校验 accountIds 不为空
- 为空抛出 BAD_REQUEST 异常

**阶段二：批量查询**
- 设置跨租户查询标识
- 调用 accountHxService.getAccountByIds(accountIds)

**阶段三：返回结果**
- 返回账号信息列表

**关键业务规则**:
- 支持批量查询
- 跨租户查询
- 账号ID集合必填

---

#### 接口4: 获取全部账号信息

**HTTP方法**: `GET`
**URL**: `/inner/hx/account/admin/all/query/user`
**入参**: 无

**返回类型**: `CommonResult<List<AccountInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：查询全部账号**
- 调用 accountHxService.getAccountAll()
- 返回系统所有账号信息

**阶段三：返回结果**
- 返回账号完整列表

**关键业务规则**:
- 无需认证
- 跨租户查询所有账号
- 可能返回大量数据，建议谨慎使用

---

#### 接口5: 通过名称模糊查询账号（非分页）

**HTTP方法**: `GET`
**URL**: `/inner/hx/account/admin/name/query/user`
**入参**:
- nickName: 账号昵称（可选）

**返回类型**: `CommonResult<List<AccountInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置跨租户查询标识

**阶段二：模糊查询**
- 调用 accountHxService.getAccountByName(nickName)
- nickName为空时返回全部账号

**阶段三：返回结果**
- 返回匹配的账号列表

**关键业务规则**:
- 名称可选（为空返回全部）
- 支持模糊匹配
- 非分页查询

---

### 1.3 权限管理接口

#### 接口1: 通过用户编码获取账号权限

**HTTP方法**: `GET`
**URL**: `/inner/hx/account/admin/id/query/permission`
**入参**:
- userCode: 用户编码（必填）

**返回类型**: `CommonResult<List<PermissionInfoHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：查询用户权限**
- 调用 accountHxService.getPermissionByUserCode(userCode)
- 获取用户的所有权限信息

**阶段三：返回权限列表**
- 返回权限详细信息
- 包含：权限编码、权限名称、菜单路径等

**关键业务规则**:
- userCode必填
- 跨租户查询
- 返回用户完整权限树

---

#### 接口2: 通过角色ID获取组别

**HTTP方法**: `POST`
**URL**: `/inner/hx/role/admin/id/query/group`
**入参**: `RoleHxReqDto`
- roleIds: 角色ID集合

**返回类型**: `CommonResult<Set<String>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置跨租户查询标识

**阶段二：查询角色组别**
- 调用 accountHxService.queryRoleChannelGroup(roleHxReqDto)
- 获取角色关联的渠道组别信息

**阶段三：返回组别编码**
- 返回渠道组编码集合（去重）

**关键业务规则**:
- 支持批量查询多个角色
- 返回渠道组别编码集合
- 跨租户查询

---

### 1.4 白名单接口

#### 接口1: 白名单分页查询

**HTTP方法**: `POST`
**URL**: `/inner/hx/whiteList/page`
**入参**: `WhiteListHxReqDto`
- pageNum: 页码
- pageSize: 每页数量
- mobile: 手机号（可选）
- idCard: 身份证号（可选）
- name: 姓名（可选）

**返回类型**: `CommonResult<PageResult<WhiteListHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：分页查询白名单**
- 调用 whiteListService.getWhiteListPageByHx(whiteListHxReqDto)
- 根据条件过滤白名单记录

**阶段三：返回分页结果**
- 返回白名单记录列表
- 包含身份信息和生效场景

**关键业务规则**:
- 无需认证
- 跨租户查询
- 支持多条件过滤

---

#### 接口2: 投保签名白名单分页查询

**HTTP方法**: `POST`
**URL**: `/inner/hx/whiteList/applySign/page`
**入参**: `WhiteListHxReqDto`

**返回类型**: `CommonResult<PageResult<WhiteListHxApplySignRespDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置跨租户查询标识

**阶段二：查询投保签名白名单**
- 调用 whiteListService.getWhiteListApplySignPageByHx(whiteListHxReqDto)
- 专门查询投保签名相关的白名单记录

**阶段三：返回专用数据结构**
- 返回投保签名白名单信息
- 包含签名相关的特定字段

**关键业务规则**:
- 专门用于投保签名场景
- 跨租户查询
- 数据结构与普通白名单不同

---

#### 接口3: 白名单身份要素验证（无需认证）

**HTTP方法**: `POST`
**URL**: `/inner/hx/whiteList/identity/valid`
**入参**: `WhiteListValidDto`
- mobile: 手机号
- idCard: 身份证号
- name: 姓名
- effectType: 生效场景类型
- validType: 验证要素类型

**返回类型**: `CommonResult<Object>`
**实际返回**: `WhiteListValidResultDto { isValidPass: Boolean }`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：身份要素验证**
- 调用 whiteListService.valid(whiteListValidDto)
- 验证逻辑：
  1. 根据手机号、身份证、姓名查询白名单记录
  2. 检查白名单是否存在且状态为启用
  3. 检查生效场景是否匹配
  4. 检查验证要素类型是否匹配

**阶段三：返回验证结果**
- isValidPass = true: 通过白名单验证
- isValidPass = false: 未通过验证

**关键业务规则**:
- 无需认证即可调用
- 跨租户验证
- 三要素（手机号、身份证、姓名）必须完全匹配
- 生效场景和验证要素必须匹配
- 白名单状态必须为启用

**操作日志**:
- 记录类型: QUERY
- 描述: "无需认证-获取白名单身份要素验证结果"

---

### 1.5 黑名单接口

#### 接口1: 黑名单验证

**HTTP方法**: `POST`
**URL**: `/inner/hx/blackList/valid`
**入参**: `BlackListValidDto`
- mobile: 手机号
- idCard: 身份证号
- name: 姓名

**返回类型**: `CommonResult<BlackListValidResultDto>`
**返回字段**:
- isBlacklist: 是否在黑名单中
- remark: 黑名单原因（如果在黑名单中）

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：黑名单校验**
- 调用 systemRiskControlApplicationService.checkIsBlacklist()
- 参数包含身份信息和应用编码（LCYF）

**阶段三：返回验证结果**
- isBlacklist = true: 在黑名单中，拒绝操作
- isBlacklist = false: 不在黑名单中，允许继续

**关键业务规则**:
- 无需认证
- 跨租户验证
- 支持多要素匹配（手机号、身份证、姓名）
- 返回黑名单原因用于提示

**操作日志**:
- 记录类型: QUERY
- 描述: "无需认证-获取黑名单验证结果"

---

### 1.6 供应商接口

#### 接口1: 查询供应商总公司（分页）

**HTTP方法**: `GET`
**URL**: `/inner/hx/supplier/page`
**入参**: `SupplierInfoPageQuery` + HttpServletRequest参数
- name: 供应商名称（可选）
- type: 供应商类型（可选）
- pageNum: 页码
- pageSize: 每页数量

**返回类型**: `CommonResult<PageResult<SupplierInfoDto>>`

**业务逻辑分阶段**:

**阶段一：租户上下文处理**
- 设置 TenantContextHolder.setIgnore(true)

**阶段二：参数处理**
```java
Map<String, Object> map = MapUtils.flat(request.getParameterMap())
// 强制设置查询级别为总公司
map.put("level", SupplierLevelEnum.SUPPLIER_LEVEL_0.getCode())
```

**阶段三：分页查询**
- 调用 supplierInfoService.getSupplierInfoPage(map)
- 查询条件包含：名称、类型、级别

**阶段四：返回供应商列表**
- 返回供应商总公司分页数据
- 包含：编码、名称、类型、银保监编码等

**关键业务规则**:
- 无需认证
- 跨租户查询
- 强制限制级别为总公司（SUPPLIER_LEVEL_0）
- 不会查询到分支机构数据

**数据过滤规则**:
- level自动设为0（总公司）
- 用户传入的level参数会被覆盖
- 保证只返回总公司级别的供应商

---

## 二、HX账号管理接口 (AccountHxController)

**URL前缀**: `/api/v1/system`
**说明**: HX系统账号管理接口，需要认证

### 2.1 批量创建账号

#### 接口1: 批量创建账号（导入账号专用）

**HTTP方法**: `POST`
**URL**: `/auth/hx/account/admin/create/batch`
**入参**: `AccountInfoOuterBatchAddCmd`
- accounts: 账号信息列表
  - mobile: 手机号（必填）
  - nickName: 昵称（必填）
  - realName: 真实姓名
  - idCard: 身份证号
  - deptCode: 部门编码
  - roleIds: 角色ID列表

**返回类型**: `CommonResult<Object>`
**实际返回**: `Boolean`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 校验账号列表不为空
- 校验每个账号的必填字段
- 校验手机号格式
- 校验身份证格式（如果提供）

**阶段二：批量创建账号**
- 调用 accountHxService.createBatchOuterAccountAndOpenApp(cmd)
- 处理逻辑：
  1. 检查手机号是否已存在
  2. 创建橙芯系统账号
  3. 创建中介核心系统账号
  4. 开通应用权限
  5. 关联部门信息
  6. 分配角色权限

**阶段三：返回创建结果**
- true: 批量创建成功
- false: 部分或全部创建失败

**关键业务规则**:
- 需要认证
- 同时在橙芯和中介核心系统创建账号
- 自动开通应用权限
- 手机号唯一性校验
- 支持批量导入

**操作日志**:
- 记录类型: ADD
- 描述: "批量创建账号"

**异常处理**:
- 手机号已存在：跳过该账号，继续处理下一个
- 部门不存在：抛出异常
- 角色不存在：抛出异常

---

### 2.2 同步渠道部门账号

#### 接口1: 同步渠道部门账号

**HTTP方法**: `POST`
**URL**: `/auth/lcyf/account/sync/channel/dept/create/batch`
**入参**: `ChannelToBAccountAddCmd`
- channelCode: 渠道编码（必填）
- channelName: 渠道名称（必填）
- depts: 部门信息列表
- accounts: 账号信息列表

**返回类型**: `CommonResult<AccountSyncResultDto>`
**返回字段**:
- successCount: 成功同步数量
- failCount: 失败数量
- failDetails: 失败详情列表

**业务逻辑分阶段**:

**阶段一：参数校验**
- 校验渠道编码和名称
- 校验部门列表结构
- 校验账号列表结构

**阶段二：同步渠道信息**
- 调用 accountHxService.syncChannelAndDeptAccount(cmd)
- 处理流程：
  1. 创建或更新渠道基础信息
  2. 同步渠道下级部门信息
  3. 创建或更新部门层级关系
  4. 批量同步账号信息
  5. 关联账号与部门关系
  6. 分配默认权限

**阶段三：统计同步结果**
- 统计成功和失败数量
- 记录失败详情（账号、原因）

**阶段四：返回同步结果**
- 返回同步统计信息

**关键业务规则**:
- 需要认证
- 同步乐橙云服渠道相关信息
- 包含：渠道基础信息、部门信息、账号信息
- 支持增量同步（存在则更新，不存在则创建）
- 原子性：渠道、部门、账号作为一个整体同步

**数据同步策略**:
- 渠道：根据channelCode判断，存在更新，不存在创建
- 部门：根据deptCode判断，存在更新，不存在创建
- 账号：根据mobile判断，存在更新，不存在创建

**异常处理**:
- 渠道创建失败：整个同步失败
- 部门创建失败：跳过该部门及其下账号
- 账号创建失败：记录失败详情，继续处理下一个

---

## 三、HX白名单接口 (WhiteListHxController)

**URL前缀**: `/api/v1/system`
**说明**: HX系统白名单接口，需要认证

### 3.1 白名单身份验证

#### 接口1: 白名单身份要素验证（需认证）

**HTTP方法**: `POST`
**URL**: `/auth/hx/whiteList/identity/valid`
**入参**: `WhiteListValidDto`
- mobile: 手机号
- idCard: 身份证号
- name: 姓名
- effectType: 生效场景类型
- validType: 验证要素类型

**返回类型**: `CommonResult<Object>`
**实际返回**: `WhiteListValidResultDto { isValidPass: Boolean }`

**业务逻辑分阶段**:

**阶段一：身份要素验证**
- 调用 whiteListService.valid(whiteListValidDto)
- 验证流程与 InnerHxController 相同，但需要认证

**阶段二：返回验证结果**
- isValidPass = true: 通过验证
- isValidPass = false: 未通过验证

**关键业务规则**:
- 需要认证（与 InnerHxController 的区别）
- 不跨租户查询（使用当前登录用户的租户）
- 验证逻辑与无认证接口相同

**操作日志**:
- 记录类型: QUERY
- 描述: "需认证-获取白名单身份要素验证结果"

**与 InnerHxController 差异**:
| 项目 | Inner接口 | Auth接口 |
|------|----------|---------|
| 认证要求 | 无需认证 | 需要认证 |
| 租户隔离 | TenantContextHolder.setIgnore(true) | 租户隔离生效 |
| 使用场景 | HX系统内部调用 | 外部系统调用 |

---

### 3.2 白名单分页查询

#### 接口1: 白名单分页查询（需认证）

**HTTP方法**: `POST`
**URL**: `/auth/hx/whiteList/page`
**入参**: `WhiteListHxReqDto`
- pageNum: 页码
- pageSize: 每页数量
- mobile: 手机号（可选）
- idCard: 身份证号（可选）
- name: 姓名（可选）

**返回类型**: `CommonResult<PageResult<WhiteListHxRespDto>>`

**业务逻辑分阶段**:

**阶段一：分页查询**
- 调用 whiteListService.getWhiteListPageByHx(whiteListHxReqDto)
- 根据当前登录用户的租户过滤数据

**阶段二：返回分页结果**
- 返回白名单记录列表

**关键业务规则**:
- 需要认证
- 租户隔离生效
- 支持多条件过滤

---

### 3.3 投保签名白名单查询

#### 接口1: 投保签名白名单分页查询（需认证）

**HTTP方法**: `POST`
**URL**: `/auth/hx/whiteList/applySign/page`
**入参**: `WhiteListHxReqDto`

**返回类型**: `CommonResult<PageResult<WhiteListHxApplySignRespDto>>`

**业务逻辑分阶段**:

**阶段一：查询投保签名白名单**
- 调用 whiteListService.getWhiteListApplySignPageByHx(whiteListHxReqDto)
- 租户隔离生效

**阶段二：返回专用数据结构**
- 返回投保签名白名单信息

**关键业务规则**:
- 需要认证
- 租户隔离生效
- 专门用于投保签名场景

---

## 四、关键业务规则

### 4.1 租户隔离规则

| Controller | 租户隔离策略 | 说明 |
|------------|------------|------|
| InnerHxController | TenantContextHolder.setIgnore(true) | 跨租户查询，所有接口忽略租户隔离 |
| AccountHxController | 租户隔离生效 | 使用当前登录用户租户 |
| WhiteListHxController | 租户隔离生效 | 使用当前登录用户租户 |

### 4.2 认证权限规则

| URL Pattern | 认证要求 | 说明 |
|-------------|---------|------|
| /inner/** | 无需认证 | HX系统内部接口 |
| /auth/** | 需要认证 | 外部系统调用接口 |

### 4.3 白名单验证规则

**验证条件（全部满足才通过）**:
1. 三要素匹配：手机号、身份证号、姓名完全匹配
2. 白名单状态：启用状态
3. 生效场景：effectType匹配
4. 验证要素：validType匹配
5. 有效期：当前时间在有效期内（如果设置了有效期）

### 4.4 黑名单验证规则

**验证逻辑**:
- 匹配任一要素即认定为黑名单：手机号、身份证号、姓名
- 黑名单优先级高于白名单
- 返回黑名单原因供业务层处理

### 4.5 账号同步规则

**批量创建账号**:
- 同时创建橙芯和中介核心系统账号
- 手机号唯一性校验
- 失败不影响其他账号创建

**渠道部门同步**:
- 支持增量同步（存在更新，不存在创建）
- 渠道 → 部门 → 账号 层级同步
- 原子性：渠道创建失败则整体失败

### 4.6 数据查询过滤规则

**供应商查询**:
- 强制限制级别为总公司（SUPPLIER_LEVEL_0）
- 用户无法通过参数查询分支机构
- 保证数据安全性

**账号查询**:
- 支持多种查询方式：手机号、ID、名称
- 支持批量查询
- 支持分页和非分页

### 4.7 操作日志规则

| 操作类型 | 记录内容 | 说明 |
|---------|---------|------|
| 白名单验证 | 验证结果、验证要素 | 区分认证和非认证接口 |
| 黑名单验证 | 验证结果、黑名单原因 | 记录命中黑名单的情况 |
| 批量创建账号 | 成功数量、失败详情 | 记录批量操作结果 |

### 4.8 安全控制规则

**内部接口安全**:
- TenantContextHolder.setIgnore(true) 仅用于 InnerHxController
- 内部接口通过网络隔离保证安全
- 不对外暴露

**外部接口安全**:
- 必须通过认证
- 租户隔离生效
- 数据权限控制

### 4.9 远程服务调用汇总

| 服务 | 方法 | 说明 |
|------|------|------|
| AgentServiceV2 | queryAgentAreaDetails | 获取代理人入职区域信息 |
| AccountHxService | pageAccountInfoHxRespDto | 账号分页查询 |
| AccountHxService | getAccountByMobiles | 通过手机号批量查询账号 |
| AccountHxService | getAccountByIds | 通过ID批量查询账号 |
| AccountHxService | getAccountAll | 获取全部账号 |
| AccountHxService | getAccountByName | 通过名称模糊查询账号 |
| AccountHxService | getPermissionByUserCode | 获取用户权限 |
| AccountHxService | queryRoleChannelGroup | 获取角色渠道组 |
| AccountHxService | createBatchOuterAccountAndOpenApp | 批量创建外部账号 |
| AccountHxService | syncChannelAndDeptAccount | 同步渠道部门账号 |
| WhiteListService | getWhiteListPageByHx | 白名单分页查询 |
| WhiteListService | getWhiteListApplySignPageByHx | 投保签名白名单查询 |
| WhiteListService | valid | 白名单身份验证 |
| SystemRiskControlApplicationService | checkIsBlacklist | 黑名单验证 |
| SupplierInfoService | getSupplierInfoPage | 供应商分页查询 |

### 4.10 接口URL规则

| URL前缀 | 认证要求 | 租户隔离 | 使用场景 |
|---------|---------|---------|---------|
| /inner/common/** | 无需认证 | 跨租户 | 公共接口（地区信息） |
| /inner/hx/** | 无需认证 | 跨租户 | HX系统内部接口 |
| /auth/hx/** | 需要认证 | 租户隔离 | HX系统外部接口 |
| /auth/lcyf/** | 需要认证 | 租户隔离 | 乐橙云服接口 |

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0
**参考模板**: AgreementInfoControllerV2-业务文档.md, system业务文档-人员和组织机构补充.md
**Controller列表**:
- InnerHxController (中介核心系统内部接口)
- AccountHxController (HX账号管理接口)
- WhiteListHxController (HX白名单接口)
