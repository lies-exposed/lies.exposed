import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ParseResult, Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { helpFromSchema, parseArgsFromSchema, type HelpMeta } from "./args.js";
import { type CLIContext, type CommandModule } from "./command.type.js";

/**
 * Decodes raw CLI input through an Effect Schema, runs the API call, prints
 * JSON to stdout, and re-throws any errors.
 */
export const runCommand = async <S extends Schema.Schema<any, any, never>>(
  ctx: CLIContext,
  schema: S,
  rawInput: unknown,
  handler: (
    input: Schema.Schema.Type<S>,
    ctx: CLIContext,
  ) => TaskEither<Error, unknown>,
): Promise<void> => {
  const result = await pipe(
    rawInput,
    Schema.decodeUnknownEither(schema),
    fp.E.mapLeft(
      (e: ParseError) =>
        new Error(
          `Invalid arguments:\n${ParseResult.TreeFormatter.formatErrorSync(e)}`,
        ),
    ),
    fp.TE.fromEither,
    fp.TE.chainW((input) => handler(input, ctx)),
    throwTE,
  );

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
};

/**
 * Like runCommand but takes a raw string[] args array instead of a
 * pre-built raw input object. Derives the input object automatically from
 * the schema's field definitions using parseArgsFromSchema.
 *
 * Returns a CommandFlow (ctx, args) => Promise<void> suitable for use
 * as CommandModule.run.
 */
export const runCliCommand =
  <Fields extends Schema.Struct.Fields>(
    schema: Schema.Struct<Fields>,
    handler: (
      input: Schema.Schema.Type<Schema.Struct<Fields>>,
      ctx: CLIContext,
    ) => TaskEither<Error, unknown>,
  ) =>
  (ctx: CLIContext, args: string[]): Promise<void> =>
    runCommand(ctx, schema, parseArgsFromSchema(schema, args), handler);

/**
 * Creates a CommandModule (run + help) from a Schema.Struct.
 * The help text is derived from the schema's field annotations, so it always
 * stays in sync with the schema definition.
 *
 * Usage:
 *   export const actorGet = makeCommand(
 *     GetActorInputSchema,
 *     { usage: "actor get", description: "Get a single actor by UUID.", output: "JSON actor object" },
 *     (input, ctx) => ctx.api.Actor.Get({ Params: { id: input.id } }),
 *   );
 */
export const makeCommand = <Fields extends Schema.Struct.Fields>(
  schema: Schema.Struct<Fields>,
  meta: HelpMeta,
  handler: (
    input: Schema.Schema.Type<Schema.Struct<Fields>>,
    ctx: CLIContext,
  ) => TaskEither<Error, unknown>,
): CommandModule => ({
  help: helpFromSchema(schema, meta),
  run: runCliCommand(schema, handler),
});
