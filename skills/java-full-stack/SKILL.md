---
name: java-full-stack
description: 在实现 lcyf-cloud Java/Spring Boot 功能时使用。提供 Controller、Service、Gateway、Assembler 层的代码模板。当执行 /lcyf-new-feature、/lcyf-tdd 命令或 java-developer agent 需要模板时激活。
---

# Java全栈开发技能

## 文件清单

本 skill 包含以下内容，供 Claude 参考：

### 核心内容
- **代码模板**（第58-520行）：10个完整的代码模板
  - Controller 模板（第58-120行）：REST API 控制器模板，包含 CRUD 操作
  - Service 接口模板（第122-164行）：业务服务接口定义
  - Service 实现模板（第166-223行）：业务逻辑实现
  - Gateway 模板（第225-289行）：数据访问层，集成 CrudRepository 和 BeanSearcher
  - Assembler 模板（第291-343行）：MapStruct 对象转换器
  - Mapper 模板（第345-358行）：MyBatis-Plus Mapper 接口
  - Entity (DO) 模板（第360-395行）：数据实体类，继承 TenantBaseDO
  - DTO 模板（第397-421行）：数据传输对象
  - AddCmd 模板（第423-449行）：新增命令对象，包含校验注解
  - UpdateCmd 模板（第451-478行）：更新命令对象

- **常用代码片段**（第480-520行）：
  - 分页查询示例（使用 BeanSearcher）
  - 事务处理示例（@Transactional）
  - 缓存使用示例（@Cacheable, @CacheEvict）

- **分层架构说明**（第24-54行）：
  - adapter/biz/api 三层架构图
  - 各层职责说明
  - 调用关系流程

- **技术栈清单**（第12-21行）：
  - Java 17/21, Spring Boot 3.x
  - MyBatis-Plus, Dubbo, MapStruct, BeanSearcher
  - Redis, MySQL 版本信息

### 何时加载
- 执行 `/lcyf-new-feature` 命令时
- java-developer agent 需要代码模板时
- 用户请求 Java/Spring Boot 代码实现时

## 概述

提供Java/Spring Boot全栈开发的最佳实践和代码模板。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 语言 | Java | 17/21 |
| 框架 | Spring Boot | 3.x |
| ORM | MyBatis-Plus | 3.5.x |
| 数据库 | MySQL | 8.x |
| 缓存 | Redis | 7.x |
| RPC | Dubbo | 3.x |

## 分层架构

```
┌─────────────────────────────────────────┐
│              adapter（适配层）            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   web   │ │   rpc   │ │   mq    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│               biz（业务层）              │
│  ┌─────────────────────────────────┐   │
│  │           service               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │        infrastructure           │   │
│  │  ┌─────────┐ ┌─────────┐       │   │
│  │  │ entity  │ │ mapper  │       │   │
│  │  └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│               api（接口层）              │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐ │
│  │  cmd  │ │  dto  │ │ query │ │view │ │
│  └───────┘ └───────┘ └───────┘ └─────┘ │
└─────────────────────────────────────────┘
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

### 4. Gateway 模板

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

### 5. Assembler 模板

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

### 7. Entity (DO) 模板

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

## 常用代码片段

### 分页查询

```java
public PageResult<UserDTO> page(UserPageQuery query) {
    return userMapper.selectPage(query,
        new LambdaQueryWrapperX<UserDO>()
            .likeIfPresent(UserDO::getUsername, query.getUsername())
            .eqIfPresent(UserDO::getStatus, query.getStatus())
            .betweenIfPresent(UserDO::getCreateTime,
                query.getBeginTime(), query.getEndTime())
            .orderByDesc(UserDO::getCreateTime));
}
```

### 事务处理

```java
@Transactional(rollbackFor = Exception.class)
public void batchProcess(List<OrderDTO> orders) {
    for (OrderDTO order : orders) {
        processOrder(order);
    }
}
```

### 缓存使用

```java
@Cacheable(value = "user", key = "#id", unless = "#result == null")
public UserDTO getById(Long id) {
    return userMapper.selectById(id);
}

@CacheEvict(value = "user", key = "#dto.id")
public void update(UserDTO dto) {
    userMapper.updateById(convert(dto));
}
```

## 关联Agent

- java-developer

## 关联规则

- 06-Java编码规范
- 07-SpringBoot最佳实践
- 08-MyBatis规范
