# lcyf-module-check 命令

模块依赖和接口契约验证。

## 命令

`/lcyf-module-check [module_name]`

## 描述

检查模块健康状态：
- 循环依赖
- 依赖版本冲突
- 接口契约合规性
- 破坏性变更

## 使用方式

```
/lcyf-module-check                      # 检查所有模块
/lcyf-module-check lcyf-module-finance  # 检查特定模块
```

## 实现

调用 `module-coordinator` agent 进行多模块分析。

## 输出

包含依赖关系图和建议的模块健康报告。
