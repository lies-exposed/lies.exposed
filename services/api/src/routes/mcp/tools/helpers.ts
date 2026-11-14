import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import type * as z from "zod/v3";

/**
 * A typed helper for defining MCP tools with Effect schema validation.
 *
 * Converts an Effect schema to both a Zod struct (for MCP inputSchema)
 * and uses `Schema.decodeUnknownSync` to decode the raw opts argument,
 * eliminating the need for `any` casts on the handler's input.
 *
 * Usage:
 *   const tool = defineMcpTool(
 *     Schema.Struct({ id: Schema.String, name: Schema.String }),
 *     async (input) => { /* input is fully typed *\/ }
 *   );
 *   server.registerTool('myTool', { inputSchema: tool.inputSchema }, tool.handler);
 */
export const defineMcpTool = <A extends Schema.Struct.Fields>(
  effectSchema: Schema.Struct<A>,
  handler: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
  ) => Promise<{ content: { text: string; type: "text" }[] }>,
) => {
  // Convert Effect schema to Zod struct for MCP inputSchema
  const zodStruct = effectToZodStruct(effectSchema);

  // Create a decoder from the Effect schema.
  // Cast to Schema.Schema<unknown, A> because TypeScript cannot properly
  // infer the input type from a generic Schema.Struct<A>.
  const decoder = Schema.decodeUnknownSync(
    effectSchema as unknown as Schema.Schema<unknown, A>,
  );

  return {
    inputSchema: zodStruct as {
      [K in keyof A]: z.ZodType<unknown>;
    },
    handler: async (rawOpts: unknown) => {
      // Decode the raw opts using the Effect schema
      // The cast is safe because the decoder validates at runtime
      const input = decoder(rawOpts ?? {});
      return handler(input);
    },
  };
};
