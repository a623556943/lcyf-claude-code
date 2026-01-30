# LCYF Claude Code - Java 团队智能开发系统

> 面向 Java/Spring Boot 团队的轻量级智能开发伙伴系统

## 概览

- 这是一个"多仓库聚合"的 Java 21 微服务工作区：当前目录本身不是 git 仓库，但每个子目录（如 `lcyf-module-*` / `lcyf-server-*` / `lcyf-framework`）各自是独立仓库（都有自己的 `.git/`）。
- 技术栈核心：Spring Boot（3.5.x）+ Spring Cloud（2025.0.x）+ Spring Cloud Alibaba（Nacos）+ Dubbo + MyBatis-Plus + BeanSearcher + Sa-Token。
- 架构落地：DDD/COLA 风格分层，典型拆分为 `adapter`（接入）/ `biz`（业务）/ `starter`（自动装配/启动配置）；API 定义集中在 `lcyf-module-base`。
---

## 技术栈

- **语言**: Java 17/21
- **框架**: Spring Boot 3.x
- **ORM**: MyBatis-Plus 3.5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis 7.x
- **RPC**: Dubbo 3.x
- **架构**: 模块化单体（Modular Monolith）

---

## 目录结构（顶层）

```
./
├── build-parent/               # Maven parent + 编码规则/脚本模板
├── lcyf-dependencies/          # 依赖版本 BOM（统一管理版本）
├── lcyf-framework/             # 自研框架与 starter（commons/web/tenant/security/...）
├── lcyf-module-base/           # 所有业务模块的 API 层（DTO/Cmd/Query/Enum/RPC）
├── lcyf-module-system/         # 系统域（biz+adapter+starter）
├── lcyf-module-finance/        # 财务域（biz+adapter+starter）
├── lcyf-module-policy/         # 保单域（biz+adapter+starter）
├── lcyf-module-product-factory/# 产品工厂域（注意子模块命名为 lcyf-module-product-*）
├── lcyf-module-sales/          # 销售域（biz+adapter+starter）
├── lcyf-server-system-all/     # 聚合服务入口（依赖多个 module-*-starter）
├── lcyf-server-gateway/        # 网关服务入口（Spring Cloud Gateway/WebFlux）
├── lcyf-server-tools/          # 工具服务入口（多模块，main 在 starter）
└── logs/                       # 运行日志（不参与开发）
```

## 去哪找（按任务）

- 新增/修改 DTO、Cmd、Query、Enum、RPC 接口：`lcyf-module-base/`
- 新增/修改业务逻辑（Service/Gateway/Mapper/DO/Assembler）：对应 `lcyf-module-*/lcyf-module-*-biz/`
- 新增/修改 HTTP 接口（Controller）：对应 `lcyf-module-*/lcyf-module-*-adapter/src/main/java/.../adapter/web/`
- 新增/修改 Dubbo RPC 实现：对应 `*/-adapter/src/main/java/.../adapter/rpc/`；接口在 `lcyf-module-base/**/rpc/`（部分历史模块在 `api/` 包）
- 统一异常/返回体/日志 TraceId/通用工具：`lcyf-framework/lcyf-commons/`
- 多租户（tenant_code 注入、租户过滤）：`lcyf-framework/lcyf-framework-starter-tenant/` + `lcyf-framework-starter-dal/`
- 安全/登录上下文（Sa-Token、LoginUtil）：`lcyf-framework/lcyf-framework-starter-security/`
- 依赖版本 / 新三方库版本：`lcyf-dependencies/pom.xml`
- Maven parent / 编码规范：`build-parent/pom.xml`、`build-parent/rules/AGENT_CODING_RULES.md`、`build-parent/rules/QODER_RULES.md`
- 构建/发版：各 `lcyf-server-*/Jenkinsfile-*` + `restart-*.sh`

## 项目约定（只写"非默认/强约束"）

- API 层统一仓库：业务模块自己的仓库通常没有 `*-api` 子模块；API 都在 `lcyf-module-base/`。
- 查询与软删：大量分页/检索走 BeanSearcher；Controller 常用 `MapUtils.flat(request.getParameterMap())`（会自动补 `deleted=0`）。
- 多租户：查询参数常用 `TenantMapUtils.flat(...)` 自动补 `tenantCode` + `deleted`；不要在业务代码里手动设置 `tenant_code`。
- 对象转换：优先 MapStruct Assembler（`biz/infrastructure/assembler/`）。
- 依赖注入：手写代码避免 `@Autowired`，优先 `@RequiredArgsConstructor`。
- TraceId：`MDCUtil` 维护 `traceId/appName`；MQ/定时任务里常见 `MDCUtil.putTraceId()`。
- 依赖版本：子模块一般不写 `<version>`，版本集中在 BOM/parent 管。

## 常用命令（按仓库执行）

