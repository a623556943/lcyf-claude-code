---
name: tdd-workflow
description: 在编写新功能、修复 bug 或重构代码时使用此 skill。强制执行测试驱动开发，覆盖率要求 80% 以上，包括单元测试、集成测试和 E2E 测试。
---

# TDD 工作流技能

## 概述

提供 Java/Spring Boot 项目的测试驱动开发工作流、测试模板和覆盖率管理。

## TDD 工作流程

```
需求分析
    │
    ▼
┌─────────────────┐
│ 1. 编写测试     │ ← 红灯：测试应该失败
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. 运行测试     │ ← 确认失败
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. 编写代码     │ ← 最小实现
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. 运行测试     │ ← 绿灯：测试应该通过
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. 重构代码     │ ← 优化但不改变行为
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. 验证覆盖率   │ ← 确保≥80%
└─────────────────┘
```

## 测试模板

### Service 单元测试模板

```java
package com.lcyf.cloud.{{moduleName}}.biz.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("{{EntityName}}Service 测试")
class {{EntityName}}ServiceTest {

    @Mock
    private {{EntityName}}Gateway {{entityName}}Gateway;

    @InjectMocks
    private {{EntityName}}ServiceImpl {{entityName}}Service;

    @Nested
    @DisplayName("get 方法")
    class GetTest {

        @Test
        @DisplayName("当记录存在时，应返回对应的DTO")
        void shouldReturnDto_whenRecordExists() {
            // Given
            Long id = 1L;
            {{EntityName}}Dto expected = new {{EntityName}}Dto();
            expected.setId(id);
            when({{entityName}}Gateway.selectById(id)).thenReturn(expected);

            // When
            {{EntityName}}Dto result = {{entityName}}Service.get(id);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(id);
            verify({{entityName}}Gateway).selectById(id);
        }
    }

    @Nested
    @DisplayName("create 方法")
    class CreateTest {

        @Test
        @DisplayName("应成功创建并返回ID")
        void shouldCreateAndReturnId() {
            // Given
            {{EntityName}}AddCmd cmd = new {{EntityName}}AddCmd();
            when({{entityName}}Gateway.save(cmd)).thenReturn(1L);

            // When
            Long result = {{entityName}}Service.create(cmd);

            // Then
            assertThat(result).isEqualTo(1L);
            verify({{entityName}}Gateway).save(cmd);
        }
    }
}
```

### Controller 集成测试模板

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class {{EntityName}}ControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void add_shouldReturnSuccess() throws Exception {
        String requestBody = """
            {
                // TODO: 填写字段
            }
            """;

        mockMvc.perform(post("/api/v1/{{moduleName}}/auth/{{urlPath}}/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void page_shouldReturnPageResult() throws Exception {
        mockMvc.perform(get("/api/v1/{{moduleName}}/auth/{{urlPath}}/page"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").exists());
    }
}
```

## 覆盖率要求

| 类型 | 最低覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| 行覆盖率 | 80% | 90% |
| 分支覆盖率 | 70% | 85% |
| 方法覆盖率 | 85% | 95% |

### 豁免说明

以下代码可以豁免覆盖率要求：
- DO 实体类（Lombok 生成的 getter/setter）
- 配置类
- 启动类

### 运行覆盖率检查

```bash
# JaCoCo 覆盖率报告
mvn test jacoco:report

# 查看报告
# target/site/jacoco/index.html
```

## 测试命名规范

```
方法名_should期望行为_when条件

示例:
- getById_shouldReturnUser_whenUserExists
- create_shouldThrowException_whenNameDuplicate
- delete_shouldRemoveRecord_whenIdValid
```

## 测试最佳实践

1. **Given-When-Then** 结构：每个测试分三段
2. **单一断言原则**：每个测试验证一个行为
3. **测试隔离**：使用 `@Mock` 隔离外部依赖
4. **边界条件**：测试 null、空值、边界值
5. **异常测试**：验证异常类型和消息

## 关联Agent

- tdd-guide

## 关联命令

- `/lcyf-tdd` - TDD 开发流程
- `/lcyf-verify` - 验证（测试阶段）
