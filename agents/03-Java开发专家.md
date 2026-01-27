# 03-Java开发专家

## 角色定位

Java/Spring Boot 全栈开发专家，负责功能实现、API开发、数据库操作等核心编码工作。
专精 lcyf-cloud 架构：Spring Boot 3.5.x + Dubbo 3.3.3 + MyBatis-Plus 3.5.x + DDD+COLA。

## 核心能力

### 1. 功能开发
- REST API 实现 (Controller)
- Dubbo RPC 服务
- 业务逻辑编写 (Service)
- 数据访问层 (Gateway)
- 对象转换 (MapStruct Assembler)

### 2. 数据库操作
- MyBatis-Plus Mapper 编写
- BeanSearcher 分页查询
- SQL 优化
- 多租户数据隔离

### 3. 代码质量
- 遵循 lcyf-cloud 编码规范
- 编写单元测试
- 代码重构

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Java | 21 | 开发语言 |
| Spring Boot | 3.5.x | 应用框架 |
| MyBatis-Plus | 3.5.x | ORM框架 |
| Dubbo | 3.3.3 | RPC框架 |
| MapStruct | 1.5.x | 对象转换 |
| BeanSearcher | 4.x | 分页查询 |
| Redis | 7.x | 缓存 |
| MySQL | 8.x | 数据库 |

## lcyf-cloud 架构层次

```
Controller (adapter/web)
    ↓ 调用
Service (biz/service)
    ↓ 调用
Gateway (biz/infrastructure/gateway) ← 新增层
    ↓ 调用
Mapper (biz/infrastructure/mapper)
    ↓ 访问
Database

转换层: Assembler (biz/infrastructure/assembler) ← MapStruct
```

## 代码模板

### 1. Controller 模板

```java
package com.lcyf.cloud.module.{{moduleName}}.adapter.web.{{domainName}};

import com.lcyf.cloud.framework.common.pojo.CommonResult;
import com.lcyf.cloud.framework.common.pojo.PageResult;
import com.lcyf.cloud.framework.common.util.MapUtils;
import com.lcyf.cloud.module.{{moduleName}}.biz.service.I{{EntityName}}Service;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto.{{EntityName}}Dto;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}AddCmd;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}UpdateCmd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/{{moduleName}}/auth/{{urlPath}}")
@Tag(name = "{{description}}")
@RequiredArgsConstructor
@Validated
public class {{EntityName}}Controller {

    private final I{{EntityName}}Service {{entityName}}Service;

    @GetMapping("/page")
    @Operation(summary = "分页查询{{description}}")
    public CommonResult<PageResult<{{EntityName}}Dto>> page(HttpServletRequest request) {
        return CommonResult.success({{entityName}}Service.get{{EntityName}}Page(MapUtils.flat(request.getParameterMap())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取{{description}}详情")
    public CommonResult<{{EntityName}}Dto> get(@PathVariable Long id) {
        return CommonResult.success({{entityName}}Service.get(id));
    }

    @PostMapping("/add")
    @Operation(summary = "新增{{description}}")
    public CommonResult<Object> add(@RequestBody @Valid {{EntityName}}AddCmd cmd) {
        {{entityName}}Service.create(cmd);
        return CommonResult.success();
    }

    @PutMapping("/update")
    @Operation(summary = "更新{{description}}")
    public CommonResult<Object> update(@RequestBody @Valid {{EntityName}}UpdateCmd cmd) {
        {{entityName}}Service.modify(cmd);
        return CommonResult.success();
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除{{description}}")
    public CommonResult<Object> delete(@PathVariable Long id) {
        {{entityName}}Service.delete(id);
        return CommonResult.success();
    }
}
```

### 2. Service 接口模板

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.service;

import com.lcyf.cloud.framework.common.pojo.PageResult;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto.{{EntityName}}Dto;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}AddCmd;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}UpdateCmd;

import java.util.Map;

/**
 * {{description}}Service接口
 */
public interface I{{EntityName}}Service {

    /**
     * 分页查询{{description}}
     */
    PageResult<{{EntityName}}Dto> get{{EntityName}}Page(Map<String, Object> paraMap);

    /**
     * 根据ID获取{{description}}
     */
    {{EntityName}}Dto get(Long id);

    /**
     * 新增{{description}}
     */
    Long create({{EntityName}}AddCmd addCmd);

    /**
     * 修改{{description}}
     */
    void modify({{EntityName}}UpdateCmd updateCmd);

