# API Design Rules

Always-follow guidelines for API design in lcyf projects.

## RESTful Principles

- Use nouns for resources, not verbs
- Use plural nouns: `/users`, `/orders`
- Use HTTP methods correctly:
  - GET: Retrieve
  - POST: Create
  - PUT: Replace
  - PATCH: Update
  - DELETE: Remove

## URL Structure

✅ Good:
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

❌ Bad:
```
GET /api/v1/getAllUsers
POST /api/v1/createUser
POST /api/v1/deleteUser/{id}
```

## Response Structure

Always use unified Result wrapper:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## Status Codes

- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Input Validation

- Use Bean Validation annotations
- Validate all public endpoints
- Return clear error messages

## Versioning

- Always version APIs: `/api/v1/...`
- Use major version in URL
- Document breaking changes

## Documentation

- Use OpenAPI/Swagger annotations
- Document all endpoints
- Provide request/response examples
- Document error responses

---

遵循 RESTful API 设计规范。
