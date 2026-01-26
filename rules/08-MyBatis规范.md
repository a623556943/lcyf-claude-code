# 08-MyBatis规范

## 概述

MyBatis-Plus是项目的ORM框架，本规范确保数据访问层的质量和性能。

## Mapper规范

### Mapper接口

```java
package com.lcyf.cloud.system.biz.infrastructure.mapper;

import com.lcyf.cloud.framework.mybatis.core.mapper.BaseMapperX;
import com.lcyf.cloud.system.biz.infrastructure.entity.UserDO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapperX<UserDO> {

    // 复杂查询使用XML或注解
    @Select("""
        SELECT u.*, d.name as dept_name
        FROM user u
        LEFT JOIN department d ON u.dept_id = d.id
        WHERE u.id = #{id}
        """)
    UserDetailVO selectDetailById(@Param("id") Long id);
}
```

### 自定义BaseMapper

```java
public interface BaseMapperX<T> extends BaseMapper<T> {

    default PageResult<T> selectPage(PageParam pageParam, LambdaQueryWrapper<T> wrapper) {
        Page<T> page = new Page<>(pageParam.getPageNo(), pageParam.getPageSize());
        selectPage(page, wrapper);
        return new PageResult<>(page.getRecords(), page.getTotal());
    }

    default T selectOne(String field, Object value) {
        return selectOne(new QueryWrapper<T>().eq(field, value));
    }

    default int insertBatch(Collection<T> entities) {
        return insertBatch(entities, 500);
    }
}
```

## Entity规范

### 基础实体类

```java
@Data
public abstract class BaseDO implements Serializable {

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 创建人
     */
    @TableField(fill = FieldFill.INSERT)
    private String creator;

    /**
     * 更新人
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updater;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}
```

### 业务实体

```java
@TableName("system_user")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 状态 0-禁用 1-启用
     */
    private Integer status;

    /**
     * 部门ID
     */
    private Long deptId;
}
```

## 查询规范

### LambdaQuery使用

```java
// ✅ 使用LambdaQueryWrapper（类型安全）
public List<UserDO> listByStatus(Integer status) {
    return userMapper.selectList(new LambdaQueryWrapperX<UserDO>()
        .eq(UserDO::getStatus, status)
        .orderByDesc(UserDO::getCreateTime));
}

// ✅ 条件查询
public PageResult<UserDO> page(UserPageQuery query) {
    return userMapper.selectPage(query, new LambdaQueryWrapperX<UserDO>()
        .likeIfPresent(UserDO::getUsername, query.getUsername())
        .eqIfPresent(UserDO::getStatus, query.getStatus())
        .betweenIfPresent(UserDO::getCreateTime, query.getBeginTime(), query.getEndTime())
        .orderByDesc(UserDO::getCreateTime));
}

// ❌ 避免使用字符串字段名
userMapper.selectList(new QueryWrapper<UserDO>()
    .eq("status", status)); // 字符串，不安全
```

### 自定义Wrapper扩展

```java
public class LambdaQueryWrapperX<T> extends LambdaQueryWrapper<T> {

    public LambdaQueryWrapperX<T> likeIfPresent(SFunction<T, ?> column, String val) {
        if (StringUtils.isNotBlank(val)) {
            return (LambdaQueryWrapperX<T>) like(column, val);
        }
        return this;
    }

    public LambdaQueryWrapperX<T> eqIfPresent(SFunction<T, ?> column, Object val) {
        if (val != null) {
            return (LambdaQueryWrapperX<T>) eq(column, val);
        }
        return this;
    }

    public LambdaQueryWrapperX<T> betweenIfPresent(SFunction<T, ?> column,
            Object val1, Object val2) {
        if (val1 != null && val2 != null) {
            return (LambdaQueryWrapperX<T>) between(column, val1, val2);
        }
        if (val1 != null) {
            return (LambdaQueryWrapperX<T>) ge(column, val1);
        }
        if (val2 != null) {
            return (LambdaQueryWrapperX<T>) le(column, val2);
        }
        return this;
    }
}
```

