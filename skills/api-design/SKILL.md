# API Design Skill

---
name: api-design
description: lcyf 项目的 RESTful API 设计模式和文档标准
version: 1.0.0
---

## Overview

RESTful API design guidance including:
- RESTful principles and conventions
- Unified response structure
- OpenAPI/Swagger documentation
- Versioning strategies

## Core Patterns

### 1. RESTful URL Design
```
GET    /api/v1/users              # List users
POST   /api/v1/users              # Create user
GET    /api/v1/users/{id}         # Get user
PUT    /api/v1/users/{id}         # Replace user
PATCH  /api/v1/users/{id}         # Update user
DELETE /api/v1/users/{id}         # Delete user
```

### 2. Unified Response Structure
```java
public class Result<T> {
    private Boolean success;
    private T data;
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
}

// Success response
Result.ok(data);

// Error response
Result.error("USER_NOT_FOUND", "User not found");
```

### 3. Input Validation
```java
public class CreateUserDTO {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Email
    private String email;
}

@PostMapping
public Result create(@Valid @RequestBody CreateUserDTO dto) {
    // Implementation
}
```

### 4. OpenAPI Documentation
```java
@Operation(summary = "Create user")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "User created"),
    @ApiResponse(responseCode = "400", description = "Invalid input")
})
@PostMapping
public Result<UserVO> createUser(@Valid @RequestBody CreateUserDTO dto) {
    // Implementation
}
```

## Related Resources
- api-designer agent
- api-design-rules
- OpenAPI specification
