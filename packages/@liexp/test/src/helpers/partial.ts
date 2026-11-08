import { type Simplify } from "effect/Schema";

/**
 * Creates a partial object of type `T` with all properties set to `undefined`.
 * Useful as a base for building up partial test fixtures.
 *
 * @example
 * ```ts
 * const user = partial<User>();
 * // { id: undefined, name: undefined, email: undefined }
 * ```
 */
export const partial = <T>(): Simplify<Partial<T>> & Record<keyof T, undefined> =>
  new Proxy({} as Partial<T>, {
    get: (_target, prop) => undefined,
    has: (_target, _prop) => true,
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => ({
      enumerable: true,
      configurable: true,
    }),
  }) as Simplify<Partial<T>> & Record<keyof T, undefined>;
