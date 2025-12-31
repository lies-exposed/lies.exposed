---
applyTo: "**/*.spec.ts,**/*.test.ts"
---

# Unit Test Instructions

When working with unit test files (`.spec.ts`, `.test.ts`), follow these specific patterns:

## Required Patterns

### Import Structure
```typescript
// Core fp-ts imports
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";

// Testing framework
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mock } from "vitest-mock-extended";
import fc from "fast-check";

// Test utilities
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";

// Arbitraries for test data
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
```

### Test Structure
```typescript
describe("FunctionOrFlowName", () => {
  const mockCtx = mockedContext({
    db: mock(),
    logger: mock(),
    // other dependencies
  });

  describe("when specific_condition", () => {
    it("should expected_behavior", async () => {
      // Arrange: Set up test data using arbitraries
      const [testData] = fc.sample(HumanReadableStringArb(), 1);
      
      // Mock dependencies
      mockTERightOnce(mockCtx.db.findOneOrFail, () => expectedEntity);
      
      // Act: Execute the function under test
      const result = await pipe(
        functionUnderTest(testData)(mockCtx),
        throwTE // CRITICAL: Convert TaskEither to Promise
      );
      
      // Assert: Test specific expected outcomes
      expect(result).toMatchObject(expectedResult);
      expect(mockCtx.db.findOneOrFail).toHaveBeenCalledWith(/* expected args */);
    });
  });
});
```

## Critical Requirements

### ✅ ALWAYS DO
- Use `throwTE` to convert `TaskEither` to `Promise` for testing
- Use property-based testing with fast-check and arbitraries
- Mock external dependencies with `mockTERightOnce`
- Test specific expected values: `expect(status).toBe(200)`
- Use `mockedContext` for creating test contexts
- Generate test data with arbitraries from `@liexp/test`

### ❌ NEVER DO
- Test negative assertions: `expect(result).not.toBe(null)` ❌
- Use hardcoded test data without arbitraries ❌
- Test TaskEither directly without `throwTE` ❌
- Mock implementation details instead of behavior ❌
- Use `jest` mocking (use `vitest-mock-extended` instead) ❌

### Error Handling Tests
```typescript
it("should handle errors correctly", async () => {
  // Mock error condition
  mockTERightOnce(mockCtx.db.findOneOrFail, () => { 
    throw new Error("Database error"); 
  });
  
  // Test error path
  await expect(pipe(
    functionUnderTest(testData)(mockCtx),
    throwTE
  )).rejects.toThrow("Database error");
});
```

### Mock Patterns
```typescript
// Mock with return value inspection
let savedEntity: any;
mockTERightOnce(mockCtx.db.save, (_, entity) => {
  savedEntity = entity[0];
  return entity;
});

// Mock Option types
mockTERightOnce(mockCtx.service.findOptional, () => fp.O.some(mockData));
mockTERightOnce(mockCtx.service.findOptional, () => fp.O.none);

// Mock complex operations
mockTERightOnce(mockCtx.puppeteer.execute, () => 
  fp.O.some({
    type: "SCIENTIFIC_STUDY",
    payload: { title: testTitle, url: testUrl }
  })
);
```

### Property-Based Testing
```typescript
it("should handle all valid inputs correctly", () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.nat({ max: 1000 }),
    async (testString, testNumber) => {
      const result = await pipe(
        functionUnderTest({ text: testString, count: testNumber })(mockCtx),
        throwTE
      );
      
      expect(result).toBeDefined();
      expect(typeof result.id).toBe("string");
    }
  ));
});
```