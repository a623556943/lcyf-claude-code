# lcyf-review 命令

lcyf 项目的 Java 代码审查。

## 命令

`/lcyf-review [file_path]`

## 描述

审查 Java 代码的以下方面：

- Spring Boot 最佳实践
- 事务管理
- 异常处理
- 安全问题
- 性能问题

## 使用方式

```
/lcyf-review                    # 审查所有修改的文件
/lcyf-review src/main/java/...  # 审查特定文件
```

## 实现

调用 `java-reviewer` agent 执行全面的代码审查。

## 输出

包含以下内容的审查报告：

- 严重问题
- 高优先级问题
- 建议
- 整体评估（通过/警告/阻止）
