# Module Design Skill

---
name: module-design
description: lcyf 项目的多模块依赖管理和接口设计
version: 1.0.0
---

## Overview

Multi-module architecture guidance:
- Dependency management strategies
- Interface design and contracts
- Breaking change detection
- Version compatibility

## Core Principles

### 1. Module Structure
```
lcyf-framework           # Base framework
├── lcyf-module-base     # Shared DTOs and interfaces
├── lcyf-module-finance  # Finance domain
├── lcyf-module-policy   # Policy domain
└── lcyf-module-sales    # Sales domain
```

### 2. Dependency Rules
- No circular dependencies
- Depend on interfaces, not implementations
- Shared interfaces in `lcyf-module-base`
- Version management in parent POM

### 3. Interface Contract
```java
/**
 * Policy service interface.
 * @since 1.0.0
 * @version 1.0.0
 */
public interface PolicyService {
    Policy getPolicy(Long policyId);
}
```

### 4. Breaking Change Detection
- Major version bump for breaking changes
- Deprecate before removing
- Provide migration guide
- Notify dependent modules

## Related Resources
- module-coordinator agent
- Maven dependency plugin
- Module architecture guidelines