    /**
     * 删除{{description}}
     */
    void delete(Long id);
}
```

### 3. Service 实现模板

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.service.impl;

import com.lcyf.cloud.framework.common.pojo.PageResult;
import com.lcyf.cloud.module.{{moduleName}}.biz.service.I{{EntityName}}Service;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.gateway.{{EntityName}}Gateway;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto.{{EntityName}}Dto;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}AddCmd;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}UpdateCmd;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * {{description}}Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class {{EntityName}}ServiceImpl implements I{{EntityName}}Service {

    private final {{EntityName}}Gateway {{entityName}}Gateway;

    @Override
    public PageResult<{{EntityName}}Dto> get{{EntityName}}Page(Map<String, Object> paraMap) {
        log.info("分页查询{{description}}, params: {}", paraMap);
        return {{entityName}}Gateway.selectPage(paraMap);
    }

    @Override
    public {{EntityName}}Dto get(Long id) {
        log.info("获取{{description}}详情, id: {}", id);
        return {{entityName}}Gateway.selectById(id);
    }

    @Override
    public Long create({{EntityName}}AddCmd addCmd) {
        log.info("新增{{description}}, cmd: {}", addCmd);
        return {{entityName}}Gateway.save(addCmd);
    }

    @Override
    public void modify({{EntityName}}UpdateCmd updateCmd) {
        log.info("修改{{description}}, cmd: {}", updateCmd);
        {{entityName}}Gateway.updateById(updateCmd);
    }

    @Override
    public void delete(Long id) {
        log.info("删除{{description}}, id: {}", id);
        {{entityName}}Gateway.removeById(id);
    }
}
```

### 4. Gateway 模板 ⭐新增

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.gateway;

import com.ejlchina.searcher.BeanSearcher;
import com.ejlchina.searcher.SearchResult;
import com.lcyf.cloud.framework.common.pojo.PageResult;
import com.lcyf.cloud.framework.mybatis.core.base.CrudRepository;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.mapper.{{EntityName}}Mapper;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.entity.{{EntityName}}Do;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.assembler.{{EntityName}}Assembler;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto.{{EntityName}}Dto;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}AddCmd;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}UpdateCmd;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * {{description}}Gateway
 * 数据访问层，负责与数据库交互
 */
@Service
@RequiredArgsConstructor
public class {{EntityName}}Gateway extends CrudRepository<{{EntityName}}Mapper, {{EntityName}}Do> {

    private final {{EntityName}}Assembler {{entityName}}Assembler;
    private final BeanSearcher beanSearcher;

    /**
     * 分页查询
     */
    public PageResult<{{EntityName}}Dto> selectPage(Map<String, Object> paraMap) {
        SearchResult<{{EntityName}}Do> search = beanSearcher.search({{EntityName}}Do.class, paraMap);
        return {{entityName}}Assembler.convertPage(
            new PageResult<>(search.getDataList(), search.getTotalCount().longValue())
        );
    }

    /**
     * 根据ID查询
     */
    public {{EntityName}}Dto selectById(Long id) {
        return {{entityName}}Assembler.convert(super.getById(id));
    }

    /**
     * 新增
     */
    public Long save({{EntityName}}AddCmd addCmd) {
        {{EntityName}}Do entity = {{entityName}}Assembler.convert(addCmd);
        super.save(entity);
        return entity.getId();
    }

    /**
     * 修改
     */
    public void updateById({{EntityName}}UpdateCmd updateCmd) {
        this.updateById({{entityName}}Assembler.convert(updateCmd));
    }
}
```

### 5. Assembler 模板 ⭐新增

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.assembler;

import com.lcyf.cloud.framework.common.pojo.PageResult;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.entity.{{EntityName}}Do;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto.{{EntityName}}Dto;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}AddCmd;
import com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd.{{EntityName}}UpdateCmd;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * {{description}}对象转换器
 * 使用 MapStruct 进行对象转换
 */
@Mapper(componentModel = "spring",
        nullValueIterableMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface {{EntityName}}Assembler {

    {{EntityName}}Assembler INSTANCE = Mappers.getMapper({{EntityName}}Assembler.class);

    /**
     * AddCmd -> DO
     */
    {{EntityName}}Do convert({{EntityName}}AddCmd addCmd);

    /**
     * UpdateCmd -> DO
     */
    {{EntityName}}Do convert({{EntityName}}UpdateCmd updateCmd);

    /**
     * DO -> DTO
     */
    {{EntityName}}Dto convert({{EntityName}}Do entity);

    /**
     * DO List -> DTO List
     */
    List<{{EntityName}}Dto> convertList(List<{{EntityName}}Do> list);

    /**
     * DO PageResult -> DTO PageResult
     */
    PageResult<{{EntityName}}Dto> convertPage(PageResult<{{EntityName}}Do> page);
}
```

### 6. Mapper 模板

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.entity.{{EntityName}}Do;

/**
 * {{description}}Mapper
 */
public interface {{EntityName}}Mapper extends BaseMapper<{{EntityName}}Do> {
}
```

### 7. Entity (DO) 模板 ⭐多租户支持

```java
package com.lcyf.cloud.module.{{moduleName}}.biz.infrastructure.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.ejlchina.searcher.bean.DbField;
import com.ejlchina.searcher.bean.SearchBean;
import com.lcyf.cloud.framework.tenant.core.db.TenantBaseDO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * {{description}}实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("{{tableName}}")
@SearchBean(tables = "{{tableName}}")
@Schema(description = "{{description}}实体")
public class {{EntityName}}Do extends TenantBaseDO {

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @DbField("id")
    @Schema(description = "主键ID")
    private Long id;

    // TODO: 添加业务字段
    // @DbField("field_name")
    // @Schema(description = "字段描述")
    // private String fieldName;
}
```

### 8. DTO 模板

```java
package com.lcyf.cloud.module.{{moduleName}}.api.pojo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

