---
name: settlement-process
description: |
  【模块定位】财务结算流程主干

  【支持的代理】
  - java-developer: 实现结算流程
  - planner: 规划结算链路

  【触发关键词】
  结算流程、责任链、费率匹配、结算条件、MQ消费

  【必须调用】
  java-developer: 任务涉及"结算流程"、"责任链" → MUST
  planner: 规划"结算体系" → MUST
---

# 结算流程

**适用范围**: 本文描述财务结算在 finance 模块内的主干流程，涵盖 MQ 入口、责任链执行、结算单生成、结算条件同步、费率因子匹配与关键异常中断点。

---

## 一、入口与触发

### MQ 消息入口
- `FinanceConsumer.syncOrderDataConsumer` 根据 tag 分发
- 新单：`generateFirstFinanceSettleOrder`
- 续保：`generateRenewalPolicyFinanceSettleOrder`
- 续期：`generateRenewalPayFinanceSettleOrder`
- 保全：`generateMaintenanceFinanceSettleOrder`
- 同步结算条件：`syncPolicySettleCondition`

### 定时任务入口
- `FeeSchedule` 触发 `generateRenewalPolicyEffectFinanceSettleOrder`（续保生效单）

## 二、责任链（顺序与职责）

### 责任链顺序（ordered）
1. `FsOrderPreChainImpl` - 前置处理：产品/渠道/人员信息与费率匹配
5. `FsOrderInitChainImpl` - 初始化财务单
10. `FsOrderSupplierChainImpl` - 供应商基础费率与结算单
15. `FsOrderSupplierActivityChainImpl` - 供应商活动加佣
20. `FsOrderChannelTobChainImpl` - ToB 渠道费率与结算单
25. `FsOrderChannelTobActivityChainImpl` - ToB 渠道活动加佣
30. `FsOrderChannelToaChainImpl` - ToA 团队费率与结算单
35. `FsOrderChannelToaActivityChainImpl` - ToA 团队活动加佣
39. `FsOrderSupplementChainImpl` - 字段补齐/结算单过滤
40. `FsOrderChannelIncomeTobChainImpl` - ToB 渠道收入生成
45. `FsOrderChannelIncomeToaChainImpl` - ToA 渠道收入生成
50. `FsOrderPersonalIncomeTobChainImpl` - ToB 个人收入生成
55. `FsOrderPersonalIncomeToaChainImpl` - ToA 个人收入生成 + 基本法
99. `FsOrderBackChainImpl` - 后置处理

## 三、费率因子匹配（核心逻辑）

### 匹配入口
- `FeeTemCalServiceV2Impl.matchFeeForIdentity`
- 从费率树 defineTree 按层匹配因子，命中则下钻；命中叶子返回费率

### 因子定义/实例加载
- `initMatchFeeContext`：拉取所有因子定义与实例，按 factorDefCode 分组

### 因子工厂与匹配执行
- `FeeFactorFactory`：Spring 注入全部 FeeFactor 实现
- `FeeFactor`：获取因子值，执行 matchRange/matchInter/matchDiff/NOT_LIMIT

## 四、结算日与结算条件计算

- 基础结算日：`calBaseSettleDay` 计算 matchSettleTime，默认 effectTime+60 天
- 活动结算日：`calActivitySettleDay` 根据 settleDaySwitchType 计算结算日
- 活动结算附加条件：`calActivitySettleAddCondition` 计算未满足条件集合并拼接 remark

## 五、异常/中断点（责任链）

- `AbsFsOrderChain` 提供 `breakChainByError` / `alertChainError` / `breakChainByInterruptedNoAlarmError`
- 前者中断流程，后者告警但不中断
- PreChain/InitChain/SupplierChain/ChannelChain/PersonalIncomeChain 多处 breakChainByError

---

**文档版本**: V1.0
