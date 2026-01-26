# lcyf-module-check Command

Module dependency and interface contract validation.

## Command
`/lcyf-module-check [module_name]`

## Description
Checks module health for:
- Circular dependencies
- Dependency version conflicts
- Interface contract compliance
- Breaking changes

## Usage
```
/lcyf-module-check                      # Check all modules
/lcyf-module-check lcyf-module-finance  # Check specific module
```

## Implementation
Invoke the `module-coordinator` agent for multi-module analysis.

## Output
Module health report with dependency graph and recommendations.
