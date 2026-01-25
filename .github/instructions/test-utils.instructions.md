---
applyTo: "**/test/**/*.ts,**/*test*.ts,**/*Test*.ts,**/*mock*.ts,**/*Mock*.ts"
---

# Test Utilities Instructions

> **Full documentation**: [docs/testing/test-utils.md](../../docs/testing/test-utils.md)

## Quick Reference (LLM Action Block)

### TaskEither Mocking
```typescript
import { mock } from "vitest-mock-extended";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fp } from "@liexp/core/lib/fp/index.js";

// Success mock
export const mockTERightOnce = <T>(mockFn: any, value: T | (() => T)) => {
  mockFn.mockReturnValueOnce(
    TE.right(typeof value === 'function' ? value() : value)
  );
};

// Error mock
export const mockTELeftOnce = <E>(mockFn: any, error: E | (() => E)) => {
  mockFn.mockReturnValueOnce(
    TE.left(typeof error === 'function' ? error() : error)
  );
};

// Option mocks
export const mockOptionSome = <T>(mockFn: any, value: T) => {
  mockFn.mockReturnValueOnce(fp.O.some(value));
};

export const mockOptionNone = (mockFn: any) => {
  mockFn.mockReturnValueOnce(fp.O.none);
};
```

### Context Mocking
```typescript
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

### User Helpers
```typescript
// Create test user
const user = await saveUser(Test.ctx, ["scope:read", "scope:write"]);

// Login and get auth header
const { authorization } = await loginUser(Test)(user);
```

### Entity Factories
```typescript
import fc from "fast-check";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

export const createTestEntity = async (
  ctx: ServerContext,
  overrides: Partial<Entity> = {}
): Promise<Entity> => {
  const entity = new Entity();
  entity.name = fc.sample(fc.string({ minLength: 5 }), 1)[0];
  Object.assign(entity, overrides);

  return pipe(ctx.db.save(Entity, entity), throwTE);
};
```

### Critical Rules

**ALWAYS**:
- Use `vitest-mock-extended` for mocking
- Use `throwTE` in async utilities
- Provide TypeScript types for utilities
- Use arbitraries for generated data

**NEVER**:
- Create global mocks affecting other tests
- Use hardcoded data in utilities
- Mix test utilities with production code
- Create utilities with hidden side effects
