# lcyf-db-review Command

Database design review for lcyf projects.

## Command
`/lcyf-db-review [table_name]`

## Description
Reviews database design for:
- Table structure optimization
- Index strategies
- Query performance
- Transaction management

## Usage
```
/lcyf-db-review              # Review all database changes
/lcyf-db-review sys_user     # Review specific table
```

## Implementation
Invoke the `db-optimizer` agent for comprehensive database review.

## Output
Review report with performance grade and optimization recommendations.
