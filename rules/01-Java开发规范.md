# 01-Java开发规范 (lcyf-cloud 架构)

> **Tech Stack**: Java 21 + Spring Boot 3.5.x + Dubbo 3.3.3 + MyBatis-Plus 3.5.x + DDD+COLA

---

## 🎯 核心约束速查表

### ✅ MUST (必须)

| 规则 | 说明 |
|------|------|
| `@RequiredArgsConstructor` | 所有依赖注入，禁用 `@Autowired` |
| `@Slf4j` | 所有 Service/Gateway 类 |
| `@Validated` + `@Valid` | Controller 类 + Cmd 参数 |
| `extends TenantBaseDO` | 业务实体继承（多租户） |
| `IdType.ASSIGN_ID` | 主键生成策略 |
| `implements Serializable` | 所有 DTO/Cmd + `serialVersionUID` |
| `BeanSearcher` | 分页查询 |
| `MapStruct Assembler` | 对象转换 |
| `ServiceException` | 业务异常 |

### ❌ NEVER (禁止)

| 禁止行为 | 替代方案 |
|---------|---------|
| `@Autowired` | `@RequiredArgsConstructor` |
| Magic values | 常量/枚举 |
| `catch` 不打日志 | `log.error(..., e)` |
| 返回 `null` | `Optional` / 空集合 |
| 手动设置 `tenant_code` | 框架自动注入 |
| `System.out.println` | `@Slf4j` |
| 在 DTO/DO 中写业务逻辑 | 放 Service 层 |

---

## 📐 架构决策矩阵

### 组件放置位置

| 组件类型 | 路径 |
|---------|------|
| Controller | `{module}-adapter/web/{business}/` |
| Service Interface | `{module}-biz/service/` |
| Service Impl | `{module}-biz/service/impl/` |
| Gateway | `{module}-biz/infrastructure/gateway/` |
| Mapper | `{module}-biz/infrastructure/mapper/` |
| Assembler | `{module}-biz/infrastructure/assembler/` |
| DO (Entity) | `{module}-biz/infrastructure/entity/` |
| Cmd/Dto/Query/Vo | `{module}-api/pojo/{type}/` |
| Enum (模块) | `{module}-api/enums/` |
| Enum (全局) | `lcyf-common-dto/enums/` |
| DTO (跨模块) | `lcyf-common-dto/dto/` |
| RPC Interface | `{module}-api/rpc/` |
| RPC Impl | `{module}-adapter/rpc/` |

### ⚠️ 重要：API 层统一位置

**所有业务模块的 API 层（Cmd/DTO/Query/Vo/Enum/RPC）统一放在 `lcyf-module-base` 仓库，而非各自业务模块仓库。**

```
lcyf-module-base/                          ← API 层统一仓库
├── lcyf-module-system-api/
├── lcyf-module-policy-api/
├── lcyf-module-{xxx}-api/
│   └── src/main/java/.../api/
│       ├── pojo/cmd/    ← Cmd
│       ├── pojo/dto/    ← DTO
│       ├── pojo/query/  ← Query
│       ├── enums/       ← Enum
│       └── rpc/         ← RPC
└── ...

lcyf-module-{xxx}/                         ← 业务模块仓库（只有 biz + adapter）
├── lcyf-module-{xxx}-biz/
└── lcyf-module-{xxx}-adapter/
```

| 正确 ✅ | 错误 ❌ |
|--------|--------|
| `lcyf-module-base/lcyf-module-{xxx}-api/` | `lcyf-module-{xxx}/lcyf-module-{xxx}-api/` (不存在) |

### 生成决策

| 场景 | 生成范围 |
|------|---------|
| 新 CRUD 实体 | 全栈: DO→Mapper→Cmd/Dto→Assembler→Gateway→Service→Controller |
| 已有实体加方法 | 只修改对应层 |
| 跨模块 RPC | 接口放 `{module}-api/rpc/`，实现放 `{module}-adapter/rpc/` |

---

## 🛠️ 代码模板

### 1. Controller

