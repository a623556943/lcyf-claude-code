# System 模块技能目录

> 本目录包含 System 模块的所有业务功能技能文档

## 技能列表

| 文件夹名称 | Skill Name | 描述 |
|-----------|------------|------|
| system-mga-business | `lcyf-system-mga-business` | MGA代理人业务管理模块，包括MGA代理人管理、执业信息管理、经代供应商渠道关系管理 |
| system-risk-management | `lcyf-system-risk-management` | 风控管理业务模块，包括风控规则、白名单、黑名单等风控相关功能 |
| system-common-operations | `lcyf-system-common-operations` | 公共运营业务模块，包括运营相关的通用功能和配置 |
| system-config-management | `lcyf-system-config-management` | 配置管理业务模块，包括系统配置、字典、即展配置、渠道banner等 |
| system-org-supplement | `lcyf-system-org-supplement` | 人员和组织机构补充模块，包括组织架构和人员信息的补充说明 |
| system-external-systems | `lcyf-system-external-systems` | 外部系统集成模块，包括微信、短信、签署合同等外部系统对接 |
| system-auth-permission | `lcyf-system-auth-permission` | 账号用户权限模块，包括用户管理、角色权限、菜单权限、数据权限等 |
| system-internal-api | `lcyf-system-internal-api` | 中介核心内部接口模块，提供给内部系统调用的API接口 |
| risk-whitelist | `lcyf-risk-whitelist` | 白名单管理功能，提供白名单人员与生效场景的管理与校验能力 |
| risk-product | `lcyf-risk-product` | 产品风控管理功能，包括产品级别的风控规则配置和校验 |
| risk-blacklist | `lcyf-risk-blacklist` | 黑名单管理功能，提供黑名单人员与生效场景的管理与校验能力 |
| config-jz | `lcyf-config-jz` | 即展端配置管理，包括即展首页模板管理、模板分配、品牌设置等 |
| config-channel-banner | `lcyf-config-channel-banner` | 渠道banner配置管理，提供渠道端banner的增删改查功能 |
| config-system | `lcyf-config-system` | 系统配置管理，提供系统级别的配置参数管理功能 |
| config-dict | `lcyf-config-dict` | 字典管理功能，提供系统字典的增删改查和缓存管理 |
| external-contract-sign | `lcyf-external-contract-sign` | 代理人签署合同外部系统对接，提供电子合同签署功能 |
| external-sms | `lcyf-external-sms` | 短信外部系统对接，提供短信发送和管理功能 |
| external-wechat | `lcyf-external-wechat` | 微信外部系统对接，提供微信相关功能集成 |
| auth-menu | `lcyf-auth-menu` | 菜单权限管理，提供系统菜单的增删改查和权限控制 |
| auth-data-permission | `lcyf-auth-data-permission` | 数据权限管理，提供数据级别的权限控制功能 |
| auth-data-masking | `lcyf-auth-data-masking` | 数据脱敏管理，提供敏感数据的脱敏处理功能 |
| auth-user | `lcyf-auth-user` | 账号用户管理，提供用户账号的增删改查和认证功能 |
| auth-organization | `lcyf-auth-organization` | 组织架构管理，提供组织结构的树形管理和维护功能 |

## 使用方式

每个技能文档都包含：
- **前置元数据**: `name` 和 `description`（含激活条件）
- **模块职责**: 功能概述
- **目录结构**: 代码组织
- **数据模型**: 数据库表结构
- **API 接口**: 接口定义
- **业务流程**: 核心流程说明

### 自动激活

所有技能已配置自动激活规则：当执行 `java-developer` 或 `planner` agent 需要了解相关模块时自动加载

## 技能命名规范

所有技能名称遵循以下规范：
- 前缀: `lcyf-`
- 格式: 小写字母、数字和连字符
- 长度: 最多 64 个字符

## 更新日志

- 2026-01-29:
  - 初始化技能目录结构，共 23 个技能模块
  - 添加 agent 自动激活规则（java-developer, planner）
  - 文件夹名称统一改为英文命名
