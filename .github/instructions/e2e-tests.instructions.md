---
applyTo: "**/*.e2e.ts,**/test/**/*.ts"
---

# E2E Test Instructions

When working with end-to-end test files, follow these specific patterns for the lies.exposed API testing:

## Required Setup

### AppTest Pattern (CRITICAL)
```typescript
import { GetAppTest } from "#test/AppTest.js";
import { saveUser, loginUser } from "#test/utils/user.utils.js";
import { describe, beforeAll, it, expect } from "vitest";
import { MediaArb, ProjectArb } from "@liexp/test";
import fc from "fast-check";

describe("API Endpoint Tests", () => {
  let Test: AppTest;
  
  beforeAll(async () => {
    Test = await GetAppTest();
  });
  
  // Test implementation here
});
```

### Authentication Pattern
```typescript
it("should require authentication for protected endpoints", async () => {
  // Test without authentication
  await Test.req
    .get("/api/v1/protected-endpoint")
    .expect(401);
});

it("should allow access with proper authentication", async () => {
  // Create user with specific scopes
  const user = await saveUser(Test.ctx, ["admin:read", "admin:write"]);
  
  // Login and get authorization header
  const { authorization } = await loginUser(Test)(user);
  
  // Make authenticated request
  const response = await Test.req
    .get("/api/v1/protected-endpoint")
    .set("Authorization", authorization)
    .expect(200);
    
  expect(response.body).toHaveProperty("data");
});
```

## CRUD Operation Patterns

### CREATE Operations
```typescript
it("should create new resource", async () => {
  const user = await saveUser(Test.ctx, ["resource:create"]);
  const { authorization } = await loginUser(Test)(user);
  
  // Generate test data with arbitraries
  const [testData] = fc.sample(ResourceArb(), 1);
  
  const response = await Test.req
    .post("/api/v1/resources")
    .set("Authorization", authorization)
    .send(testData)
    .expect(201);
    
  // Test specific expected structure
  expect(response.body).toMatchObject({
    id: expect.any(String),
    ...testData,
    createdAt: expect.any(String)
  });
});
```

### READ Operations
```typescript
it("should retrieve resource by ID", async () => {
  const user = await saveUser(Test.ctx, ["resource:read"]);
  const { authorization } = await loginUser(Test)(user);
  
  // Create test resource first
  const testResource = await createTestResource(Test.ctx);
  
  const response = await Test.req
    .get(`/api/v1/resources/${testResource.id}`)
    .set("Authorization", authorization)
    .expect(200);
    
  expect(response.body.id).toBe(testResource.id);
});

it("should return 404 for non-existent resource", async () => {
  const user = await saveUser(Test.ctx, ["resource:read"]);
  const { authorization } = await loginUser(Test)(user);
  
  await Test.req
    .get("/api/v1/resources/non-existent-id")
    .set("Authorization", authorization)
    .expect(404);
});
```

### UPDATE Operations
```typescript
it("should update existing resource", async () => {
  const user = await saveUser(Test.ctx, ["resource:update"]);
  const { authorization } = await loginUser(Test)(user);
  
  // Create test resource
  const testResource = await createTestResource(Test.ctx);
  const updateData = { name: "Updated Name" };
  
  const response = await Test.req
    .put(`/api/v1/resources/${testResource.id}`)
    .set("Authorization", authorization)
    .send(updateData)
    .expect(200);
    
  expect(response.body.name).toBe("Updated Name");
  expect(response.body.id).toBe(testResource.id);
});
```

### DELETE Operations
```typescript
it("should delete resource", async () => {
  const user = await saveUser(Test.ctx, ["resource:delete"]);
  const { authorization } = await loginUser(Test)(user);
  
  const testResource = await createTestResource(Test.ctx);
  
  await Test.req
    .delete(`/api/v1/resources/${testResource.id}`)
    .set("Authorization", authorization)
    .expect(204);
    
  // Verify resource is deleted
  await Test.req
    .get(`/api/v1/resources/${testResource.id}`)
    .set("Authorization", authorization)
    .expect(404);
});
```

## Validation Testing

### Input Validation
```typescript
it("should validate required fields", async () => {
  const user = await saveUser(Test.ctx, ["resource:create"]);
  const { authorization } = await loginUser(Test)(user);
  
  const invalidData = { /* missing required fields */ };
  
  const response = await Test.req
    .post("/api/v1/resources")
    .set("Authorization", authorization)
    .send(invalidData)
    .expect(400);
    
  expect(response.body.error).toContain("required");
});

it("should validate field formats", async () => {
  const user = await saveUser(Test.ctx, ["resource:create"]);
  const { authorization } = await loginUser(Test)(user);
  
  const invalidData = { 
    email: "invalid-email",
    date: "invalid-date"
  };
  
  await Test.req
    .post("/api/v1/resources")
    .set("Authorization", authorization)
    .send(invalidData)
    .expect(400);
});
```

## Critical Requirements

### ✅ ALWAYS DO
- Use `GetAppTest()` for all E2E test setup
- Create users with specific scopes using `saveUser`
- Use `loginUser` for authentication headers
- Test both authenticated and unauthenticated requests
- Use arbitraries for generating test data
- Test specific HTTP status codes: `expect(200)`, `expect(404)`
- Test response body structure with `toMatchObject`
- Clean up test data (automatic with AppTest)

### ❌ NEVER DO
- Skip authentication testing ❌
- Use hardcoded user data ❌
- Test negative status codes: `expect(status).not.toBe(500)` ❌
- Mock the HTTP layer in E2E tests ❌
- Test implementation details instead of API behavior ❌

### Permission Testing
```typescript
it("should enforce permission requirements", async () => {
  // User with insufficient permissions
  const readOnlyUser = await saveUser(Test.ctx, ["resource:read"]);
  const { authorization: readAuth } = await loginUser(Test)(readOnlyUser);
  
  // Try to perform write operation
  await Test.req
    .post("/api/v1/resources")
    .set("Authorization", readAuth)
    .send(testData)
    .expect(403); // Forbidden
    
  // User with correct permissions
  const writeUser = await saveUser(Test.ctx, ["resource:create"]);
  const { authorization: writeAuth } = await loginUser(Test)(writeUser);
  
  // Should succeed
  await Test.req
    .post("/api/v1/resources")
    .set("Authorization", writeAuth)
    .send(testData)
    .expect(201);
});
```

### Error Handling
```typescript
it("should handle server errors gracefully", async () => {
  const user = await saveUser(Test.ctx, ["resource:read"]);
  const { authorization } = await loginUser(Test)(user);
  
  // Test with data that causes server error
  const response = await Test.req
    .post("/api/v1/resources")
    .set("Authorization", authorization)
    .send(problematicData)
    .expect(500);
    
  expect(response.body).toHaveProperty("error");
  expect(typeof response.body.error).toBe("string");
});
```