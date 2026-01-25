---
applyTo: "**/*.spec.ts,**/*.test.ts"
---

# Unit Test Instructions

> **Full documentation**: [docs/testing/unit-tests.md](../../docs/testing/unit-tests.md)

## Quick Reference (LLM Action Block)

### Required Imports
```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { describe, it, expect, beforeAll } from "vitest";
import { mock } from "vitest-mock-extended";
import fc from "fast-check";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce, mockTELeftOnce } from "../../test/mocks/mock.utils.js";
```

### Test Structure Template
```typescript
describe("FunctionName", () => {
  const mockCtx = mockedContext({ db: mock(), logger: mock() });

  it("should expected_behavior", async () => {
    // Arrange
    const [testData] = fc.sample(SomeArb(), 1);
    mockTERightOnce(mockCtx.db.findOne, () => expectedEntity);

    // Act
    const result = await pipe(
      functionUnderTest(testData)(mockCtx),
      throwTE  // CRITICAL: Always use throwTE
    );

    // Assert
    expect(result).toMatchObject(expected);
  });
});
```

### Critical Rules

**ALWAYS**:
- Use `throwTE` to convert TaskEither to Promise
- Use `fc.sample(Arb, 1)[0]` for test data
- Use `mockTERightOnce` / `mockTELeftOnce` for mocks
- Test specific values: `expect(x).toBe(200)`

**NEVER**:
- Use negative assertions: `expect(x).not.toBe(null)` ❌
- Use hardcoded test data
- Use Jest mocking (use vitest-mock-extended)
- Test TaskEither without `throwTE`

### Error Testing
```typescript
it("should handle errors", async () => {
  mockTELeftOnce(mockCtx.db.find, () => new Error("DB error"));

  await expect(pipe(
    functionUnderTest(data)(mockCtx),
    throwTE
  )).rejects.toThrow("DB error");
});
```

### Property-Based Testing
```typescript
fc.assert(fc.property(
  fc.string({ minLength: 1 }),
  fc.nat({ max: 100 }),
  async (str, num) => {
    const result = await pipe(fn({ str, num })(ctx), throwTE);
    expect(result).toBeDefined();
  }
));
```
