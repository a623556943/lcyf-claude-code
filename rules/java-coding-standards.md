# Java Coding Standards

Always-follow guidelines for Java development in lcyf projects.

## Naming Conventions

- Classes: PascalCase (`UserService`, `OrderController`)
- Methods/Variables: camelCase (`getUserById`, `totalAmount`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE`)
- Package names: lowercase (`com.lcyf.module.finance`)

## Class Structure

- Fields first (private, then protected)
- Constructors second
- Public methods third
- Private methods last

## Code Style

- Line length: Max 120 characters
- Indentation: 4 spaces
- Braces: Always use, even for single-line blocks
- No unused imports

## Best Practices

- Use constructor injection, not field injection
- Make fields final whenever possible
- Avoid public fields
- One class per file
- Use @Override annotation

## Comments

- Javadoc for public methods
- Comments explain "why", not "what"
- No commented-out code

##禁止

- No System.out.println (use SLF4J logger)
- No hardcoded values (use constants or properties)
- No raw types (use generics)
- No null checks on @NotNull parameters

---

遵循这些规范以保持代码一致性。
