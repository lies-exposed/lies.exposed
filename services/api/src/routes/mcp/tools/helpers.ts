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
/**
 * The MCP SDK boundary: `server.registerTool` passes handler arguments in as
 * untyped JSON. Decoding happens once here with the Effect schema, so handlers
 * receive fully typed input and no per-callsite casts are needed.
 */
type DecodedInput<A extends Schema.Struct.Fields> = Schema.Schema.Type<
  Schema.Struct<A>
>;

export const defineMcpTool = <A extends Schema.Struct.Fields>(
  effectSchema: Schema.Struct<A>,
  handler: (
    input: DecodedInput<A>,
  ) => Promise<{ content: { text: string; type: "text" }[] }>,
) => {
  // Convert Effect schema to Zod struct for MCP inputSchema
  const zodStruct = effectToZodStruct(effectSchema);

  // Single documented boundary cast: TypeScript cannot express the decoded Type
  // of a generic `Schema.Struct<A>` in terms of its own Encoded type, so we
  // re-type the schema against its decoded output before decoding. Runtime
  // behaviour is unchanged: `decodeUnknownSync` validates against `effectSchema`.
  const decoder = Schema.decodeUnknownSync(
    effectSchema as unknown as Schema.Schema<DecodedInput<A>>,
  );

  return {
    inputSchema: zodStruct as {
      [K in keyof A]: z.ZodType<unknown>;
    },
    handler: async (rawOpts: unknown) => {
      // Decode the raw opts using the Effect schema
      const input = decoder(rawOpts ?? {});
      return handler(input);
    },
  };
};

/**
 * Flow-input boundary: MCP tool arguments arrive as plain decoded JSON whose
 * shape is a relaxed version of the branded (UUID, BlockNoteDocument) and
 * Option-wrapped body types that flows expect. The flows validate those leaves
 * at runtime, so instead of per-callsite `as unknown as` double casts we
 * re-type once against the flow's input type here.
 */
export const asFlowInput = <T>(input: unknown): T => input as T;
