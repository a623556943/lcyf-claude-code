# /lcyf-验证

## 元数据
- **使用 Agents:** 07-测试专家, 05-代码审查专家, 06-安全审查专家
- **遵循 Rules:** 00-总则, 01-安全规范, 03-测试要求

## 命令说明
对当前代码库状态进行全面验证，确保代码质量和可发布性

## 使用方式

```
/lcyf-验证           # 完整验证（默认）
/lcyf-验证 quick     # 快速验证（构建+编译）
/lcyf-验证 pre-commit # 提交前验证
/lcyf-验证 pre-pr    # PR前完整验证（含安全扫描）
```

## 验证流程

### 完整验证 (full)

按以下顺序执行所有检查：

#### 1. 构建检查
```bash
# Maven项目
mvn clean package -DskipTests

# 如果失败，报告错误并停止
```

#### 2. 编译检查
```bash
# 检查Java编译错误
mvn compile

# 报告所有编译错误及位置
```

#### 3. 代码规范检查
```bash
# Checkstyle检查
mvn checkstyle:check

# PMD静态分析
mvn pmd:check

# SpotBugs检查
mvn spotbugs:check
```

#### 4. 测试套件
```bash
# 运行所有测试
mvn test

# 报告:
# - 通过/失败数量
# - 失败的测试详情
# - 测试执行时间
```

#### 5. 测试覆盖率
```bash
# 生成覆盖率报告
mvn jacoco:report

# 检查覆盖率是否达标（≥80%）
```

#### 6. 安全检查
```bash
# 检查硬编码密钥
grep -r "password\s*=\s*[\"']" --include="*.java" --include="*.yml"

# 检查敏感信息
grep -r "apiKey\|secretKey\|accessToken" --include="*.java"

# SQL注入检查
grep -r "String.*sql.*=.*\+.*" --include="*.java"
```

#### 7. 日志审计
```bash
# 检查System.out.println
grep -rn "System\\.out\\.println\\|System\\.err\\.println" --include="*.java"

# 检查e.printStackTrace()
grep -rn "printStackTrace" --include="*.java"
```

#### 8. Git状态
```bash
# 显示未提交的更改
git status

# 显示自上次提交以来的文件
git diff --stat HEAD
```

### 快速验证 (quick)

只执行关键检查：
1. 构建检查
2. 编译检查

用于快速验证代码是否可以编译通过。

### 提交前验证 (pre-commit)

适合Git提交前检查：
1. 构建检查
2. 编译检查
3. 单元测试
4. 代码规范检查
5. 日志审计

### PR前验证 (pre-pr)

最严格的验证，适合创建PR前：
1. 所有完整验证项
2. 依赖漏洞扫描
3. 许可证合规检查
4. API变更检测
5. 性能基准测试

## 验证报告

### 成功示例

```
验证报告: PASS ✓
==================
验证时间: 2025-01-26 10:30:45
验证模式: full

检查结果
--------
✓ 构建:      成功
✓ 编译:      无错误
✓ 代码规范:  通过 (0个警告)
✓ 测试:      28/28 通过
✓ 覆盖率:    87% (≥80% ✓)
✓ 安全:      无问题
✓ 日志:      干净 (0个System.out)

Git状态
-------
未提交更改: 3个文件
  M src/main/java/UserService.java
  M src/test/java/UserServiceTest.java
  M pom.xml

准备发布: YES ✓

建议: 代码质量良好，可以提交
```

### 失败示例

```
验证报告: FAIL ✗
==================
验证时间: 2025-01-26 10:30:45
验证模式: full

检查结果
--------
✓ 构建:      成功
✓ 编译:      无错误
✗ 代码规范:  3个Checkstyle警告
✓ 测试:      25/28 通过
✗ 覆盖率:    72% (< 80% ✗)
✗ 安全:      发现2个问题
✗ 日志:      发现5个System.out.println

详细问题
--------

代码规范问题:
1. UserController.java:45 - 行长度超过120字符
2. OrderService.java:88 - 缺少Javadoc注释
3. PaymentService.java:120 - 空行过多

测试失败:
1. ✗ UserServiceTest.testCreateUser - NullPointerException
2. ✗ OrderServiceTest.testCancelOrder - AssertionError
3. ✗ PaymentServiceTest.testRefund - Timeout

覆盖率不足:
- 目标: 80%
- 当前: 72%
- 差距: 8%
- 需要补充测试的类:
  * PaymentService (45%)
  * OrderService (68%)

安全问题:
1. 严重: UserService.java:88 - 硬编码密码
   代码: String password = "admin123";
   修复: 使用配置文件或环境变量

2. 警告: OrderController.java:120 - SQL拼接
   代码: String sql = "SELECT * FROM orders WHERE id = " + orderId;
   修复: 使用MyBatis参数化查询

日志问题:
- 发现5处System.out.println，应使用log.info()
  * UserService.java:45
  * OrderService.java:88
  * PaymentService.java:120
  * ProductService.java:200
  * InventoryService.java:66

准备发布: NO ✗

必须修复项:
-----------
1. 修复3个失败的测试
2. 移除硬编码密码（安全问题）
3. 修复SQL注入漏洞（安全问题）
4. 提升测试覆盖率到80%以上
5. 移除所有System.out.println

建议修复顺序:
1. 安全问题（最高优先级）
2. 测试失败
3. 测试覆盖率
4. 代码规范
5. 日志清理
```

## 验证结果说明

### 状态标识
- ✓ - 通过
- ✗ - 失败
- ⚠ - 警告

### 严重程度
- **严重** - 必须修复，阻止发布
- **警告** - 建议修复，不阻止发布
- **提示** - 可选改进

## 自动修复建议

验证失败时，提供修复命令：

```
自动修复建议
============
1. 修复代码规范: /lcyf-重构清理
2. 修复安全问题: /lcyf-安全审查
3. 补充测试: /lcyf-tdd
4. 修复构建错误: /lcyf-构建修复
```

## 与CI/CD集成

可以在CI流水线中使用：

```yaml
# .github/workflows/verify.yml
name: 验证
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: 运行验证
        run: |
          # 执行lcyf验证逻辑
          mvn verify
```

## 注意事项

- **验证前先提交**: 避免丢失未保存的工作
- **增量验证**: 对大型项目使用 quick 模式
- **修复后重新验证**: 确保修复有效
- **PR前必须验证**: 使用 pre-pr 模式

## 相关命令

- `/lcyf-测试覆盖` - 详细的覆盖率分析
- `/lcyf-安全审查` - 专门的安全检查
- `/lcyf-代码审查` - 代码质量审查
- `/lcyf-构建修复` - 修复构建错误
- `/lcyf-检查点` - 创建验证检查点

## 示例用法

```bash
# 开发中快速检查
/lcyf-验证 quick

# 提交前验证
git add .
/lcyf-验证 pre-commit
git commit -m "feature: add user service"

# PR前完整验证
/lcyf-验证 pre-pr
```
