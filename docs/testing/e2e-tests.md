# E2E Tests

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

```typescript
import { GetAppTest } from "#test/AppTest.js";
import { saveUser, loginUser } from "#test/utils/user.utils.js";
import fc from "fast-check";

let Test: AppTest;
beforeAll(async () => { Test = await GetAppTest(); });

it("should work", async () => {
  const user = await saveUser(Test.ctx, ["resource:read"]);
  const { authorization } = await loginUser(Test)(user);
  const [data] = fc.sample(ResourceArb(), 1);

  await Test.req
    .post("/api/v1/resources")
    .set("Authorization", authorization)
    .send(data)
    .expect(201);  // ✅ Specific status code
});
```

**Critical**: Use `GetAppTest()`, `saveUser`, `loginUser`. Test specific status codes. Never use negative assertions.

</details>

---

Patterns and best practices for end-to-end API testing.

## Required Setup

### AppTest Pattern

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

### AppTest Object

The `GetAppTest()` function returns an `AppTest` object with:
- `ctx`: ServerContext (DB, mocked providers, config)
- `mocks`: dependency mocks (axios, puppeteer, s3, redis, queue, etc.)
- `req`: supertest agent bound to `makeApp(ctx)` for issuing HTTP requests

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
```

## Permission Testing

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

## Critical Requirements

### Always Do

- Use `GetAppTest()` for all E2E test setup
- Create users with specific scopes using `saveUser`
- Use `loginUser` for authentication headers
- Test both authenticated and unauthenticated requests
- Use arbitraries for generating test data
- Test specific HTTP status codes: `expect(200)`, `expect(404)`
- Test response body structure with `toMatchObject`
- Clean up test data (automatic with AppTest)

### Never Do

- Skip authentication testing
- Use hardcoded user data
- Test negative status codes: `expect(status).not.toBe(500)`
- Mock the HTTP layer in E2E tests
- Test implementation details instead of API behavior

## Test Infrastructure

API e2e tests run against **PGlite** — an in-memory PostgreSQL WASM instance. No Docker or external database is required.

### Isolation model

Test isolation uses transaction rollback, not table truncation:

| Hook | Runs inside transaction? | Data persists after file? |
|------|--------------------------|---------------------------|
| `beforeAll` | No | Yes — committed to the worker's PGlite instance |
| `beforeEach` | Starts one | — |
| `afterEach` | Rolls it back | No |

**Rule of thumb**: data you save in `beforeAll` (e.g. a fixture avatar) is visible to all tests in the file. Data created inside a test is rolled back automatically after `afterEach` (~1-5 ms).

### PGlite gotchas

- **`varchar` columns require a string.** Passing `[]` (an array) for a `varchar` column (`StoryEntity.body`) fails with "Invalid input for string type". Use `""` or `null` instead.
- **`Color` schema requires exactly 6 hex chars, no `#`.** Use `generateRandomColor()` from `@liexp/shared/lib/utils/colors.js` — never inline `#${Math.random()...}`.
- **`unaccent` extension** is loaded automatically by `pglite-datasource.ts`; no migration needed in tests.

## Running API E2E Tests

```bash
# From repo root - runs only api tests
pnpm --filter services/api test

# Or from inside services/api
pnpm test
```

Keep tests small and focused to avoid flakiness. Start with smoke tests (healthcheck, simple CRUD) and reuse existing mocks in `AppTest` for deterministic runs.
