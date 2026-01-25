---
applyTo: "**/*.e2e.ts,**/test/**/*.e2e.ts"
---

# E2E Test Instructions

> **Full documentation**: [docs/testing/e2e-tests.md](../../docs/testing/e2e-tests.md)

## Quick Reference (LLM Action Block)

### Required Setup
```typescript
import { GetAppTest } from "#test/AppTest.js";
import { saveUser, loginUser } from "#test/utils/user.utils.js";
import { describe, beforeAll, it, expect } from "vitest";
import fc from "fast-check";
import { MediaArb, ActorArb } from "@liexp/test";

describe("Endpoint Tests", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });
});
```

### Authentication Pattern
```typescript
it("should work with auth", async () => {
  const user = await saveUser(Test.ctx, ["resource:read", "resource:write"]);
  const { authorization } = await loginUser(Test)(user);

  const response = await Test.req
    .get("/api/v1/resource")
    .set("Authorization", authorization)
    .expect(200);

  expect(response.body).toHaveProperty("data");
});
```

### CRUD Templates

**CREATE**:
```typescript
const [data] = fc.sample(ResourceArb(), 1);
await Test.req.post("/api/v1/resources")
  .set("Authorization", authorization)
  .send(data)
  .expect(201);
```

**READ**:
```typescript
await Test.req.get(`/api/v1/resources/${id}`)
  .set("Authorization", authorization)
  .expect(200);
```

**UPDATE**:
```typescript
await Test.req.put(`/api/v1/resources/${id}`)
  .set("Authorization", authorization)
  .send({ name: "Updated" })
  .expect(200);
```

**DELETE**:
```typescript
await Test.req.delete(`/api/v1/resources/${id}`)
  .set("Authorization", authorization)
  .expect(204);
```

### Critical Rules

**ALWAYS**:
- Use `GetAppTest()` for setup
- Use `saveUser(ctx, scopes)` + `loginUser(Test)(user)`
- Test specific status codes: `.expect(200)`, `.expect(404)`
- Use arbitraries for test data

**NEVER**:
- Use negative assertions: `expect(status).not.toBe(500)` ❌
- Skip authentication testing
- Use hardcoded user data
- Mock HTTP layer in E2E tests

### Permission Testing
```typescript
// User WITHOUT permission
const readUser = await saveUser(Test.ctx, ["resource:read"]);
const { authorization: readAuth } = await loginUser(Test)(readUser);
await Test.req.post("/api/v1/resources")
  .set("Authorization", readAuth)
  .send(data)
  .expect(403);  // Forbidden

// User WITH permission
const writeUser = await saveUser(Test.ctx, ["resource:create"]);
const { authorization: writeAuth } = await loginUser(Test)(writeUser);
await Test.req.post("/api/v1/resources")
  .set("Authorization", writeAuth)
  .send(data)
  .expect(201);  // Created
```
