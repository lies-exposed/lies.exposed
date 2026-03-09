import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type IOError } from "@ts-endpoint/core";
import { ParseResult, Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { helpFromSchema, parseArgsFromSchema, type HelpMeta } from "./args.js";
import { type CLIContext, type CommandModule } from "./command.type.js";

type CommandError = IOError | Error;

/**
 * Decodes raw CLI input through an Effect Schema, runs the API call, prints
 * JSON to stdout, and re-throws any errors.
 */
const runCommand = async <A>(
  ctx: CLIContext,
  schema: Schema.Schema<A, any, never>,
  rawInput: unknown,
  handler: (input: A, ctx: CLIContext) => TaskEither<CommandError, unknown>,
): Promise<void> => {
  const result = await pipe(
    rawInput,
    Schema.decodeUnknownEither(schema),
    fp.E.mapLeft(formatParseError),
    fp.TE.fromEither,
    fp.TE.chainW((input) => handler(input, ctx)),
    fp.TE.mapLeft((e) => (e instanceof Error ? e : new Error(String(e)))),
    throwTE,
  );

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
};

const formatParseError = (e: ParseError): Error =>
  new Error(
    `Invalid arguments:\n${ParseResult.TreeFormatter.formatErrorSync(e)}`,
  );

/**
 * Like runCommand but takes a raw string[] args array instead of a
 * pre-built raw input object. Derives the input object automatically from
 * the schema's field definitions using parseArgsFromSchema.
 *
 * Returns a CommandFlow (ctx, args) => Promise<void> suitable for use
 * as CommandModule.run.
 */
const runCliCommand =
  <Fields extends Schema.Struct.Fields>(
    schema: Schema.Struct<Fields>,
    handler: (
      input: Schema.Schema.Type<Schema.Struct<Fields>>,
      ctx: CLIContext,
    ) => TaskEither<CommandError, unknown>,
  ) =>
  (ctx: CLIContext, args: string[]): Promise<void> =>
    // Schema.Struct<Fields> Context can't be proven `never` at the generic
    // level; safe because all CLI schemas carry no Effect dependencies (R=never).
    runCommand(
      ctx,
      schema as any as Schema.Schema<
        Schema.Schema.Type<Schema.Struct<Fields>>,
        any,
        never
      >,
      parseArgsFromSchema(schema, args),
      handler,
    );

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
  ) => TaskEither<CommandError, unknown>,
): CommandModule => ({
  help: helpFromSchema(schema, meta),
  run: runCliCommand(schema, handler),
});
