# lcyf-review Command

Java code review for lcyf projects.

## Command

`/lcyf-review [file_path]`

## Description

Reviews Java code for:

- Spring Boot best practices
- Transaction management
- Exception handling
- Security issues
- Performance problems

## Usage

```
/lcyf-review                    # Review all changed files
/lcyf-review src/main/java/...  # Review specific file
```

## Implementation

Invoke the `java-reviewer` agent to perform comprehensive code review.

## Output

Review report with:

- Critical issues
- High priority issues
- Recommendations
- Overall assessment (Approved/Warning/Block)
