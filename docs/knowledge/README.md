# 知识库

> 团队业务知识和技术经验的积累库，供开发人员和需求分析师共同使用。

## 目录结构

```
.claude/docs/knowledge/
├── learned-patterns/          # 学习到的模式
│   ├── code-patterns/        # 代码模式
│   ├── problem-solutions/    # 问题解决方案
│   └── best-practices/       # 最佳实践
├── team-conventions/          # 团队约定
│   ├── naming-rules.json
│   ├── coding-standards.json
│   └── git-workflow.json
├── instincts/                 # 本能规则
│   └── auto-patterns.json
├── module-knowledge/          # 模块专属知识
│   ├── system/
│   ├── sales/
│   └── finance/
│   └── policy/
└── session-history/           # 会话历史（.gitignore 排除）
```

## 如何使用

### 开发人员
```bash
# 查看知识
/lcyf-learn list

# 搜索知识
/lcyf-learn search "关键词"

# 添加知识
/lcyf-learn add --type=pattern
```

### 需求分析师
直接查看 `module-knowledge/{模块名}/` 目录下的业务文档：
- `业务术语表.md` - 业务概念解释
- `业务流程.md` - 端到端业务流程
- `业务规则.md` - 业务约束和规则

## 知识类型说明

| 类型 | 适用人员 | 说明 |
|------|---------|------|
| 业务知识 | 需求分析师 + 开发 | 业务概念、流程、规则 |
| 代码模式 | 开发人员 | 可复用的代码片段 |
| 问题方案 | 开发人员 | 问题及其解决方案 |
| 团队约定 | 全员 | 编码规范、命名约定 |
