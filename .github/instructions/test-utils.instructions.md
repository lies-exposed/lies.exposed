---
applyTo: "**/test/**/*.ts,**/test/**/*.js,**/*test*.ts,**/*Test*.ts"

---

# Test Utilities Instructions

When working with test utility files, mocks, and test helpers, follow these patterns:

## Mock Utilities

### TaskEither Mocking Patterns
```typescript
// File: test/mocks/mock.utils.ts
import { mock } from "vitest-mock-extended";
import * as TE from "fp-ts/lib/TaskEither.js";

// Mock successful TaskEither operations
export const mockTERightOnce = <T>(
  mockFn: any,
  returnValue: T | (() => T)
) => {
  mockFn.mockReturnValueOnce(
    TE.right(typeof returnValue === 'function' ? returnValue() : returnValue)
  );
};

// Mock failed TaskEither operations
export const mockTELeftOnce = <E>(
  mockFn: any,
  error: E | (() => E)
) => {
  mockFn.mockReturnValueOnce(
    TE.left(typeof error === 'function' ? error() : error)
  );
};

// Mock Option types
export const mockOptionSome = <T>(mockFn: any, value: T) => {
  mockFn.mockReturnValueOnce(fp.O.some(value));
};

export const mockOptionNone = (mockFn: any) => {
  mockFn.mockReturnValueOnce(fp.O.none);
};
```

### Context Mocking
```typescript
// File: test/context.ts
import { mock } from "vitest-mock-extended";
import type { ServerContext } from "#context/context.type.js";

export const mockedContext = <T extends Partial<ServerContext>>(
  overrides: T
): ServerContext => ({
  logger: mock(),
  db: mock(),
  redis: mock(),
  queue: mock(),
  puppeteer: mock(),
  fs: mock(),
  http: mock(),
  ...overrides,
} as ServerContext);
```

## User Test Utilities

### User Creation Helper
```typescript
// File: test/utils/user.utils.ts
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import type { ServerContext } from "#context/context.type.js";

export const saveUser = async (
  ctx: ServerContext,
  scopes: string[] = []
): Promise<UserEntity> => {
  const user = new UserEntity();
  user.username = `testuser_${Date.now()}`;
  user.email = `${user.username}@example.com`;
  user.scopes = scopes;
  
  return pipe(
    ctx.db.save(UserEntity, user),
    throwTE
  );
};

export const loginUser = (Test: AppTest) => async (
  user: UserEntity
): Promise<{ authorization: string }> => {
  const response = await Test.req
    .post("/api/v1/auth/login")
    .send({
      username: user.username,
      password: "testpassword"
    })
    .expect(200);
    
  return {
    authorization: `Bearer ${response.body.accessToken}`
  };
};
```

## Test Data Factories

### Entity Factories
```typescript
// File: test/factories/entity.factories.ts
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { SCIENTIFIC_STUDY } from "@liexp/io/lib/http/Events/EventType.js";
import fc from "fast-check";

export const createTestEvent = async (
  ctx: ServerContext,
  overrides: Partial<EventV2Entity> = {}
): Promise<EventV2Entity> => {
  const event = new EventV2Entity();
  event.type = SCIENTIFIC_STUDY.literals[0];
  event.date = new Date();
  event.payload = {
    title: fc.sample(fc.string({ minLength: 10 }), 1)[0],
    url: "https://example.com/test",
    ...overrides.payload
  };
  
  Object.assign(event, overrides);
  
  return pipe(
    ctx.db.save(EventV2Entity, event),
    throwTE
  );
};

export const createTestActor = async (
  ctx: ServerContext,
  overrides: Partial<ActorEntity> = {}
): Promise<ActorEntity> => {
  const actor = new ActorEntity();
  actor.fullName = fc.sample(fc.string({ minLength: 5 }), 1)[0];
  actor.username = actor.fullName.toLowerCase().replace(/\s+/g, '_');
  
  Object.assign(actor, overrides);
  
  return pipe(
    ctx.db.save(ActorEntity, actor),
    throwTE
  );
};
```

## Database Test Utilities

### Transaction Helpers
```typescript
// File: test/utils/db.utils.ts
import type { ServerContext } from "#context/context.type.js";

export const withTransaction = async <T>(
  ctx: ServerContext,
  callback: (ctx: ServerContext) => Promise<T>
): Promise<T> => {
  const queryRunner = ctx.db.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const transactionalCtx = {
      ...ctx,
      db: {
        ...ctx.db,
        manager: queryRunner.manager
      }
    };
    
    const result = await callback(transactionalCtx);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const cleanupTestData = async (
  ctx: ServerContext,
  entityType: any,
  filter: any
): Promise<void> => {
  await pipe(
    ctx.db.delete(entityType, filter),
    throwTE
  );
};
```

## Assertion Helpers

### Custom Matchers
```typescript
// File: test/utils/matchers.ts
export const expectEventStructure = (event: any) => {
  expect(event).toMatchObject({
    id: expect.any(String),
    type: expect.any(String),
    date: expect.any(Date),
    payload: expect.any(Object),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date)
  });
};

export const expectActorStructure = (actor: any) => {
  expect(actor).toMatchObject({
    id: expect.any(String),
    fullName: expect.any(String),
    username: expect.stringMatching(/^[a-z0-9_]+$/),
    createdAt: expect.any(Date)
  });
};

export const expectValidationError = (response: any, field?: string) => {
  expect(response.body).toHaveProperty("error");
  expect(response.body.error).toContain("validation");
  
  if (field) {
    expect(response.body.error).toContain(field);
  }
};
```

## Critical Requirements for Test Utils

### ✅ ALWAYS DO
- Use `vitest-mock-extended` for mocking
- Create reusable factory functions for entities
- Use arbitraries for generating test data
- Provide proper TypeScript types for all utilities
- Use `throwTE` for TaskEither operations in utilities
- Make utilities async when dealing with database operations
- Clean up test data after tests (handled by AppTest)

### ❌ NEVER DO
- Use global mocks that affect other tests ❌
- Create utilities without proper error handling ❌
- Use hardcoded test data in utilities ❌
- Mix test utilities with production code ❌
- Create utilities that have side effects ❌

### Performance Considerations
```typescript
// Cache expensive operations
const memoizedFactory = (() => {
  let cached: any;
  return async (ctx: ServerContext) => {
    if (!cached) {
      cached = await expensiveOperation(ctx);
    }
    return cached;
  };
})();

// Batch operations when possible
export const createMultipleEntities = async <T>(
  ctx: ServerContext,
  entityType: any,
  count: number,
  factory: () => T
): Promise<T[]> => {
  const entities = Array.from({ length: count }, factory);
  
  return pipe(
    ctx.db.save(entityType, entities),
    throwTE
  );
};
```