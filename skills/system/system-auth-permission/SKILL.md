---
name: lcyf-system-auth-permission
description: 账号用户权限模块，包括用户管理、角色权限、菜单权限、数据权限等。当执行 java-developer 或 planner agent 需要了解此模块时激活
---

# System 模块 业务文档 - 账号、用户与权限管理

**涵盖范围**: 账号管理、用户认证、权限控制、组织架构、菜单脱敏
**主要Controller**:
- Account系列（通用、后台、业务）
- Auth系列（登录、用户）
- Dept部门管理
- Role系列（通用、后台、业务）
- Menu菜单
- Permission权限
- Sensitive脱敏

**创建时间**: 2026-01-27
**文档版本**: V1.0

---

## 目录

- [一、账号管理接口](#一账号管理接口)
- [二、用户认证与登录](#二用户认证与登录)
- [三、用户信息管理](#三用户信息管理)
- [四、部门组织架构](#四部门组织架构)
- [五、角色权限管理](#五角色权限管理)
- [六、菜单权限管理](#六菜单权限管理)
- [七、权限控制接口](#七权限控制接口)
- [八、脱敏数据管理](#八脱敏数据管理)
- [九、关键业务规则](#九关键业务规则)

---

## 一、账号管理接口

### 1.1 账号通用接口 (AccountController)

**URL前缀**: `/api/v1/system/auth/account`

#### 接口1: 重置随机密码

**HTTP方法**: `POST`
**URL**: `/resetPassword`
**入参**: `RestPasswordCmd`
**返回类型**: `CommonResult<String>` (返回生成的新密码)

**业务逻辑分阶段**:

**阶段一：参数校验**
- 用户编码校验必填

**阶段二：生成随机密码**
- 调用 accountService.resetRandomPassword(cmd)
- 生成符合要求的随机密码

**阶段三：更新数据库**
- 更新账号密码表(sys_user_account)
- 加密存储新密码

**阶段四：操作日志**
- 记录: 重置密码（需要记录数据变更）

**关键业务规则**:
- 返回明文密码供管理员告知用户
- 密码重置后需要用户确认更新

---

#### 接口2: 重置指定密码

**HTTP方法**: `POST`
**URL**: `/assign/resetPassword`
**入参**: `RestAssignPasswordCmd`（包含新密码）
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 用户编码、新密码校验

**阶段二：密码校验**
- 验证新密码符合格式要求

**阶段三：更新密码**
- 调用 accountService.resetAssignPassword(cmd)
- 将新密码加密后保存

**关键业务规则**:
- 与随机重置不同，此接口接受指定的密码
- 用于批量重置、初始化等场景

---

#### 接口3: 冻结账号

**HTTP方法**: `PUT`
**URL**: `/freeze`
**入参**: `AccountStatusUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：账号存在性校验**
- 查询账号是否存在

**阶段二：冻结操作**
- 调用 accountService.freezeAccount(cmd)
- 设置账号状态为冻结(FREEZE)

**阶段三：同步更新**
- 更新sys_user_account表
- 生成操作日志

**关键业务规则**:
- 冻结后账号无法登录
- 可以随时解冻
- 需要记录数据变更

---

#### 接口4: 解冻账号

**HTTP方法**: `PUT`
**URL**: `/unfreeze`
**入参**: `AccountStatusUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：账号验证**
- 验证账号存在且处于冻结状态

**阶段二：解冻操作**
- 调用 accountService.unfreezeAccount(cmd)
- 设置账号状态为正常(ENABLE)

**阶段三：恢复登录权限**
- 清除冻结标记
- 记录操作日志

---

#### 接口5: 查看账号详情

**HTTP方法**: `GET`
**URL**: `/get/details`
**入参**: `userCode` (查询参数)
**返回类型**: `CommonResult<AccountDetailsDto>`

**业务逻辑分阶段**:

**阶段一：查询用户信息**
- 根据 userCode 查询 sys_user表

**阶段二：查询账号绑定**
- 查询该用户的账号列表(可能多个应用)
- 查询账号的最后登录时间

**阶段三：组装返回对象**
- 包含: 用户基本信息、账号状态、登录历史等

---

#### 接口6: 解除绑定微信openId

**HTTP方法**: `PUT`
**URL**: `/wechat/unbindOpenId/{userCode}`
**入参**: `userCode` (路径参数)
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：查询用户**
- 根据 userCode 查询用户

**阶段二：清除微信绑定**
- 调用 accountService.wechatUnbindOpenId(userCode)
- 更新 wechat_open_id 字段为null

**关键业务规则**:
- 解绑后用户无法通过微信登录
- 支持重新绑定

---

### 1.2 后台账号管理 (AccountAdminController)

**URL前缀**: `/api/v1/system/auth/account/admin`

#### 接口1: 查询全部账号分页列表

**HTTP方法**: `GET`
**URL**: `/page/all`
**入参**: `AccountQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<AccountAdminInfoDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 将HttpServletRequest转换为Map
- 自动注入租户编码: LoginUtil.tenantCode()

**阶段二：强制限制**
- 强制设置 appScope = ADMIN（后台应用）
- 确保只查询后台账号

**阶段三：分页查询**
- 调用 accountService.queryAllAccountPage(map)
- 支持多维度过滤（应用、用户、状态等）

**关键业务规则**:
- 多租户隔离: 只显示当前租户的账号
- scope限制: 后台账号与业务账号分离

---

#### 接口2: 查询应用下账号分页列表

**HTTP方法**: `GET`
**URL**: `/page/application`
**入参**: `AccountQuery` + appUniqueId (必填)
**返回类型**: `CommonResult<PageResult<LoginInfoView>>`

**业务逻辑分阶段**:

**阶段一：应用校验**
- 验证 appUniqueId 不为空
- 校验应用是否存在

**阶段二：参数准备**
- 扁平化HttpServletRequest参数
- 注入租户、应用信息

**阶段三：分页查询**
- 调用 accountService.queryAccountByAppCodePage(accountQuery, map)
- 返回指定应用下的账号列表

---

#### 接口3: 创建后台账号

**HTTP方法**: `POST`
**URL**: `/create`
**入参**: `AccountInfoAddCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：自动注入**
```
cmd.setTenantCode(LoginUtil.tenantCode())
cmd.setScope(ApplicationScopeEnum.ADMIN.getCode())
```

**阶段二：账号创建**
- 调用 accountService.createAccount(cmd)
- INSERT sys_user_account表
- 生成初始密码并返回

**阶段三：权限分配**
- 如果指定了角色，自动分配角色权限

**阶段四：操作日志**
- 记录: 创建账号

---

#### 接口4: 编辑后台账号

**HTTP方法**: `POST`
**URL**: `/update`
**入参**: `AccountUpdateCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：查询现有账号**
- 根据 loginUniqueId 查询账号信息

**阶段二：更新字段**
- 支持更新: 用户名、邮箱、手机、状态、绑定角色等

**阶段三：权限同步**
- 如果更新了角色，同步权限表

**阶段四：数据变更记录**
- 记录: 编辑账号

---

### 1.3 业务账号管理 (AccountBizController)

**URL前缀**: `/api/v1/system/auth/account/biz`

#### 接口1: 查询全部业务账号

**HTTP方法**: `GET`
**URL**: `/page/all`
**入参**: `AccountBizQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<AccountBizInfoDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化参数
- 自动注入租户编码

**阶段二：强制限制**
- 强制设置 appScope = BUSINESS（业务应用）

**阶段三：分页查询**
- 调用 accountService.queryBizAllAccountPage(accountBizQuery, map)
- 返回业务账号列表

---

#### 接口2: 查询应用下业务账号

**HTTP方法**: `GET`
**URL**: `/page/application`
**入参**: `AccountBizQuery` + appUniqueId (必填)
**返回类型**: `CommonResult<PageResult<AccountBizInfoDto>>`

**业务逻辑分阶段**:

**阶段一：应用校验**
- 验证 appUniqueId 非空
- 检查应用存在性

**阶段二：参数准备**
- 强制 appScope = BUSINESS

**阶段三：分页查询**
- 调用 accountService.queryBizAppAccountPage(accountBizQuery, map)

---

#### 接口3: 查询渠道下账号

**HTTP方法**: `GET`
**URL**: `/page/channel`
**入参**: `ChannelAccountPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<ChannelAccountInfoDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 渠道编码(channelCode)必填

**阶段二：参数处理**
- 扁平化参数
- 注入租户信息

**阶段三：分页查询**
- 调用 accountService.queryBizToChannelPage(channelAccountPageQuery, map)
- 返回指定渠道下的账号列表

---

#### 接口4: 创建业务账号

**HTTP方法**: `POST`
**URL**: `/create`
**入参**: `AccountInfoAddCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：自动注入**
```
cmd.setScope(ApplicationScopeEnum.BUSINESS.getCode())
cmd.setTenantCode(LoginUtil.tenantCode())
```

**阶段二：账号创建**
- 调用 accountService.createAccount(cmd)
- 创建业务账号记录

**阶段三：操作日志**
- 记录: 创建业务账号

---

#### 接口5: 创建渠道下级账号

**HTTP方法**: `POST`
**URL**: `/create/channel`
**入参**: `ChannelAccountInfoAddCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：角色权限校验**
```
for (String roleUniqueId : cmd.getRoleUniqueIds()) {
  if (!accountService.BizRoleAuthorization(
    null,
    roleUniqueId,
    LCYF.getCode(),
    cmd.getChannelCode(),
    cmd.getDeptCode()
  )) {
    return CommonResult.error(USER_ROLE_UN_AUTHORIZATION)
  }
}
```

**阶段二：设置创建参数**
```
cmd.setIsThrowableAccountExist(true)
cmd.setCreateSource(AppCodeEnum.CX.getCode())
cmd.setTenantCode(LoginUtil.tenantCode())
```

**阶段三：创建账号**
- 调用 accountService.createChannelAccount(cmd)
- 返回base64编码的密码

**关键业务规则**:
- 需要验证上级是否有授权该角色权限
- 渠道账号与业务账号不同，有单独的权限体系

---

#### 接口6: 编辑业务账号

**HTTP方法**: `POST`
**URL**: `/update`
**入参**: `AccountUpdateCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：应用信息查询**
- 根据 appUniqueId 查询应用信息

**阶段二：权限校验**
```
if (applicationDto.getCode().equals(LCYF.getCode()) ||
    applicationDto.getCode().equals(AppCodeEnum.JI_ZHAN.getCode())) {
  for (String roleUniqueId : cmd.getRoleUniqueIds()) {
    if (!accountService.BizRoleAuthorization(
      cmd.getLoginUniqueId(),
      roleUniqueId,
      applicationDto.getCode(),
      cmd.getChannelCode(),
      cmd.getDeptCode()
    )) {
      return CommonResult.error(USER_ROLE_UN_AUTHORIZATION)
    }
  }
}
```

**阶段三：账号更新**
- 调用 accountService.updateBizAccount(cmd)

---

#### 接口7: 编辑渠道下级账号

**HTTP方法**: `POST`
**URL**: `/update/channel`
**入参**: `ChannelAccountInfoUpdateCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：用户部门查询**
```
String userCode = accountService.getUserCode(
  cmd.getLoginUniqueId(),
  LCYF.getCode()
)
DeptDto userDept = deptService.getUserDept(userCode)
if (userDept == null) {
  return CommonResult.error(DEPT_NOT_FOUND)
}
```

**阶段二：角色权限校验**
- 验证上级对目标角色的授权状态

**阶段三：账号更新**
- 调用 accountService.modifyChannelAccount(cmd)

---

#### 接口8: 导出渠道账号

**HTTP方法**: `GET`
**URL**: `/export/channel`
**入参**: `ChannelAccountPageQuery` + HttpServletRequest + HttpServletResponse
**返回类型**: void (文件流)

**业务逻辑分阶段**:

**阶段一：参数准备**
- 扁平化请求参数

**阶段二：数据查询与导出**
- 调用 accountService.exportAccountToChannel(paraMap, response)
- 异步生成Excel文件

---

## 二、用户认证与登录

### 2.1 登录接口 (LoginController)

**URL前缀**: `/api/v1/system/oauth`

#### 接口1: 密码登录

**HTTP方法**: `POST`
**URL**: `/login/in`
**入参**: `SysUserLoginCmd`
**返回类型**: `CommonResult<TokenDto>`

**业务逻辑分阶段**:

**阶段一：应用校验**
```
EnvContextHolder.setEnvWeb(Boolean.TRUE)
TenantContextHolder.setIgnore(Boolean.TRUE)
if (cmd.getAppCode().equals(AppCodeEnum.BDDS.getCode())) {
  return CommonResult.error(BDDS_NOT_ALLOW) // BDDS应用不允许登录
}
```

**阶段二：用户身份验证**
- 根据用户名和应用查询用户账号
- 校验密码正确性(加密对比)

**阶段三：账号状态检查**
- 验证账号是否被冻结
- 验证账号是否被禁用

**阶段四：生成Token**
- 调用 loginService.doLogin(cmd)
- 生成access_token和refresh_token
- 设置token过期时间

**阶段五：登录日志**
- 记录登录成功
- 更新最后登录时间

**返回结果**:
```
TokenDto {
  accessToken: String,
  refreshToken: String,
  expiresIn: Long,
  tokenType: String,
  scope: String
}
```

**关键业务规则**:
- BDDS应用禁止登录（业务限制）
- 密码需加密存储和对比
- 登录失败次数达到阈值后需要冻结账号

---

#### 接口2: 短信验证码登录

**HTTP方法**: `POST`
**URL**: `/login/sms`
**入参**: `SysUserLoginSmsCmd`
**返回类型**: `CommonResult<TokenDto>`

**业务逻辑分阶段**:

**阶段一：手机号校验**
```
if (!ValidationUtils.isMobile(cmd.getName())) {
  return CommonResult.error(AUTH_MOBILE_NOT_VALIDA)
}
```

**阶段二：短信验证码检查**
- 查询短信验证码缓存
- 校验验证码正确性
- 校验验证码是否过期

**阶段三：用户身份识别**
- 根据手机号查询用户

**阶段四：Token生成**
- 调用 loginService.doLoginSms(cmd)
- 生成Token

**关键业务规则**:
- 验证码通常5-10分钟有效期
- 同一手机号短时间内不能重复发送验证码

---

#### 接口3: 签单员短信登录

**HTTP方法**: `POST`
**URL**: `/login/signer/sms`
**入参**: `SysUserLoginSmsCmd`
**返回类型**: `CommonResult<TokenDto>`

**业务逻辑分阶段**:

**阶段一：手机号校验**
- 验证手机号格式

**阶段二：应用限制**
```
if (cmd.getAppCode().equals(AppCodeEnum.BDDS.getCode())) {
  return CommonResult.error(BDDS_NOT_ALLOW)
}
```

**阶段三：签单员身份检查**
- 验证该手机号是否绑定签单员

**阶段四：登录处理**
- 调用 loginService.doSignerLoginSms(cmd)

---

#### 接口4: 刷新Token

**HTTP方法**: `POST`
**URL**: `/auth/refresh-token/{refreshToken}`
**入参**: `refreshToken` (路径参数)
**返回类型**: `CommonResult<TokenDto>`

**业务逻辑分阶段**:

**阶段一：Token校验**
- 验证refreshToken的有效性
- 检查是否过期

**阶段二：新Token生成**
- 调用 loginService.refreshToken(refreshToken)
- 生成新的accessToken

**阶段三：返回结果**
- 返回新Token信息

---

#### 接口5: 登出

**HTTP方法**: `POST`
**URL**: `/auth/logout`
**入参**: Token (请求头)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：Token清除**
- 调用 loginService.doLoginOut()
- 清除或失效当前Token

**阶段二：会话清理**
- 清除Redis缓存中的会话信息

**阶段三：登出日志**
- 记录登出操作

---

#### 接口6: 即展业务端普通注册

**HTTP方法**: `POST`
**URL**: `/toa/reg/normal`
**入参**: `SysUserRegNormalCmd`
**返回类型**: `CommonResult<RegNormalDto>`

**业务逻辑分阶段**:

**阶段一：手机号校验**
```
if (!ValidationUtils.isMobile(cmd.getName())) {
  return CommonResult.error(AUTH_MOBILE_NOT_VALIDA)
}
```

**阶段二：应用限制**
```
if (cmd.getAppCode().equals(AppCodeEnum.BDDS.getCode())) {
  return CommonResult.error(BDDS_NOT_ALLOW)
}
```

**阶段三：自动设置应用信息**
```
cmd.setAppScope(ApplicationScopeEnum.BUSINESS.getCode())
cmd.setAppClient(ClientTypeEnum.BUSINESS.getCode())
cmd.setAppCode(AppCodeEnum.JI_ZHAN.getCode())
```

**阶段四：重复注册检查**
- 检查手机号是否已注册

**阶段五：账号创建**
- 调用 loginService.toaRegNormal(cmd)
- 创建用户和账号记录
- 生成初始密码或发送激活链接

**返回结果**:
```
RegNormalDto {
  userCode: String,
  message: String,
  // 其他信息
}
```

---

#### 接口7: 即展业务端邀请注册

**HTTP方法**: `POST`
**URL**: `/toa/reg/invite`
**入参**: `SysUserRegInviteSmsCmd`
**返回类型**: `CommonResult<RegInviteDto>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 手机号格式校验
- 邀请码校验（必填且有效）

**阶段二：应用限制**
- BDDS应用检查

**阶段三：自动设置**
```
cmd.setAppScope(ApplicationScopeEnum.BUSINESS.getCode())
cmd.setAppClient(ClientTypeEnum.BUSINESS.getCode())
cmd.setAppCode(AppCodeEnum.JI_ZHAN.getCode())
```

**阶段四：邀请人信息查询**
- 根据邀请码查询邀请人信息
- 验证邀请人的权限

**阶段五：账号创建**
- 调用 loginService.toaRegInvite(cmd)
- 建立邀请人与被邀请人的关系

---

#### 接口8: 登录页重置密码

**HTTP方法**: `POST`
**URL**: `/login/resetPassword`
**入参**: `LoginRestPasswordCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：用户身份验证**
- 根据用户标识(手机号或邮箱)查询用户

**阶段二：验证码校验**
- 校验发送至用户手机/邮箱的验证码

**阶段三：新密码设置**
- 调用 loginService.loginRestPassword(cmd)
- 更新密码

**阶段四：操作记录**
- 记录密码重置操作

---

#### 接口9: 更新最后登录时间

**HTTP方法**: `POST`
**URL**: `/auth/update/loginTime`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<UpdateLoginTimeDto>`

**业务逻辑分阶段**:

**阶段一：获取当前用户**
- 从LoginUtil获取 loginUniqueId

**阶段二：更新登录时间**
- 调用 loginService.updateLoginTime(loginUniqueId)
- 更新 last_login_time 字段

**业务用途**:
- 记录用户每日首次进入页面时间
- 用于统计活跃用户、登录频率等

**关键业务规则**:
- 用于微信环境的"静默登录"场景
- 前端缓存Token后调用此接口更新登录时间

---

#### 接口10: 微信环境登录

**HTTP方法**: `POST`
**URL**: `/toa/login/wechat`
**入参**: `LoginWechatCmd`
**返回类型**: `CommonResult<LoginWechatDto>`

**业务逻辑分阶段**:

**阶段一：微信授权码校验**
- 获取微信授权code

**阶段二：微信用户身份获取**
- 调用微信API获取openId和用户信息

**阶段三：本地用户关联**
- 根据openId查询本地绑定的用户
- 如果未绑定则提示绑定

**阶段四：Token生成**
- 调用 loginService.loginWechat(cmd)
- 生成访问Token

---

#### 接口11: 切换商户

**HTTP方法**: `POST`
**URL**: `/auth/switch/tenant`
**入参**: `LoginSwitchTenantCmd`
**返回类型**: `CommonResult<TokenDto>`

**业务逻辑分阶段**:

**阶段一：用户权限验证**
- 查询用户关联的商户列表
- 验证用户是否有权限访问目标商户

**阶段二：新Token生成**
- 调用 loginService.loginSwitchTenant(cmd, userId)
- 生成目标商户下的Token

**阶段三：返回结果**
- 返回新Token信息

**关键业务规则**:
- 仅能切换至用户有权限的商户
- 多商户场景下使用

---

### 2.2 用户信息接口 (UserInfoController)

**URL前缀**: `/api/v1/system/auth/user`

#### 接口1: 团队账号列表

**HTTP方法**: `GET`
**URL**: `/channel/page`
**入参**: `ToAChannelUserInnerPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<UserChannelPageItemToAInnerDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化HttpServletRequest参数

**阶段二：分页查询**
- 调用 userInfoService.toAInnerChannelUserPage(paraMap)
- 返回团队下的账号列表

---

#### 接口2: 根据部门查询用户分页列表

**HTTP方法**: `GET`
**URL**: `/dept/page`
**入参**: `UserPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<UserAgentView>>`

**业务逻辑分阶段**:

**阶段一：获取当前用户信息**
```
String appCode = LoginUtil.appCode()
String userCode = LoginUtil.userCode()
```

**阶段二：部门编码处理**
```
if (StringUtils.isBlank(userPageQuery.getDeptCode())) {
  // 未传部门编码，根据当前用户的渠道查询渠道下的所有用户
  ChannelToADto channel = channelToAService.getChannelByUserCodeAndAppCode(userCode, appCode)
  if (Objects.isNull(channel)) {
    return success(new PageResult<>())
  }
  flat.put("channelCode", channel.getChannelCode())
}
```

**阶段三：分页查询**
- 调用 userInfoService.getUserAgentPage(flat)

---

#### 接口3: 根据部门查询用户精简列表

**HTTP方法**: `GET`
**URL**: `/dept/simp/list`
**入参**: `UserPageQuery`
**返回类型**: `CommonResult<List<UserInfoSimpDto>>`

**业务逻辑分阶段**:

**阶段一：部门代码自动注入**
- 如果未传部门，自动从当前用户的渠道获取

**阶段二：精简列表查询**
- 调用 userInfoService.getUserSimpList(userPageQuery)
- 返回 code、name 等精简字段

---

#### 接口4: 业务后台用户分页列表

**HTTP方法**: `GET`
**URL**: `/toA/inner/page`
**入参**: `ToAUserInnerPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<UserPageItemToAInnerDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化参数

**阶段二：分页查询**
- 调用 userInfoService.toAInnerPage(paraMap)

---

#### 接口5: 团队负责人创建账号

**HTTP方法**: `POST`
**URL**: `/toA/outer/create`
**入参**: `ToAOuterCreateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：自动注入用户信息**
```
cmd.setTenantCode(LoginUtil.tenantCode())
cmd.setAppScope(ApplicationScopeEnum.BUSINESS.getCode())
cmd.setAppCode(AppCodeEnum.JI_ZHAN.getCode())
cmd.setAppClient(ClientTypeEnum.BUSINESS.getCode())
```

**阶段二：下级账号创建**
- 调用 userInfoService.toAOuterCreate(cmd, currentUserCode)
- 创建团队成员账号

---

#### 接口6: 修改用户基本信息

**HTTP方法**: `PUT`
**URL**: `/update`
**入参**: `UserBaseInfoUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 用户编码、修改项校验

**阶段二：信息更新**
- 调用 userInfoService.modify(cmd, appCode)
- 可修改: 真实姓名、电话、邮箱等

**关键业务规则**:
- 某些字段可能有权限控制
- 需要记录数据变更

---

#### 接口7: 账号注销

**HTTP方法**: `DELETE`
**URL**: `/deregister`
**入参**: `id` (用户主键)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：用户存在性校验**
- 根据ID查询用户

**阶段二：关联数据检查**
- 检查该用户是否有关联的业务数据
- 检查是否有未完成的任务

**阶段三：账号注销**
- 调用 userInfoService.deregister(id)
- 标记用户为已注销(逻辑删除)
- 清除或迁移相关数据

**关键业务规则**:
- 通常不进行物理删除，使用逻辑删除
- 注销后账号不可恢复

---

#### 接口8: 获取当前登录用户详情

**HTTP方法**: `GET`
**URL**: `/details`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<UserDetailsDto>`

**业务逻辑分阶段**:

**阶段一：获取当前用户ID**
- 从 UserInfoContextHolder 获取 userId

**阶段二：查询用户详情**
- 调用 userInfoService.get(userId)
- 包含: 基本信息、绑定账号、角色权限等

---

#### 接口9: 获取指定用户详情

**HTTP方法**: `GET`
**URL**: `/queryDetails`
**入参**: `id` (用户主键)
**返回类型**: `CommonResult<UserDetailsDto>`

**业务逻辑分阶段**:

**阶段一：用户查询**
- 根据ID查询用户信息

**阶段二：详情组装**
- 调用 userInfoService.get(id)

---

#### 接口10: 根据用户编码查询用户详情

**HTTP方法**: `GET`
**URL**: `/queryDetailsByUserCode`
**入参**: `userCode` (用户编码)
**返回类型**: `CommonResult<UserDetailsDto>`

**业务逻辑分阶段**:

**阶段一：用户查询**
- 根据userCode查询用户

**阶段二：详情返回**
- 调用 userInfoService.getUserDetailsInfo(userCode)

---

#### 接口11: 账号审核统计

**HTTP方法**: `GET`
**URL**: `/accountAudit/count`
**入参**: `AccountAuditPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<List<AccountAuditCountDto>>`

**业务逻辑分阶段**:

**阶段一：参数准备**
```
query.setTenantCode(LoginUtil.tenantCode())
```

**阶段二：统计查询**
- 调用 userInfoService.getAccountAuditCount(paraMap, query, userCode, appCode)
- 统计各审核状态的数量

---

#### 接口12: 账号审核分页查询

**HTTP方法**: `GET`
**URL**: `/accountAudit/page`
**入参**: `AccountAuditPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<AccountAuditPageItemDto>>`

**业务逻辑分阶段**:

**阶段一：权限验证**
- 检查当前用户是否有审核权限

**阶段二：分页查询**
- 调用 userInfoService.getAccountAuditPage(paraMap, query, userCode, appCode)
- 返回待审核的账号列表

---

#### 接口13: 审核账号

**HTTP方法**: `POST`
**URL**: `/accountAudit/audit`
**入参**: `AccountAuditUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：审核信息准备**
```
cmd.setAuditSource(LoginUtil.appCode())
```

**阶段二：审核处理**
- 调用 userInfoService.audit(cmd)
- 更新账号审核状态

**阶段三：通知**
- 发送审核结果通知给申请人

---

#### 接口14: 审核记录列表

**HTTP方法**: `GET`
**URL**: `/accountAudit/audit/record/{userCode}`
**入参**: `userCode` (路径参数)
**返回类型**: `CommonResult<PageResult<AccountAuditRecordDto>>`

**业务逻辑分阶段**:

**阶段一：用户查询**
- 根据userCode查询用户

**阶段二：审核记录查询**
- 调用 userInfoService.getAccountAuditRecordPage(userCode)
- 返回该用户所有审核记录

---

#### 接口15: 获取邀请人信息

**HTTP方法**: `GET`
**URL**: `/invite/inviterInfo`
**入参**: `userCode` (邀请码或手机号)
**返回类型**: `CommonResult<InviterInfoDto>`

**业务逻辑分阶段**:

**阶段一：参数校验**
```
if (StringUtils.isBlank(userCode)) {
  throw new Exception("账号手机号不能为空")
}
```

**阶段二：邀请人查询**
- 根据userCode查询邀请人信息

**阶段三：返回结果**
- 返回邀请人的基本信息

---

#### 接口16: 代理人导出

**HTTP方法**: `GET`
**URL**: `/toA/agent/export`
**入参**: `AgentExportToAQuery` + HttpServletRequest
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化参数
- 注入当前用户信息

**阶段二：数据导出**
- 调用 userInfoService.toaAgentExport(userCode, appCode, paraMap)
- 异步生成Excel文件

---

#### 接口17: 查询下级账号

**HTTP方法**: `GET`
**URL**: `/toA/h5/querySubordinateAccount`
**入参**: `SubordinateAccountPageQuery`
**返回类型**: `CommonResult<PageResult<SubordinateAccountDto>>`

**业务逻辑分阶段**:

**阶段一：部门权限检查**
- 验证当前用户是否为部门管理者

**阶段二：下级账号查询**
- 调用 userInfoService.querySubordinateAccountForH5(query, userCode, appCode)
- 返回当前部门已审核通过的用户

---

#### 接口18: 导入临时用户

**HTTP方法**: `POST`
**URL**: `/import/temp/user`
**入参**: `List<OuterTempUserDto>`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：批量数据导入**
- 调用 userInfoService.importTempOuterUserInfo(outerTempUserDtoList)
- 创建临时用户账号

---

#### 接口19: 绑定微信openId

**HTTP方法**: `POST`
**URL**: `/toA/wechat/bindOpenId`
**入参**: `BindWechatOpenIdCmd`
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：微信openId校验**
- 验证openId有效性

**阶段二：绑定操作**
- 调用 userInfoService.wechatBindOpenId(cmd, userCode, appCode, appScope)
- 更新用户的微信openId字段

**关键业务规则**:
- 同一openId不能绑定多个用户
- 支持解绑后重新绑定

---

#### 接口20: 解绑微信openId

**HTTP方法**: `POST`
**URL**: `/toA/wechat/unbindOpenId`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<Object>`

**业务逻辑分阶段**:

**阶段一：获取当前用户**
- 从LoginUtil获取userCode、appCode、appScope

**阶段二：解绑操作**
- 调用 userInfoService.wechatUnbindOpenId(userCode, appCode, appScope)
- 清除微信openId绑定

---

#### 接口21: 检查是否关注公众号

**HTTP方法**: `GET`
**URL**: `/toA/wechat/get/userinfo`
**入参**: `wechatOpenId` (公众号ID)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：公众号绑定查询**
- 根据wechatOpenId查询绑定关系

**阶段二：关注状态检查**
- 调用 userInfoService.isFollowJZOfficialAccount(wechatOpenId, appCode, appScope)
- 返回是否关注公众号

---

#### 接口22: 修改用户密码

**HTTP方法**: `PUT`
**URL**: `/updatePassword`
**入参**: `UserUpdatePasswordCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：旧密码校验**
- 验证旧密码正确性

**阶段二：新密码校验**
- 验证新密码符合复杂度要求
- 新旧密码不能相同

**阶段三：密码更新**
- 调用 userInfoService.modifyPassword(cmd)
- 加密存储新密码

---

#### 接口23: 获取商务负责人列表

**HTTP方法**: `GET`
**URL**: `/business/user`
**入参**: 无
**返回类型**: `CommonResult<List<UserInfoDto>>`

**业务逻辑分阶段**:

**阶段一：角色查询**
- 根据角色编码(SALES_ADMIN)查询所有商务负责人

**阶段二：返回结果**
- 调用 userInfoService.getUserByRoleCode(SALES_ADMIN)

---

#### 接口24: 更改是否展示服务费配置

**HTTP方法**: `PUT`
**URL**: `/changeShowServiceFee`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<UserDetailsDto>`

**业务逻辑分阶段**:

**阶段一：获取当前用户**
- 从 UserInfoContextHolder 获取userCode

**阶段二：配置切换**
- 调用 userInfoService.modifyShowServiceFee(userCode)
- 切换用户的服务费展示配置

---

## 三、部门组织架构

### 3.1 部门管理接口 (DeptController)

**URL前缀**: `/api/v1/system/auth/dept`

#### 接口1: 创建部门

**HTTP方法**: `POST`
**URL**: `/create`
**入参**: `DeptAddCmd`
**返回类型**: `CommonResult<String>`

**业务逻辑分阶段**:

**阶段一：自动注入应用和租户**
```
if (!StringUtils.hasText(cmd.getAppCode())) {
  cmd.setAppCode(LoginUtil.appCode())
}
if (!StringUtils.hasText(cmd.getTenantCode())) {
  cmd.setTenantCode(LoginUtil.tenantCode())
}
```

**阶段二：部门创建**
- 调用 deptService.createDept(cmd)
- 生成部门编码
- INSERT sys_dept表

**阶段三：返回结果**
- 返回新创建的部门编码

---

#### 接口2: 查询部门列表

**HTTP方法**: `GET`
**URL**: `/query/list`
**入参**: `isSearchUserCount` (是否查询用户数)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：当前用户部门获取**
- 从 LoginUtil.rootDeptCode() 获取根部门

**阶段二：树形查询**
- 调用 deptService.getDeptList(isSearchUserCount, rootDeptCode)
- 构建部门树形结构

**阶段三：用户数统计**
- 如果 isSearchUserCount = true，查询每个部门下的用户数量

---

#### 接口3: 更新部门名称

**HTTP方法**: `POST`
**URL**: `/updateDeptName`
**入参**: `DeptUpdateDeptNameCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：应用代码注入**
```
if (!StringUtils.hasText(cmd.getAppCode())) {
  cmd.setAppCode(LoginUtil.appCode())
}
```

**阶段二：部门名称更新**
- 调用 deptService.modifyDeptName(cmd)
- UPDATE sys_dept表

---

#### 接口4: 删除部门

**HTTP方法**: `DELETE`
**URL**: `/delete/{code}`
**入参**: `code` (部门编码)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：部门下属检查**
- 检查部门是否有下级部门

**阶段二：用户关联检查**
- 检查部门是否有用户
- 如果有用户需要先移除或迁移

**阶段三：部门删除**
- 调用 deptService.deleteDept(code)
- DELETE sys_dept表

---

#### 接口5: 查看部门详情

**HTTP方法**: `GET`
**URL**: `/query/details/{code}`
**入参**: `code` (部门编码)
**返回类型**: `CommonResult<DeptDto>`

**业务逻辑分阶段**:

**阶段一：部门查询**
- 根据code查询部门信息

**阶段二：详情组装**
- 调用 deptService.getDeptDetails(code)
- 包含: 部门信息、父部门、用户数等

---

#### 接口6: 设置部门团队长

**HTTP方法**: `PUT`
**URL**: `/update/leaderUser`
**入参**: `DeptLeaderCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：用户存在性校验**
- 验证指定的用户存在

**阶段二：部门团队长设置**
- 调用 deptService.modifyDeptLeaderUser(cmd)
- 更新部门的领导者字段

**关键业务规则**:
- 一个部门只能有一个团队长
- 设置后自动清除旧的团队长

---

#### 接口7: 查询部门精简列表

**HTTP方法**: `GET`
**URL**: `/queryDeptSimpleList`
**入参**: 无
**返回类型**: `CommonResult<List<DeptSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：获取当前用户信息**
- 从 LoginUtil 获取 userCode 和 userId

**阶段二：部门精简列表查询**
- 调用 deptService.queryDeptSimpleListToJz(userCode, userId)
- 返回当前用户有权限的部门精简信息

---

#### 接口8: 查询应用下的部门树

**HTTP方法**: `GET`
**URL**: `/query/application/dept/tree`
**入参**: `tenantCode`, `appUniqueId`
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：应用关系查询**
```
ApplicationRelaTenantDto applicationRelaTenant =
  applicationService.getApplicationRelaTenant(tenantCode, appUniqueId)
if (applicationRelaTenant == null) {
  throw new ServiceException("商户关联的应用信息不存在！")
}
```

**阶段二：部门树构建**
- 调用 deptService.queryApplicationDeptTree(
  tenantCode,
  appUniqueId,
  applicationRelaTenant.getRootDeptCode(),
  applicationRelaTenant.getAppCode()
)

---

#### 接口9: 用户注册审核设置

**HTTP方法**: `PUT`
**URL**: `/setting/audit`
**入参**: `DeptRegisterAuditCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：审核配置解析**
- 从cmd中获取: 是否启用审核、审核方式等

**阶段二：配置更新**
- 调用 deptService.modifyIsAuditSwitch(cmd)
- 更新部门的审核配置

**关键业务规则**:
- 可以配置是否启用用户注册审核
- 如果启用，则新注册用户需要审核才能激活

---

#### 接口10: 查询商户下的树结构

**HTTP方法**: `GET`
**URL**: `/query/tenant/tree`
**入参**: `tenantCode` (商户编码)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：权限检查**
- @SaCheckPermission("tenant:dept:edit")

**阶段二：部门树查询**
- 调用 deptService.getInnerTreeByTenant(tenantCode)

---

#### 接口11: 查询渠道下的树结构

**HTTP方法**: `GET`
**URL**: `/query/channel/tree`
**入参**: `channelCode` (渠道编码)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：部门树查询**
- 调用 deptService.getInnerTreeByChannel(channelCode)

---

#### 接口12: 查询团队树结构

**HTTP方法**: `GET`
**URL**: `/query/team/tree`
**入参**: `status` (可选，部门状态)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：团队树查询**
- 调用 deptService.getInnerTreeByTeam(status)

---

#### 接口13: 根据经代公司查询团队树

**HTTP方法**: `GET`
**URL**: `/query/team/tree/{licensePlate}`
**入参**: `licensePlate` (经代公司牌照编码)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：团队树查询**
- 调用 deptService.getInnerTreeByTeam(licensePlate)

---

#### 接口14: 查询部门树结构

**HTTP方法**: `GET`
**URL**: `/query/deptRoot/tree`
**入参**: `status` (可选), `type` (1=团队, 2=渠道)
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：根部门确定**
```
String rootDeptCode = type.equals(1) ?
  DEFAULT_TOA_ROOT_DEPT :
  DEFAULT_LCYF_ROOT_DEPT
```

**阶段二：树形查询**
- 调用 deptService.getInnerTreeByRootDeptCode(status, rootDeptCode)

---

#### 接口15: 商户创建下级部门

**HTTP方法**: `POST`
**URL**: `/create/tenant`
**入参**: `DeptTenantAddCmd`
**返回类型**: `CommonResult<String>`

**业务逻辑分阶段**:

**阶段一：应用代码默认化**
```
if (!StringUtils.hasText(cmd.getAppCode())) {
  cmd.setAppCode(AppCodeEnum.CX.getCode()) // 默认橙芯
}
```

**阶段二：部门创建**
- 转换为标准DeptAddCmd
- 调用 deptService.createDept(convertedCmd)

---

#### 接口16: 商户更新部门

**HTTP方法**: `POST`
**URL**: `/update/dept/tenant`
**入参**: `DeptTenantUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：部门更新**
- 调用 deptService.modifyDeptToTenant(cmd)

---

#### 接口17: 商户删除部门

**HTTP方法**: `DELETE`
**URL**: `/delete/tenant`
**入参**: `deptCode` (部门编码)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：部门删除**
- 调用 deptService.deleteDeptToTenant(deptCode)

---

#### 接口18: 商户更新部门状态

**HTTP方法**: `POST`
**URL**: `/update/status/tenant`
**入参**: `DeptStatusUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：状态更新**
- 调用 deptService.modifyDeptStatus(cmd)
- 可更新: ENABLE/DISABLE等状态

---

#### 接口19: 查询所有橙芯群组

**HTTP方法**: `GET`
**URL**: `/list/dept/sales-biz-group`
**入参**: 无
**返回类型**: `CommonResult<List<DeptDto>>`

**业务逻辑分阶段**:

**阶段一：群组查询**
- 调用 deptService.deptSalesBizGroup()
- 返回所有销售业务群组

---

## 四、角色权限管理

### 4.1 角色通用接口 (RoleController)

**URL前缀**: `/api/v1/system/auth/role`

#### 接口1: 根据主键查询角色

**HTTP方法**: `GET`
**URL**: `/get`
**入参**: `id` (角色主键)
**返回类型**: `CommonResult<RoleDetailsDto>`

**业务逻辑分阶段**:

**阶段一：角色查询**
- 根据ID查询角色信息

**阶段二：详情组装**
- 调用 roleService.get(id)
- 包含: 角色信息、绑定的菜单权限、脱敏模板等

---

#### 接口2: 根据唯一编码查询角色

**HTTP方法**: `GET`
**URL**: `/get/details`
**入参**: `uniqueId` (角色唯一编码)
**返回类型**: `CommonResult<RoleInfoDto>`

**业务逻辑分阶段**:

**阶段一：角色查询**
- 根据 uniqueId 查询角色

**阶段二：详情返回**
- 调用 roleService.getByUniqueId(uniqueId)

---

#### 接口3: 新建角色

**HTTP方法**: `POST`
**URL**: `/add`
**入参**: `RoleFrontAddCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：租户注入**
```
cmd.setTenantCode(LoginUtil.tenantCode())
```

**阶段二：角色创建**
- 调用 roleService.createRole(cmd)
- 生成角色唯一编码
- INSERT sys_role表

**关键业务规则**:
- 角色编码在租户内唯一
- 角色创建后需要配置权限

---

#### 接口4: 编辑角色

**HTTP方法**: `PUT`
**URL**: `/update`
**入参**: `RoleFrontUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：角色查询**
- 根据角色ID查询现有角色

**阶段二：角色更新**
- 调用 roleService.modifyRole(cmd)
- 更新角色名称、描述等

**阶段三：数据变更记录**
- 记录数据变更

---

#### 接口5: 删除角色

**HTTP方法**: `DELETE`
**URL**: `/delete`
**入参**: `id` (角色主键)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：角色绑定检查**
- 检查该角色是否有账号绑定
- 如果有账号绑定则不能删除

**阶段二：角色删除**
- 调用 roleService.delete(id)
- DELETE sys_role表

---

#### 接口6: 获取角色列表

**HTTP方法**: `GET`
**URL**: `/list`
**入参**: `appUniqueId` (可选), `tenantCode` (可选)
**返回类型**: `CommonResult<List<RoleSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：参数默认化**
```
if (!StringUtils.hasText(appUniqueId)) {
  appUniqueId = LoginUtil.appUniqueId()
}
if (!StringUtils.hasText(tenantCode)) {
  tenantCode = LoginUtil.tenantCode()
}
```

**阶段二：角色查询**
- 调用 roleService.selectSimpleList(tenantCode, appUniqueId)
- 返回指定应用下的所有角色（包含所有状态）

---

#### 接口7: 关联账号信息

**HTTP方法**: `GET`
**URL**: `/accountInfo`
**入参**: `roleUniqueId` (必填), `pageSize` (默认100), `pageNo` (默认1)
**返回类型**: `CommonResult<PageResult<RoleRelatedAccountItemDto>>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：关联账号查询**
- 调用 roleService.getRoleRelatedAccount(roleUniqueId, pageSize, pageNo)
- 返回绑定该角色的账号列表

---

#### 接口8: 角色关联脱敏模板

**HTTP方法**: `POST`
**URL**: `/rela/sensitive`
**入参**: `RoleRelaSensitiveTemplateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：脱敏模板检查**
- 验证脱敏模板ID有效性

**阶段二：关联更新**
- 调用 roleService.modifyRoleSensitiveTemplate(roleUniqueId, templateId)
- 更新角色的脱敏模板关联

**关键业务规则**:
- 一个角色关联一个脱敏模板
- 更改模板后，该角色的所有用户都生效新的脱敏规则

---

#### 接口9: 获取角色脱敏模板

**HTTP方法**: `GET`
**URL**: `/sensitive`
**入参**: `roleUniqueId` (必填)
**返回类型**: `CommonResult<Long>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：脱敏模板查询**
- 调用 roleService.getRoleSensitiveTemplateId(roleUniqueId)
- 返回角色关联的脱敏模板ID

---

### 4.2 后台角色接口 (RoleAdminController)

**URL前缀**: `/api/v1/system/auth/role/admin`

#### 接口1: 后台角色分页查询

**HTTP方法**: `GET`
**URL**: `/page`
**入参**: `RoleAdminPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<RoleAdminDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化HttpServletRequest参数
- 自动注入租户编码

**阶段二：分页查询**
- 调用 roleService.adminRolePage(paraMap)
- 返回后台应用的角色列表

---

#### 接口2: 更新数据权限

**HTTP方法**: `PUT`
**URL**: `/update/dataAuth`
**入参**: `AdminRoleDataScopeUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：数据权限解析**
- 从cmd中获取数据权限配置

**阶段二：权限更新**
- 调用 roleService.adminRoleUpdateDataAuth(cmd)
- 更新角色的数据权限范围

**关键业务规则**:
- 后台角色可配置数据权限（如可访问的部门、应用等）
- 数据权限更新后立即生效

---

#### 接口3: 获取数据权限

**HTTP方法**: `GET`
**URL**: `/query/dataAuth`
**入参**: `roleUniqueId` (必填)
**返回类型**: `CommonResult<AdminDataScope>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：数据权限查询**
- 调用 roleService.getAdminRoleDataAuth(roleUniqueId)
- 返回角色的数据权限详情

---

### 4.3 业务角色接口 (RoleBizController)

**URL前缀**: `/api/v1/system/auth/role/biz`

#### 接口1: 业务角色分页查询

**HTTP方法**: `GET`
**URL**: `/page`
**入参**: `RoleBizPageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<RoleBizDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化参数
- 自动注入租户编码

**阶段二：分页查询**
- 调用 roleService.bizRolePage(paraMap)

---

#### 接口2: 更新业务数据权限

**HTTP方法**: `PUT`
**URL**: `/update/dataAuth`
**入参**: `BizRoleDataScopeUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：数据权限解析**
- 解析业务数据权限配置

**阶段二：权限更新**
- 调用 roleService.bizRoleUpdateDataAuth(cmd)

---

#### 接口3: 获取业务数据权限

**HTTP方法**: `GET`
**URL**: `/query/dataAuth`
**入参**: `roleUniqueId` (必填)
**返回类型**: `CommonResult<BizDataScope>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：数据权限查询**
- 调用 roleService.getBizRoleDataAuth(roleUniqueId)

---

## 五、菜单权限管理

### 5.1 菜单管理接口 (MenuController)

**URL前缀**: `/api/v1/system/auth/menu`

#### 接口1: 查询菜单列表

**HTTP方法**: `POST`
**URL**: `/query/list`
**入参**: `MenuListQuery`
**返回类型**: `CommonResult<List<MenuDto>>`

**业务逻辑分阶段**:

**阶段一：应用编码默认化**
```
if (!StringUtils.hasText(menuListQuery.getAppUniqueId())) {
  menuListQuery.setAppUniqueId(LoginUtil.appUniqueId())
}
```

**阶段二：菜单查询**
- 调用 menuService.getMenuList(menuListQuery)
- 返回指定应用的菜单树形结构

---

#### 接口2: 创建菜单

**HTTP方法**: `POST`
**URL**: `/create`
**入参**: `MenuFrontAddCmd`
**返回类型**: `CommonResult<String>`

**业务逻辑分阶段**:

**阶段一：菜单代码校验**
- 验证菜单代码唯一性

**阶段二：菜单创建**
- 调用 menuService.createMenu(cmd)
- 生成菜单编码
- INSERT sys_menu表

**阶段三：操作日志**
- 记录: 创建菜单

---

#### 接口3: 更新菜单

**HTTP方法**: `PUT`
**URL**: `/update`
**入参**: `MenuFrontUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：菜单查询**
- 根据ID查询现有菜单

**阶段二：菜单更新**
- 调用 menuService.modifyMenu(cmd)
- 更新菜单信息

---

#### 接口4: 删除菜单

**HTTP方法**: `DELETE`
**URL**: `/delete/{id}`
**入参**: `id` (菜单ID)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：子菜单检查**
- 检查是否有下级菜单

**阶段二：权限关联检查**
- 检查菜单是否被角色关联

**阶段三：菜单删除**
- 调用 menuService.deleteMenu(id)

---

#### 接口5: 查看菜单详情

**HTTP方法**: `GET`
**URL**: `/query/details/{id}`
**入参**: `id` (菜单ID)
**返回类型**: `CommonResult<MenuDto>`

**业务逻辑分阶段**:

**阶段一：菜单查询**
- 根据ID查询菜单

**阶段二：详情返回**
- 调用 menuService.getMenuDetails(id)

---

#### 接口6: 获取角色可分配菜单

**HTTP方法**: `GET`
**URL**: `/query/list-all-simple`
**入参**: `appUniqueId` (必填)
**返回类型**: `CommonResult<List<MenuSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 验证 appUniqueId 非空

**阶段二：菜单查询**
- 获取当前用户的loginUniqueId和userId
- 调用 permissionService.getAccountAppSimpleMenuTree(
  loginUniqueId,
  appUniqueId,
  MenuTypeEnum.CODE_SET,
  Sets.newHashSet(EnableStatusEnum.ENABLE.getCode()),
  userId
)
- 返回启用的菜单树

---

## 六、权限控制接口

### 6.1 权限接口 (PermissionController)

**URL前缀**: `/api/v1/system/auth/permission`

#### 接口1: 登陆后获取权限

**HTTP方法**: `GET`
**URL**: `/acquirePermission`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<PermissionDto>`

**业务逻辑分阶段**:

**阶段一：获取当前用户信息**
```
String userCode = LoginUtil.userCode()
String appUniqueId = LoginUtil.appUniqueId()
Long userId = LoginUtil.userId()
```

**阶段二：权限查询**
- 调用 permissionService.getPermission(userCode, appUniqueId, userId)
- 查询用户的所有权限

**阶段三：返回权限信息**
```
PermissionDto {
  menus: List<MenuDto>,     // 用户可访问的菜单树
  roles: List<RoleDto>,     // 用户拥有的角色
  permissions: Set<String>, // 权限编码集合
  sensitiveFields: Map      // 脱敏字段配置
}
```

**关键业务规则**:
- 权限信息基于用户的角色
- 每次登录都会重新查询权限（确保实时性）

---

#### 接口2: 角色关联的菜单编码

**HTTP方法**: `GET`
**URL**: `/roleMenus`
**入参**: `roleUniqueId` (必填)
**返回类型**: `CommonResult<Set<String>>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：菜单查询**
- 调用 permissionService.queryRoleMenuList(Sets.newHashSet(roleUniqueId))
- 返回该角色绑定的所有菜单编码

---

#### 接口3: 角色关联的菜单树

**HTTP方法**: `GET`
**URL**: `/roleMenus/tree`
**入参**: `roleUniqueId` (必填), `appUniqueId` (必填)
**返回类型**: `CommonResult<List<MenuSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 验证 roleUniqueId 和 appUniqueId 非空

**阶段二：菜单树查询**
- 调用 permissionService.queryRoleMenuTree(roleUniqueId, appUniqueId)
- 返回菜单树形结构（树形展示选中状态）

---

#### 接口4: 赋予角色菜单

**HTTP方法**: `POST`
**URL**: `/assignRoleMenu`
**入参**: `RoleMenuRelAddCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 验证 roleUniqueId 和 menuCodeSet 非空

**阶段二：权限清空**
- 删除该角色的所有菜单权限

**阶段三：权限分配**
- 调用 permissionService.assignRoleMenu(roleUniqueId, menuCodeSet)
- 批量插入角色与菜单的关联

**阶段四：数据变更记录**
- 记录数据变更

**关键业务规则**:
- 菜单分配采用"覆盖"模式：先清空再重新分配
- 权限修改后立即生效

---

#### 接口5: 获取接口脱敏配置

**HTTP方法**: `POST`
**URL**: `/acquireSensitive`
**入参**: `GetSensitivePermissionCmd`
**返回类型**: `CommonResult<List<SensitiveFieldDto>>`

**业务逻辑分阶段**:

**阶段一：获取当前用户信息**
```
String userCode = UserInfoContextHolder.getUserCode()
Long userId = UserInfoContextHolder.getUserId()
String url = cmd.getUrl()
```

**阶段二：脱敏配置查询**
- 调用 permissionService.getSensitivePermission(userCode, userId, url)
- 根据用户角色查询应该对该URL进行的脱敏操作

**返回结果**:
```
SensitiveFieldDto {
  fieldName: String,    // 字段名称
  rule: String,        // 脱敏规则(掩码、加密等)
  pattern: String      // 脱敏正则或模板
}
```

---

#### 接口6: 获取用户角色信息

**HTTP方法**: `GET`
**URL**: `/acquireRole`
**入参**: Token (自动获取)
**返回类型**: `CommonResult<List<RoleDto>>`

**业务逻辑分阶段**:

**阶段一：获取当前用户**
```
String userCode = UserInfoContextHolder.getUserCode()
String tenantCode = UserInfoContextHolder.getTenantCode()
```

**阶段二：角色查询**
- 调用 permissionService.getUserRole(userCode, tenantCode)
- 返回用户拥有的所有角色

---

#### 接口7: 获取接口脱敏配置（交集）

**HTTP方法**: `POST`
**URL**: `/acquireSensitive/overlap`
**入参**: `GetSensitivePermissionCmd`
**返回类型**: `CommonResult<List<SensitiveFieldDto>>`

**业务逻辑分阶段**:

**阶段一：获取用户信息**
```
String userCode = UserInfoContextHolder.getUserCode()
Long userId = UserInfoContextHolder.getUserId()
String url = cmd.getUrl()
```

**阶段二：脱敏配置查询（交集模式）**
- 调用 permissionService.getSensitivePermissionToOverlap(userCode, userId, url)
- 与普通模式不同，此方法返回用户所有角色的脱敏规则的**交集**
- 用于多角色用户，确保脱敏规则最严格

**关键业务规则**:
- 普通模式：返回任意一个角色的脱敏规则
- 交集模式：返回所有角色脱敏规则的交集（最严格）

---

## 七、脱敏数据管理

### 7.1 脱敏接口 (SensitiveController)

**URL前缀**: `/api/v1/system/auth/sensitive`

#### 接口1: 脱敏模板分页查询

**HTTP方法**: `GET`
**URL**: `/template/page`
**入参**: `SensitiveTemplatePageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<SensitiveTemplatePageDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化HttpServletRequest参数
- 自动注入租户编码

**阶段二：分页查询**
- 调用 templateService.getSensitiveTemplatePage(paraMap)

---

#### 接口2: 脱敏模板详情查询（仅编辑）

**HTTP方法**: `GET`
**URL**: `/template/get`
**入参**: `id` (模板ID)
**返回类型**: `CommonResult<SensitiveTemplateSimpleDto>`

**业务逻辑分阶段**:

**阶段一：模板查询**
- 调用 templateService.getSimple(id)
- 返回模板的简化信息（仅用于编辑页面）

---

#### 接口3: 脱敏模板详情查询（完整）

**HTTP方法**: `GET`
**URL**: `/template/details`
**入参**: `id` (模板ID)
**返回类型**: `CommonResult<SensitiveTemplateDto>`

**业务逻辑分阶段**:

**阶段一：模板查询**
- 调用 templateService.get(id)
- 返回完整的模板信息（包含所有脱敏规则）

---

#### 接口4: 新建脱敏模板

**HTTP方法**: `POST`
**URL**: `/template/add`
**入参**: `SensitiveTemplateAddCmd`
**返回类型**: `CommonResult<Long>`

**业务逻辑分阶段**:

**阶段一：租户注入**
```
cmd.setTenantCode(LoginUtil.tenantCode())
```

**阶段二：模板创建**
- 调用 templateService.create(cmd)
- INSERT sensitive_template表
- 同步插入脱敏规则关联

**阶段三：返回模板ID**
- 返回新创建模板的ID

---

#### 接口5: 更新脱敏模板

**HTTP方法**: `PUT`
**URL**: `/template/update`
**入参**: `SensitiveTemplateUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：模板查询**
- 根据ID查询现有模板

**阶段二：模板更新**
- 调用 templateService.modify(cmd)
- 更新模板信息和脱敏规则

**阶段三：数据变更记录**
- 记录数据变更

---

#### 接口6: 删除脱敏模板

**HTTP方法**: `DELETE`
**URL**: `/template/delete`
**入参**: `id` (模板ID)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：关联检查**
- 检查模板是否被角色关联

**阶段二：模板删除**
- 调用 templateService.delete(id)
- DELETE sensitive_template表

---

#### 接口7: 脱敏模板关联角色

**HTTP方法**: `GET`
**URL**: `/template/getRole`
**入参**: `id` (模板ID)
**返回类型**: `CommonResult<List<SensitiveTemplateRelaRoleDto>>`

**业务逻辑分阶段**:

**阶段一：关联查询**
- 调用 templateService.getTemplateRole(id)
- 返回该模板关联的所有角色

---

#### 接口8: 查询角色可选脱敏模板

**HTTP方法**: `GET`
**URL**: `/template/roleSelect`
**入参**: `roleUniqueId` (角色唯一编码)
**返回类型**: `CommonResult<List<SensitiveTemplateSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：角色校验**
- 验证 roleUniqueId 非空

**阶段二：模板查询**
- 调用 templateService.getTemplateRoleSelect(roleUniqueId)
- 返回该角色可以选择的脱敏模板列表

---

#### 接口9: 接口脱敏明细分页查询

**HTTP方法**: `GET`
**URL**: `/interface/page`
**入参**: `SensitiveInterfacePageQuery` + HttpServletRequest
**返回类型**: `CommonResult<PageResult<SensitiveInterfacePageDto>>`

**业务逻辑分阶段**:

**阶段一：参数处理**
- 扁平化参数
- 自动注入租户编码

**阶段二：分页查询**
- 调用 interfaceService.getSensitiveInterfacePage(query, paraMap)

---

#### 接口10: 接口脱敏明细列表

**HTTP方法**: `GET`
**URL**: `/interface/select`
**入参**: `tenantCode` (商户编码)
**返回类型**: `CommonResult<List<SensitiveInterfaceSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：参数校验**
- 验证 tenantCode 非空

**阶段二：接口查询**
- 调用 interfaceService.getSelect(tenantCode)
- 返回该商户的所有接口（带字段信息）

---

#### 接口11: 接口脱敏明细详情

**HTTP方法**: `GET`
**URL**: `/interface/get`
**入参**: `id` (接口ID)
**返回类型**: `CommonResult<SensitiveInterfaceDto>`

**业务逻辑分阶段**:

**阶段一：接口查询**
- 调用 interfaceService.get(id)
- 返回接口的完整脱敏配置

---

#### 接口12: 新建接口脱敏明细

**HTTP方法**: `POST`
**URL**: `/interface/add`
**入参**: `SensitiveInterfaceAddCmd`
**返回类型**: `CommonResult<Long>`

**业务逻辑分阶段**:

**阶段一：租户注入**
```
cmd.setTenantCode(LoginUtil.tenantCode())
```

**阶段二：接口创建**
- 调用 interfaceService.create(cmd)
- INSERT sensitive_interface表

---

#### 接口13: 更新接口脱敏明细

**HTTP方法**: `PUT`
**URL**: `/interface/update`
**入参**: `SensitiveInterfaceUpdateCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：接口查询**
- 根据ID查询现有接口

**阶段二：接口更新**
- 调用 interfaceService.modify(cmd)

---

#### 接口14: 删除接口脱敏明细

**HTTP方法**: `DELETE`
**URL**: `/interface/delete`
**入参**: `id` (接口ID)
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：接口删除**
- 调用 interfaceService.delete(id)

---

#### 接口15: 查询接口关联的模板

**HTTP方法**: `GET`
**URL**: `/interface/relaTemplate`
**入参**: `id` (接口ID)
**返回类型**: `CommonResult<List<SensitiveTemplateSimpleDto>>`

**业务逻辑分阶段**:

**阶段一：关联查询**
- 调用 interfaceService.getInterfaceRelaTemplate(id)
- 返回该接口关联的所有脱敏模板

---

#### 接口16: 导入云服接口脱敏配置

**HTTP方法**: `POST`
**URL**: `/interface/import`
**入参**: `SensitiveInterfaceImportCmd`
**返回类型**: `CommonResult<Boolean>`

**业务逻辑分阶段**:

**阶段一：云服接口查询**
- 调用云服接口获取脱敏配置

**阶段二：批量导入**
- 调用 interfaceService.importInterface(cmd)
- 批量插入或更新接口脱敏配置

---

## 八、关键业务规则

### 8.1 账号管理规则

| 规则 | 说明 |
|------|------|
| **账号类型分离** | 后台账号(ADMIN) 与 业务账号(BUSINESS)分离管理 |
| **密码加密存储** | 所有密码均经过加密(BCrypt/MD5等)后存储 |
| **账号冻结机制** | 登录失败N次自动冻结，或手动冻结 |
| **多应用绑定** | 一个用户可绑定多个应用的账号 |
| **租户隔离** | 账号按租户隔离，跨租户查询需特殊权限 |

### 8.2 登录与认证规则

| 规则 | 说明 |
|------|------|
| **Token失效时间** | 通常 1-2 小时，refreshToken 7-30 天 |
| **登录方式多样** | 密码登录、短信登录、微信登录等 |
| **BDDS应用限制** | BDDS应用禁止登录（业务限制） |
| **邀请注册** | 邀请码必须有效且未过期 |
| **注册审核** | 部门可配置是否需要审核新注册用户 |

### 8.3 权限体系规则

| 规则 | 说明 |
|------|------|
| **基于角色的权限** | 用户 → 角色 → 菜单权限 |
| **数据权限** | 后台角色和业务角色均有数据权限范围 |
| **权限动态更新** | 修改角色权限后立即生效 |
| **权限缓存** | 登录时缓存用户权限，提高查询效率 |

### 8.4 菜单管理规则

| 规则 | 说明 |
|------|------|
| **树形结构** | 菜单按应用分类，支持多级菜单 |
| **启用/禁用** | 禁用的菜单不会返回给用户 |
| **菜单代码唯一性** | 同应用下菜单代码唯一 |
| **菜单权限分配** | 通过角色 → 菜单关系配置权限 |

### 8.5 部门组织架构规则

```
部门层级结构:
└─ 根部门 (ROOT)
    ├─ 一级部门 (LEVEL_1)
    │   ├─ 二级部门 (LEVEL_2)
    │   └─ ...
    └─ ...

关键规则:
- 部门编码在应用内唯一
- 支持移动部门（改变parentCode）
- 删除部门前需转移所有用户
- 部门可配置是否启用注册审核
```

### 8.6 脱敏规则

| 规则 | 说明 |
|------|------|
| **模板化管理** | 脱敏规则以模板形式统一管理 |
| **角色绑定** | 每个角色绑定一个脱敏模板 |
| **接口级配置** | 针对具体接口配置脱敏字段 |
| **交集模式** | 多角色用户取脱敏规则的交集（最严格） |
| **字段脱敏方式** | 支持掩码、加密、内容替换等多种方式 |

### 8.7 数据权限范围

#### 后台角色(AdminDataScope)
```
- deptIds: List<String>           // 可访问的部门列表
- applicationIds: List<String>    // 可访问的应用列表
- scopeType: Enum                 // 权限范围类型(自己、部门、全部等)
```

#### 业务角色(BizDataScope)
```
- channelCodes: List<String>      // 可访问的渠道列表
- deptCodes: List<String>         // 可访问的部门列表
- scopeType: Enum                 // 权限范围类型
```

### 8.8 账号审核流程

```
注册申请 → 审核待处理 → 审核通过/拒绝 → 激活/返回修改

关键规则:
- 部门可启用或禁用审核
- 审核方可配置
- 审核记录可查询
- 拒绝后可重新申请
```

### 8.9 微信集成规则

| 操作 | 说明 |
|------|------|
| **绑定openId** | 用于微信环境下自动登录 |
| **解除绑定** | 解绑后需要重新登录或绑定 |
| **关注检查** | 可检查是否关注了公众号 |
| **一个openId对多个账号** | 不支持，一对一绑定 |

### 8.10 权限检查注解

| 注解 | 说明 |
|------|------|
| `@SaCheckPermission` | Sa-Token权限检查 |
| `@EnableDataPermission` | 启用数据权限检查 |
| `@OperateLog` | 操作日志记录 |

---

## 九、系统架构设计

### 9.1 多租户隔离

**隔离策略**：
- 账号隔离：同账号名可在多租户中存在，通过 tenantCode 区分
- 权限隔离：用户权限仅限当前租户范围
- 数据隔离：数据查询自动注入 tenantCode 过滤

**实现方式**：
- LoginUtil 自动注入 tenantCode
- Service层入参检查添加 tenantCode 条件

### 9.2 应用隔离

**隔离策略**：
- 账号隔离：同账号可绑定多个应用
- 权限隔离：不同应用的权限独立配置
- 菜单隔离：菜单按应用分类展示

**实现方式**：
- appScope 标识应用范围(ADMIN/BUSINESS等)
- appUniqueId 标识具体应用

### 9.3 权限校验链路

```
请求来临
  ↓
Token验证 (LoginInterceptor)
  ↓
权限检查 (@SaCheckPermission)
  ↓
数据权限检查 (@EnableDataPermission)
  ↓
脱敏检查 (SensitiveInterceptor)
  ↓
业务逻辑执行
```

---

**文档生成时间**: 2026-01-27
**文档版本**: V1.0 (完整版 - 账号、用户与权限)
**涵盖Controller类**: 8个，接口总数：90+
**参考格式**: AgreementInfoControllerV2-业务文档.md & system业务文档-人员和组织机构补充.md
