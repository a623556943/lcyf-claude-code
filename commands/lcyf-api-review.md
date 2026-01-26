# lcyf-api-review Command

API design review for lcyf projects.

## Command
`/lcyf-api-review [controller_path]`

## Description
Reviews API design for:
- RESTful principles
- Request/Response validation
- Documentation completeness
- Status code correctness

## Usage
```
/lcyf-api-review                      # Review all controllers
/lcyf-api-review UserController.java  # Review specific controller
```

## Implementation
Invoke the `api-designer` agent for API design review.

## Output
Review report with API design quality assessment.
