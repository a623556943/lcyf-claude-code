# Java 编码规范

lcyf 项目中必须遵守的 Java 开发规范。

## 命名规范

- **类名**: PascalCase (`UserService`, `OrderController`)
- **方法/变量**: camelCase (`getUserById`, `totalAmount`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE`)
- **包名**: 小写 (`com.lcyf.module.finance`)

## 类结构顺序

- **字段** （private，然后 protected）
- **构造方法**
- **公有方法**
- **私有方法**

## 代码风格

- **行长**: 最多 120 个字符
- **缩进**: 4 个空格
- **花括号**: 必须使用，即使是单行代码块
- **无未使用的导入**

## 最佳实践

- ✅ 使用构造函数注入，不要字段注入
- ✅ 尽可能使字段为 final
- ✅ 避免使用 public 字段
- ✅ 一个文件只有一个类
- ✅ 使用 @Override 注解

## 注释规范

- Javadoc 用于公有方法
- 注释解释 **为什么**，不是 **是什么**
- 不允许保留已注释的代码

## 禁止事项

- ❌ 不使用 System.out.println（使用 SLF4J logger）
- ❌ 不硬编码值（使用常量或配置）
- ❌ 不使用原始类型（使用泛型）
- ❌ 不对 @NotNull 参数进行 null 检查

---

遵循这些规范以保持代码一致性和可维护性。