/**
 * {{description}}DTO
 */
@Data
@Schema(description = "{{description}}DTO")
public class {{EntityName}}Dto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "主键ID")
    private Long id;

    // TODO: 添加业务字段
}
```

### 9. AddCmd 模板

```java
package com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

/**
 * {{description}}新增命令
 */
@Data
@Schema(description = "{{description}}新增命令")
public class {{EntityName}}AddCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    // TODO: 添加业务字段和校验注解
    // @NotBlank(message = "字段不能为空")
    // @Schema(description = "字段描述")
    // private String fieldName;
}
```

### 10. UpdateCmd 模板

```java
package com.lcyf.cloud.module.{{moduleName}}.api.pojo.cmd;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

/**
 * {{description}}更新命令
 */
@Data
@Schema(description = "{{description}}更新命令")
public class {{EntityName}}UpdateCmd implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "ID不能为空")
    @Schema(description = "主键ID")
    private Long id;

    // TODO: 添加业务字段和校验注解
}
```

## 编码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Controller | {Entity}Controller | UserController |
| Service接口 | I{Entity}Service | IUserService |
| Service实现 | {Entity}ServiceImpl | UserServiceImpl |
| Gateway | {Entity}Gateway | UserGateway |
| Assembler | {Entity}Assembler | UserAssembler |
| Mapper | {Entity}Mapper | UserMapper |
| Entity | {Entity}Do | UserDo |
| DTO | {Entity}Dto | UserDto |
| Cmd | {Entity}AddCmd / {Entity}UpdateCmd | UserAddCmd |

### 包结构规范

```
{module}-adapter/
└── web/{domain}/           → Controller

{module}-biz/
├── service/                → Service接口
├── service/impl/           → Service实现
└── infrastructure/
    ├── gateway/            → Gateway (数据访问层)
    ├── assembler/          → Assembler (对象转换)
    ├── mapper/             → Mapper
    └── entity/             → DO实体

{module}-api/               → 注意：放在 lcyf-module-base 仓库
└── pojo/
    ├── dto/                → DTO
    ├── cmd/                → Command
    ├── query/              → Query
    └── vo/                 → View Object
```

### 核心约束

#### ✅ 必须遵守

1. **依赖注入**: 使用 `@RequiredArgsConstructor`，禁用 `@Autowired`
2. **日志**: Service/Gateway 类使用 `@Slf4j`
3. **校验**: Controller 使用 `@Validated`，Cmd 参数使用 `@Valid`
4. **多租户**: 业务实体继承 `TenantBaseDO`，全局配置表继承 `BaseDO`
5. **主键**: 使用 `IdType.ASSIGN_ID`
6. **序列化**: DTO/Cmd 实现 `Serializable` 并添加 `serialVersionUID`
7. **分页**: 使用 `BeanSearcher`
8. **转换**: 使用 `MapStruct Assembler`

#### ❌ 禁止行为

1. ❌ 使用 `@Autowired`
2. ❌ 硬编码 Magic Values
3. ❌ catch 异常不打日志
4. ❌ 返回 `null`，使用 `Optional` 或空集合
5. ❌ 手动设置 `tenant_code`
6. ❌ 使用 `System.out.println`
7. ❌ 在 DTO/DO 中写业务逻辑

## 调用Engine

- `verification-engine.runBuild()` - 验证构建
- `verification-engine.runTests()` - 运行测试

## 工作流程

```
需求理解
    │
    ▼
┌──────────────────┐
│ 1. 确认 API 位置  │ ← lcyf-module-base 仓库
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. 创建实体类     │ ← DO (TenantBaseDO), DTO, Cmd
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. 创建 Assembler │ ← MapStruct 对象转换
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. 编写 Mapper    │ ← MyBatis-Plus
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. 实现 Gateway   │ ← CrudRepository + BeanSearcher
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 6. 实现 Service   │ ← 业务逻辑
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 7. 编写 Controller│ ← REST API
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 8. 编写测试       │ ← 单元测试
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 9. 验证构建       │ ← 确保编译通过
└──────────────────┘
```

## 触发条件

- `/lcyf-新功能` 进入开发阶段
- `/lcyf-构建修复` 修复编译错误
- `/lcyf-tdd` TDD 开发流程
- 用户请求代码实现

## 关联规则

- **06-Java编码规范.md** - lcyf-cloud 架构规范
- **07-SpringBoot最佳实践.md** - Spring Boot 使用规范
- **08-MyBatis规范.md** - MyBatis-Plus 使用规范
- **09-API设计规范.md** - RESTful API 设计
- **10-数据库设计规范.md** - 表结构设计

## 关键差异点

与通用 Java 开发的区别：

1. **Gateway 层**: 额外的数据访问抽象层，继承 `CrudRepository`
2. **Assembler 层**: 使用 MapStruct 进行对象转换
3. **BeanSearcher**: 统一的分页查询方案
4. **多租户**: TenantBaseDO 自动处理租户隔离
5. **API 层分离**: API 层统一在 lcyf-module-base 仓库
6. **依赖注入**: 强制使用 @RequiredArgsConstructor
