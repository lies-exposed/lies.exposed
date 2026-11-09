/**
 * Types a partial context object as the full context type `T`.
 * Replaces `ctx as unknown as FullContext` with a type-safe helper.
 *
 * @example
 * ```ts
 * import { ctx } from "@liexp/test";
 *
 * // ctx is MockedContext<MyContext> & LoggerContext & ConfigContext & ENVContext
 * const result = await pipe(myFlow(input), (rte) =>
 *   rte(ctx<ServerContext>(ctx)),
 * )();
 * ```
 */
export const ctx = <T>(obj: unknown): T => obj as T;