## XML映射

### XML文件规范

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.lcyf.cloud.system.biz.infrastructure.mapper.UserMapper">

    <!-- 结果映射 -->
    <resultMap id="UserDetailResultMap" type="com.lcyf.cloud.system.api.vo.UserDetailVO">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="deptName" column="dept_name"/>
        <collection property="roles" ofType="com.lcyf.cloud.system.api.vo.RoleVO">
            <id property="id" column="role_id"/>
            <result property="name" column="role_name"/>
        </collection>
    </resultMap>

    <!-- 复杂查询 -->
    <select id="selectDetailById" resultMap="UserDetailResultMap">
        SELECT
            u.id, u.username, u.nickname, u.email,
            d.name as dept_name,
            r.id as role_id, r.name as role_name
        FROM system_user u
        LEFT JOIN system_department d ON u.dept_id = d.id
        LEFT JOIN system_user_role ur ON u.id = ur.user_id
        LEFT JOIN system_role r ON ur.role_id = r.id
        WHERE u.id = #{id}
          AND u.deleted = 0
    </select>

</mapper>
```

## 性能优化

### 避免N+1问题

```java
// ❌ N+1问题
List<UserDO> users = userMapper.selectList();
for (UserDO user : users) {
    DeptDO dept = deptMapper.selectById(user.getDeptId()); // 每次循环查询
}

// ✅ 批量查询
List<UserDO> users = userMapper.selectList();
Set<Long> deptIds = users.stream()
    .map(UserDO::getDeptId)
    .filter(Objects::nonNull)
    .collect(Collectors.toSet());
Map<Long, DeptDO> deptMap = deptMapper.selectBatchIds(deptIds).stream()
    .collect(Collectors.toMap(DeptDO::getId, Function.identity()));
```

### 分页查询优化

```java
// ✅ 使用游标分页（大数据量）
public List<UserDO> selectByLastId(Long lastId, int pageSize) {
    return userMapper.selectList(new LambdaQueryWrapper<UserDO>()
        .gt(lastId != null, UserDO::getId, lastId)
        .orderByAsc(UserDO::getId)
        .last("LIMIT " + pageSize));
}

// ❌ 避免深度分页
// LIMIT 1000000, 10 性能很差
```

### 批量操作

```java
// ✅ 批量插入
@Transactional(rollbackFor = Exception.class)
public void batchInsert(List<UserDO> users) {
    // 分批处理，每批500条
    Lists.partition(users, 500).forEach(batch -> {
        userMapper.insertBatch(batch);
    });
}

// ✅ 批量更新
userMapper.update(null, new LambdaUpdateWrapper<UserDO>()
    .in(UserDO::getId, ids)
    .set(UserDO::getStatus, 0));
```

## 安全规范

### 防止SQL注入

```java
// ✅ 使用参数化查询
@Select("SELECT * FROM user WHERE username = #{username}")
UserDO selectByUsername(@Param("username") String username);

// ❌ 禁止字符串拼接
@Select("SELECT * FROM user WHERE username = '" + username + "'")
```

### 动态SQL安全

```xml
<!-- ✅ 使用if判断 -->
<select id="selectByCondition" resultType="UserDO">
    SELECT * FROM user
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
</select>

<!-- ❌ 禁止使用${} -->
SELECT * FROM user WHERE username = '${username}'
```

## 字段映射

### 自动填充

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime::now, LocalDateTime.class);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
        this.strictInsertFill(metaObject, "creator", this::getCurrentUser, String.class);
        this.strictInsertFill(metaObject, "updater", this::getCurrentUser, String.class);
        this.strictInsertFill(metaObject, "deleted", () -> false, Boolean.class);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
        this.strictUpdateFill(metaObject, "updater", this::getCurrentUser, String.class);
    }

    private String getCurrentUser() {
        return SecurityUtils.getCurrentUsername();
    }
}
```

## 关联Agent

- 03-Java开发专家.md：数据访问层开发
- 05-代码审查专家.md：Mapper代码审查
