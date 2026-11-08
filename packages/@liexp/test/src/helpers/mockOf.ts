import { type Simplify } from "effect/Schema";

/**
 * Creates a mock object of type `T` where every property access returns
 * a no-op function (for method-like properties) or `undefined` (for data
 * properties). Useful as a base for building up mock fixtures without
 * needing `vitest-mock-extended`.
 *
 * @example
 * ```ts
 * const client = mockOf<Client>();
 * // client.fetch() returns undefined, client.config is undefined
 * ```
 */
export const mockOf = <T>(): Simplify<T> =>
  new Proxy({} as Simplify<T>, {
    get: (_target, prop) => {
      if (prop === Symbol.toStringTag) return "MockObject";
      // Return a no-op function for any property access
      const fn = () => undefined;
      return fn;
    },
    has: (_target, _prop) => true,
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => ({
      enumerable: true,
      configurable: true,
    }),
  });
