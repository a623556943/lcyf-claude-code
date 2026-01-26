# Spring Boot Best Practices

Always-follow guidelines for Spring Boot development.

## Dependency Injection

✅ Constructor injection:
```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

❌ Field injection:
```java
@Autowired
private UserMapper userMapper;
```

## Transaction Management

- Use @Transactional on service methods, NOT controllers
- Always specify `rollbackFor = Exception.class`
- Use appropriate propagation levels
- Keep transactions short

## Exception Handling

- Global @ControllerAdvice for exception handling
- Custom business exceptions extend RuntimeException
- Return appropriate HTTP status codes
- Never expose stack traces to clients

## Configuration

- Use @ConfigurationProperties for typed configuration
- Externalize configuration to application.yml
- Use profiles for different environments
- Never hardcode credentials

## REST Controllers

- Use @RestController, not @Controller + @ResponseBody
- Use @PathVariable for resource IDs
- Use @RequestParam for query parameters
- Use @Valid for request body validation

---

遵循 Spring Boot 最佳实践以确保代码质量。
