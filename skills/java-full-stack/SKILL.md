# Java全栈开发技能

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

### Controller模板

```java
@Tag(name = "{{description}}")
@RestController
@RequestMapping("/{{moduleName}}/{{urlPath}}")
@RequiredArgsConstructor
public class {{EntityName}}Controller {

    private final I{{EntityName}}Service {{entityName}}Service;

    @Operation(summary = "分页查询")
    @GetMapping("/page")
    public CommonResult<PageResult<{{EntityName}}DTO>> page(
            @Valid {{EntityName}}PageQuery query) {
        return success({{entityName}}Service.page(query));
    }

    @Operation(summary = "获取详情")
    @GetMapping("/{id}")
    public CommonResult<{{EntityName}}DTO> get(@PathVariable Long id) {
        return success({{entityName}}Service.getById(id));
    }

    @Operation(summary = "创建")
    @PostMapping
    public CommonResult<Long> create(
            @Valid @RequestBody {{EntityName}}CreateCmd cmd) {
        return success({{entityName}}Service.create(cmd));
    }

    @Operation(summary = "更新")
    @PutMapping
    public CommonResult<Boolean> update(
            @Valid @RequestBody {{EntityName}}UpdateCmd cmd) {
        {{entityName}}Service.update(cmd);
        return success(true);
    }

    @Operation(summary = "删除")
    @DeleteMapping("/{id}")
    public CommonResult<Boolean> delete(@PathVariable Long id) {
        {{entityName}}Service.delete(id);
        return success(true);
    }
}
```

### Service接口模板

```java
public interface I{{EntityName}}Service {

    PageResult<{{EntityName}}DTO> page({{EntityName}}PageQuery query);

    {{EntityName}}DTO getById(Long id);

    Long create({{EntityName}}CreateCmd cmd);

    void update({{EntityName}}UpdateCmd cmd);

    void delete(Long id);
}
```

### ServiceImpl模板

```java
@Service
@RequiredArgsConstructor
public class {{EntityName}}ServiceImpl implements I{{EntityName}}Service {

    private final {{EntityName}}Mapper {{entityName}}Mapper;

    @Override
    public PageResult<{{EntityName}}DTO> page({{EntityName}}PageQuery query) {
        return {{entityName}}Mapper.selectPage(query,
            new LambdaQueryWrapperX<{{EntityName}}DO>()
                .likeIfPresent({{EntityName}}DO::getName, query.getName())
                .orderByDesc({{EntityName}}DO::getCreateTime));
    }

    @Override
    public {{EntityName}}DTO getById(Long id) {
        {{EntityName}}DO entity = {{entityName}}Mapper.selectById(id);
        if (entity == null) {
            throw new NotFoundException("记录不存在");
        }
        return convert(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create({{EntityName}}CreateCmd cmd) {
        {{EntityName}}DO entity = new {{EntityName}}DO();
        BeanUtils.copyProperties(cmd, entity);
        {{entityName}}Mapper.insert(entity);
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update({{EntityName}}UpdateCmd cmd) {
        {{EntityName}}DO entity = {{entityName}}Mapper.selectById(cmd.getId());
        if (entity == null) {
            throw new NotFoundException("记录不存在");
        }
        BeanUtils.copyProperties(cmd, entity);
        {{entityName}}Mapper.updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        {{entityName}}Mapper.deleteById(id);
    }

    private {{EntityName}}DTO convert({{EntityName}}DO entity) {
        {{EntityName}}DTO dto = new {{EntityName}}DTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
```

### Entity模板

```java
@TableName("{{tableName}}")
@Data
@EqualsAndHashCode(callSuper = true)
public class {{EntityName}}DO extends BaseDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    // 业务字段
}
```

### Mapper模板

```java
@Mapper
public interface {{EntityName}}Mapper extends BaseMapperX<{{EntityName}}DO> {
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

- 03-Java开发专家

## 关联规则

- 06-Java编码规范
- 07-SpringBoot最佳实践
- 08-MyBatis规范