```java
@RestController
@RequestMapping("/api/v1/{module}/auth/{business}")
@Tag(name = "{业务描述}")
@RequiredArgsConstructor
@Validated
public class {Entity}Controller {

    private final I{Entity}Service {entity}Service;

    @GetMapping("/page")
    @Operation(summary = "分页查询")
    public CommonResult<PageResult<{Entity}Dto>> page(HttpServletRequest request) {
        return CommonResult.success({entity}Service.get{Entity}Page(MapUtils.flat(request.getParameterMap())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "详情")
    public CommonResult<{Entity}Dto> get(@PathVariable Long id) {
        return CommonResult.success({entity}Service.get(id));
    }

    @PostMapping("/add")
    @Operation(summary = "新增")
    public CommonResult<Object> add(@RequestBody @Valid {Entity}AddCmd cmd) {
        {entity}Service.create(cmd);
        return CommonResult.success();
    }

    @PutMapping("/update")
    @Operation(summary = "修改")
    public CommonResult<Object> update(@RequestBody @Valid {Entity}UpdateCmd cmd) {
        {entity}Service.modify(cmd);
        return CommonResult.success();
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除")
    public CommonResult<Object> delete(@PathVariable Long id) {
        {entity}Service.delete(id);
        return CommonResult.success();
    }
}
```

**URL 规则**:
- 认证: `/api/v{n}/{module}/auth/{business}`
- 公开: `/api/v{n}/{module}/{business}`
- 开放平台: `/openapi/v{n}/{type}/{business}`

### 2. Service Interface

```java
public interface I{Entity}Service {
    PageResult<{Entity}Dto> get{Entity}Page(Map<String, Object> paraMap);
    {Entity}Dto get(Long id);
    Long create({Entity}AddCmd addCmd);
    void modify({Entity}UpdateCmd updateCmd);
    void delete(Long id);
}
```

### 3. Service Impl

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class {Entity}ServiceImpl implements I{Entity}Service {

    private final {Entity}Gateway {entity}Gateway;

    @Override
    public PageResult<{Entity}Dto> get{Entity}Page(Map<String, Object> paraMap) {
        log.info("分页查询{业务}, params: {}", paraMap);
        return {entity}Gateway.selectPage(paraMap);
    }

    @Override
    public {Entity}Dto get(Long id) {
        return {entity}Gateway.selectById(id);
    }

    @Override
    public Long create({Entity}AddCmd addCmd) {
        log.info("新增{业务}, cmd: {}", addCmd);
        return {entity}Gateway.save(addCmd);
    }

    @Override
    public void modify({Entity}UpdateCmd updateCmd) {
        log.info("修改{业务}, cmd: {}", updateCmd);
        {entity}Gateway.updateById(updateCmd);
    }

    @Override
    public void delete(Long id) {
        log.info("删除{业务}, id: {}", id);
        {entity}Gateway.removeById(id);
    }
}
```

### 4. Gateway

```java
@Service
@RequiredArgsConstructor
public class {Entity}Gateway extends CrudRepository<{Entity}Mapper, {Entity}Do> {

    private final {Entity}Assembler {entity}Assembler;
    private final BeanSearcher beanSearcher;

    public PageResult<{Entity}Dto> selectPage(Map<String, Object> paraMap) {
        SearchResult<{Entity}Do> search = beanSearcher.search({Entity}Do.class, paraMap);
        return {entity}Assembler.convertPage(new PageResult<>(search.getDataList(), search.getTotalCount().longValue()));
    }

    public {Entity}Dto selectById(Long id) {
        return {entity}Assembler.convert(super.getById(id));
    }

    public Long save({Entity}AddCmd addCmd) {
        {Entity}Do entity = {entity}Assembler.convert(addCmd);
        super.save(entity);
        return entity.getId();
    }