- Maven 构建（本目录没有根 pom，需进入具体仓库）：`mvn clean package -DskipTests`
- 运行网关：在 `lcyf-server-gateway/` 里 `java -jar target/*.jar --spring.profiles.active=dev`
- 运行 system-all：在 `lcyf-server-system-all/` 里 `java -jar target/*.jar --spring.profiles.active=dev`
- 运行 tools：在 `lcyf-server-tools/` 里 `java -jar lcyf-server-tools-starter/target/*.jar --spring.profiles.active=dev`

## 注意事项

- 配置中心：各服务通过 `bootstrap.yml` 使用 Nacos `spring.config.import=nacos:...` 拉取配置；不要把 Nacos 账号/密码等敏感信息写进文档或日志示例。
- Java LSP：本环境未安装 `jdtls`，IDE/LSP 导航不可用时优先用 `rg` 全文搜索。

## 质量要求

### 代码规范

- 方法不超过 50 行
- 类不超过 800 行
- 圈复杂度不超过 10
- 嵌套深度不超过 4 层

---

**规则**:
- 只依赖 `-api` 模块，不依赖 `-biz` 模块
- 使用 Dubbo RPC 进行跨模块通信
- 禁止循环依赖

---

## 可用 Skills

本项目提供以下业务领域 skills，当任务涉及相关业务时会自动加载对应的领域知识：

> **📋 项目级注册**：`.claude-skills-config.json` - Skills 自动加载配置
>

### 架构与技术栈
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| java-full-stack | Java 全栈开发规范与最佳实践 | Java、Spring Boot、全栈 |
| modular-monolith | 模块化单体架构设计与实现 | 模块化、单体架构、模块拆分 |

### 系统认证与权限
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| system-auth-user | 用户账号与认证管理 | 用户、user、账号、认证、登录 |
| system-auth-menu | 菜单与前端权限管理 | 菜单、menu、前端权限、权限控制 |
| system-auth-permission | 后端权限与角色管理 | 权限、permission、角色、role |
| system-auth-organization | 组织架构与部门管理 | 组织、organization、部门、岗位 |
| system-auth-data-permission | 数据权限与数据范围控制 | 数据权限、数据范围、data permission |
| system-auth-data-masking | 敏感数据脱敏与加密 | 脱敏、加密、敏感数据、data masking |

### 系统配置管理
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| system-config-management | 系统配置中心与参数管理 | 配置、config、参数、系统参数 |
| system-config-system | 系统级配置与全局设置 | 系统配置、全局配置、system config |
| system-config-dict | 数据字典与枚举管理 | 字典、dict、数据字典、枚举 |
| system-config-jz | 记账配置与规则管理 | 记账、jz、记账规则 |
| system-config-channel-banner | 渠道横幅与广告配置 | 渠道、banner、横幅、广告配置 |

### 风险控制
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| system-risk-whitelist | 白名单管理与风险豁免 | 白名单、whitelist、豁免、风险豁免 |
| system-risk-blacklist | 黑名单管理与风险控制 | 黑名单、blacklist、风险、blocked |
| system-risk-management | 风险策略与规则引擎 | 风险管理、risk、风险策略 |
| system-risk-product | 产品风控与限制规则 | 产品风控、产品限制、product risk |

### 外部系统集成
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| system-external-wechat | 微信公众号与小程序集成 | 微信、wechat、小程序、公众号 |
| system-external-sms | 短信发送与验证码服务 | 短信、sms、验证码 |
| system-external-contract-sign | 电子合同与签章服务 | 合同、签章、电子签名、contract |
| system-external-systems | 外部系统对接与适配 | 外部系统、对接、integration |

### 其他业务模块
| Skill ID | 描述 | 触发词 |
|----------|------|--------|
| system-internal-api | 内部 API 与服务调用 | 内部接口、internal api |
| system-mga-business | MGA 业务管理 | mga、业务管理 |
| system-org-supplement | 组织补充信息管理 | 组织补充、supplement |
| system-common-operations | 通用操作与工具方法 | 通用操作、common、工具方法 |

### 使用方式

**1. 自动加载（推荐）**

当任务描述包含触发词时，系统会自动识别并加载对应 skill：

```
用户: 添加白名单导出功能
系统: 自动加载 system-risk-whitelist skill → java-developer 代理
```

**2. 显式调用**

使用 `/skill-id` 语法明确指定要使用的 skill：

```bash
# 调用白名单管理 skill
/system-risk-whitelist 添加白名单批量导出接口

# 调用用户管理 skill
/system-auth-user 实现用户密码重置功能
```

**3. 查看 Skill 详情**

每个 skill 的完整文档位于 `skills/[skill-id]/SKILL.md`，包含：
- 模块职责与边界
- 目录结构与核心文件
- 功能清单与入口
- 核心流程与数据模型
- 依赖关系与扩展指南

---

## 快速开始

### 1. 规划新功能

```bash
/lcyf-plan 添加用户导出功能
```

### 2. 知识管理

```bash
/lcyf-learn list
```

---

## 文档

- [快速开始](docs/快速开始.md)
- [安装指南](docs/安装指南.md)
- [知识库架构说明](docs/知识库架构说明.md)

---

**仓库**: https://github.com/a623556943/lcyf-claude-code
