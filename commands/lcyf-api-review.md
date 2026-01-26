# lcyf-api-review 命令

lcyf 项目的 API 设计审查。

## 命令

`/lcyf-api-review [controller_path]`

## 描述

审查 API 设计的以下方面：
- RESTful 原则
- 请求/响应验证
- 文档完整性
- 状态码正确性

## 使用方式

```
/lcyf-api-review                      # 审查所有控制器
/lcyf-api-review UserController.java  # 审查特定控制器
```

## 实现

调用 `api-designer` agent 进行 API 设计审查。

## 输出

包含 API 设计质量评估的审查报告。