    public void updateById({Entity}UpdateCmd updateCmd) {
        this.updateById({entity}Assembler.convert(updateCmd));
    }
}
```

### 5. Mapper

```java
public interface {Entity}Mapper extends BaseMapper<{Entity}Do> { }
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.lcyf.cloud.module.{domain}.biz.infrastructure.mapper.{Entity}Mapper">
</mapper>
```

### 6. Assembler (MapStruct)

```java
@Mapper(componentModel = "spring",
        nullValueIterableMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface {Entity}Assembler {

    {Entity}Assembler INSTANCE = Mappers.getMapper({Entity}Assembler.class);

    {Entity}Do convert({Entity}AddCmd addCmd);
    {Entity}Do convert({Entity}UpdateCmd updateCmd);
    {Entity}Dto convert({Entity}Do entity);
    List<{Entity}Dto> convertList(List<{Entity}Do> list);
    PageResult<{Entity}Dto> convertPage(PageResult<{Entity}Do> page);
}
```

### 7. DO (Entity)

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("{table_name}")
@SearchBean(tables = "{table_name}")
@Schema(description = "{业务描述}实体")
public class {Entity}Do extends TenantBaseDO {

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @DbField("id")
    @Schema(description = "主键ID")
    private Long id;

    @DbField("{db_field}")
    @Schema(description = "{字段描述}")
    private String {fieldName};
}
```

**继承规则**: 多租户业务实体 → `TenantBaseDO` | 全局配置表 → `BaseDO`

### 8. DTO

```java
@Data
@Schema(description = "{业务描述}DTO")
public class {Entity}Dto implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "{字段描述}")
    private String {fieldName};
}
```

### 9. AddCmd / UpdateCmd

```java
@Data
@Schema(description = "{业务描述}新增命令")
public class {Entity}AddCmd implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "{字段描述}")
    @NotBlank(message = "{字段描述}不能为空")
    private String {fieldName};
}
```

```java
@Data
@Schema(description = "{业务描述}更新命令")
public class {Entity}UpdateCmd implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "主键ID")
    @NotNull(message = "ID不能为空")
    private Long id;

    @Schema(description = "{字段描述}")
    @NotBlank(message = "{字段描述}不能为空")
    private String {fieldName};
}
```

### 10. Enum

```java
@Getter
@AllArgsConstructor
public enum {Name}Enum implements ArrayValuable {

    TYPE_A("0", "类型A"),
    TYPE_B("1", "类型B");

    private final String code;
    private final String desc;

    public static final Set<Object> CODE_ARRAY = Arrays.stream(values())
        .map(s -> (Object) s.getCode()).collect(Collectors.toSet());

    public static final Map<Object, String> VALUE_DESC_MAP = Arrays.stream(values())
        .collect(Collectors.toMap({Name}Enum::getCode, {Name}Enum::getDesc));

    public static {Name}Enum parse(String code) {
        for ({Name}Enum v : values()) {
            if (v.getCode().equals(code)) return v;
        }
        throw new RuntimeException("枚举解析失败: " + code);
    }

    @Override
    public Set<Object> array() { return CODE_ARRAY; }

    @Override
    public Map<Object, String> valueDescMap() { return VALUE_DESC_MAP; }
}
```

### 11. RPC Interface + Impl

```java
// Interface: {module}-api/rpc/
public interface {Domain}Api {
    {Entity}Dto get{Entity}ById(Long id);
    List<{Entity}Dto> get{Entity}List({Entity}Query query);
    Long save{Entity}({Entity}Cmd cmd);
    void delete{Entity}(Long id);
}

// Impl: {module}-adapter/rpc/
@DubboService
@RequiredArgsConstructor
public class {Domain}ApiImpl implements {Domain}Api {
    private final I{Entity}Service {entity}Service;

    @Override
    public {Entity}Dto get{Entity}ById(Long id) {
        return {entity}Service.get(id);
    }
}

// Consumer
@DubboReference
private {Domain}Api {domain}Api;
```

---

## 🔍 命名规范

### 方法命名

| 层级 | 分页 | 详情 | 新增 | 修改 | 删除 |
|------|------|------|------|------|------|
| Controller | `page()` | `get()` | `add()` | `update()` | `delete()` |
| Service | `get{E}Page()` | `get()` | `create()` | `modify()` | `delete()` |
| Gateway | `selectPage()` | `selectById()` | `save()` | `updateById()` | `removeById()` |
| RPC | `query{E}Page()` | `get{E}ById()` | `save{E}()` | `modify{E}()` | `delete{E}()` |

### 类命名

| 类型 | 模式 | 示例 |
|------|------|------|
| Controller | `{Entity}Controller` | `FeeAuditController` |
| Service | `I{Entity}Service` / `{Entity}ServiceImpl` | `IFeeAuditService` |
| Gateway | `{Entity}Gateway` | `FeeAuditGateway` |
| Mapper | `{Entity}Mapper` | `FeeAuditMapper` |
| Assembler | `{Entity}Assembler` | `FeeAuditAssembler` |
| DO | `{Entity}Do` | `FeeAuditDo` |
| DTO | `{Entity}Dto` | `FeeAuditDto` |
| Cmd | `{Entity}AddCmd` / `{Entity}UpdateCmd` | `FeeAuditAddCmd` |
| Enum | `{Name}Enum` | `EnableStatusEnum` |

### 变量命名

```java
// ✅ 有意义的名称
User currentUser;
List<Order> pendingOrders;
int maxRetryCount;

// ❌ 避免无意义的名称
User u;
List<Order> list;
int n;

// ✅ 布尔变量使用is/has/can前缀
boolean isActive;
boolean hasPermission;
boolean canEdit;

// ✅ 常量使用全大写+下划线
private static final int MAX_RETRY_COUNT = 3;
private static final String DEFAULT_CHARSET = "UTF-8";
```

---

## 📝 代码格式

### 缩进与空格

```java
// ✅ 使用4个空格缩进
public class UserService {
    private UserMapper userMapper;
}

// ✅ 运算符两侧加空格
int result = a + b;
String name = user != null ? user.getName() : "unknown";

// ✅ 逗号后加空格
public void method(String a, String b, String c) {}
```

### 大括号

```java
// ✅ 大括号同行（K&R风格）
if (condition) {
    // code
} else {
    // code
}

// ✅ 单行语句也使用大括号
if (condition) {
    return true;
}

// ❌ 避免省略大括号
if (condition)
    return true;
```

### 行长度与换行

- 最大行长度：120字符
- 超长时合理换行

```java
// ✅ 方法调用换行
String result = someService
    .methodWithLongName()
    .anotherMethod()
    .finalMethod();

// ✅ 参数过多时换行
public void methodWithManyParams(
        String param1,
        String param2,
        String param3) {
    // ...
}
```

### 方法长度

- 单个方法不超过50行
- 超过时考虑拆分

```java
// ❌ 过长的方法
public void processOrder(Order order) {
    // 100+ 行代码...
}

// ✅ 拆分为小方法
public void processOrder(Order order) {
    validateOrder(order);
    calculatePrice(order);
    applyDiscount(order);
    saveOrder(order);
    sendNotification(order);
}
```

---

## 📖 注释规范

### 类注释

```java
/**
 * 用户服务实现类
 *
 * <p>处理用户相关的业务逻辑，包括用户的增删改查、
 * 权限验证、状态管理等功能。</p>
 *
 * @author 张三
 * @since 2025-01-01
 */
public class UserServiceImpl implements IUserService {
}
```

### 方法注释

```java
/**
 * 根据ID获取用户信息
 *
 * @param id 用户ID，不能为空
 * @return 用户信息，如果不存在返回null
 * @throws IllegalArgumentException 如果id为null
 */
public User getById(Long id) {
}
```

### 代码注释

```java
// ✅ 解释"为什么"，而不是"是什么"
// 使用乐观锁防止并发更新冲突
@Version
private Integer version;

// ❌ 避免无意义的注释
// 获取用户
User user = userService.getById(id);
```

---

## ⚠️ 异常 & 日志

### 异常处理

```java
// 业务校验失败
throw new ServiceException(ErrorCode.XXX_ERROR);
throw new ServiceException(ErrorCodeConstants.XXX_ERROR, "详细信息");

// 系统错误
throw new ServerException(ErrorCode.SYSTEM_ERROR);
```

**规则**: Controller 不捕获异常(交给全局处理) | Service 必须 catch 并打日志

### 异常捕获

```java
// ✅ 捕获具体异常
try {
    userService.save(user);
} catch (DuplicateKeyException e) {
    throw new BusinessException("用户名已存在", e);
}

// ❌ 避免捕获 Exception
try {
    userService.save(user);
} catch (Exception e) {
    // 太宽泛
}

// ✅ 不要吞掉异常
try {
    // ...
} catch (IOException e) {
    log.error("文件操作失败", e);
    throw new BusinessException("操作失败", e);
}
```

### 日志规范

```java
@Slf4j
public class XxxServiceImpl {
    public void process(Long id) {
        log.info("开始处理, id={}", id);          // ✅ 用占位符 {}
        try {
            log.debug("处理详情: {}", detail);
        } catch (Exception e) {
            log.error("处理失败, id={}", id, e);  // ✅ 异常对象放最后
            throw new ServiceException(ErrorCode.XXX_ERROR);
        }
    }
}
```

**禁止**: 字符串拼接 `"id=" + id` | 不打异常对象 | 打印敏感数据

---

## 🔐 参数校验

### 常用注解

| 注解 | 用途 |
|------|------|
| `@NotNull` | 非 null |
| `@NotBlank` | 字符串非空白 |
| `@NotEmpty` | 集合非空 |
| `@Min` / `@Max` | 数值范围 |
| `@Email` | 邮箱格式 |
| `@Pattern` | 正则匹配 |
| `@Valid` | 嵌套校验 |

### 使用方式

```java
@RestController
@Validated                                        // Controller 类上
public class XxxController {
    @PostMapping("/add")
    public CommonResult<Object> add(@RequestBody @Valid XxxAddCmd cmd) { }  // 参数上
}
```

---

## 📦 依赖管理

### 禁止指定版本

```xml
<!-- ❌ 错误 -->
<dependency>
    <artifactId>lcyf-framework-starter-web</artifactId>
    <version>2.24.0-SNAPSHOT</version>
</dependency>

<!-- ✅ 正确 -->
<dependency>
    <artifactId>lcyf-framework-starter-web</artifactId>
</dependency>
```

### 框架 Starter

| Starter | 功能 |
|---------|------|
| `lcyf-framework-starter-web` | Web 基础 |
| `lcyf-framework-starter-dal` | 数据库 |
| `lcyf-framework-starter-redis` | 缓存 |
| `lcyf-framework-starter-dubbo` | RPC |
| `lcyf-framework-starter-mq` | 消息队列 |
| `lcyf-framework-starter-security` | 安全认证 |
| `lcyf-framework-starter-tenant` | 多租户 |
| `lcyf-framework-starter-excel` | Excel |
| `lcyf-framework-starter-oss` | 对象存储 |

---

## 📚 工具类速查

```java
// 字符串/集合
StringUtils.hasText(str)
CollectionUtil.isEmpty(list)
ObjectUtil.isNotNull(obj)

// 日期
DateUtil.format(date, "yyyy-MM-dd")
DateUtil.parse("2024-01-01", "yyyy-MM-dd")

// Bean
BeanUtil.copyProperties(source, target)

// 异常
ServiceExceptionUtil.exception(ErrorCode.XXX_ERROR)
```

---

## ✅ 3 秒自检清单

### 注解检查
- [ ] `@RequiredArgsConstructor` (Service/Controller/Gateway)
- [ ] `@Slf4j` (Service/Gateway)
- [ ] `@Validated` (Controller 类) + `@Valid` (Cmd 参数)
- [ ] `@Tag` + `@Operation` (Controller)
- [ ] `@Schema` (DTO/Cmd 字段)
- [ ] `@TableName` + `@SearchBean` + `@DbField` (DO)

### 继承检查
- [ ] DO extends `TenantBaseDO` (业务) / `BaseDO` (全局)
- [ ] 主键 `IdType.ASSIGN_ID`
- [ ] DTO/Cmd implements `Serializable` + `serialVersionUID`

### 禁止检查
- [ ] ❌ 无 `@Autowired`
- [ ] ❌ 无 Magic Values
- [ ] ❌ 无 `return null`
- [ ] ❌ 无 手动设置 `tenant_code`
- [ ] ❌ 无 catch 不打日志

---

## 🚀 生成步骤

1. **收集需求**: 实体名、领域、字段、是否多租户、所属模块
2. **按顺序生成**:
   1. DO → Mapper → Cmd/Dto → Assembler → Gateway → Service → Controller
3. **自检清单验证**
4. **完整生成**: 不生成半成品

---

## 关联 Agent

- java-developer：Java 代码实现

---

**Last Updated**: 2026-01-28 | **Applies To**: lcyf-cloud All Microservices
