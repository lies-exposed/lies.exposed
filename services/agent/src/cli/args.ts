import { SchemaAST, type Schema } from "effect";

/**
 * Parses a --key=value argument from the args array.
 * Supports values containing "=" (e.g. URLs).
 */
export const getArg = (args: string[], key: string): string | undefined =>
  args
    .find((a) => a.startsWith(`--${key}=`))
    ?.split("=")
    .slice(1)
    .join("=");

/**
 * Splits a comma-separated string of UUIDs into an array.
 * Returns [] if the value is undefined or empty.
 */
export const splitUUIDs = (value: string | undefined): string[] =>
  value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAst = any;

/**
 * Checks whether an Effect Schema AST node represents an array type
 * (i.e., Schema.Array(...)). Unwraps Union, Transformation, and
 * PropertySignatureDeclaration recursively.
 */
const isArrayAst = (ast: AnyAst): boolean => {
  switch (ast._tag) {
    case "TupleType":
      // Schema.Array creates a TupleType with rest elements and no fixed elements
      return ast.rest.length > 0;
    case "Union":
      return ast.types
        .filter(
          (t: AnyAst) =>
            t._tag !== "UndefinedKeyword" && t._tag !== "NullKeyword",
        )
        .some(isArrayAst);
    case "Transformation":
      return isArrayAst(ast.from);
    case "PropertySignatureDeclaration":
      return isArrayAst(ast.type);
    default:
      return false;
  }
};

/**
 * Checks whether an AST node represents an optional array field — i.e. an
 * array that also allows undefined (Schema.optional(Schema.Array(...)) or
 * Schema.UndefinedOr(Schema.Array(...))). Used to decide whether to default
 * to [] or undefined when no CLI arg is provided.
 */
const isOptionalArrayAst = (ast: AnyAst): boolean => {
  switch (ast._tag) {
    case "PropertySignatureDeclaration":
      // Schema.optional(...) sets isOptional=true on the declaration
      return ast.isOptional && isArrayAst(ast);
    case "Union":
      return (
        ast.types.some((t: AnyAst) => t._tag === "UndefinedKeyword") &&
        ast.types.some(isArrayAst)
      );
    default:
      return false;
  }
};

/**
 * Returns true if the field is optional (UndefinedOr, Schema.optional, etc.)
 */
const isOptionalField = (ast: AnyAst): boolean => {
  switch (ast._tag) {
    case "Union":
      return ast.types.some((t: AnyAst) => t._tag === "UndefinedKeyword");
    case "PropertySignatureDeclaration":
      return ast.isOptional;
    default:
      return false;
  }
};

/**
 * Derives a raw CLI input object from a Schema.Struct definition and a
 * string[] argv array.
 *
 * For each field in the schema:
 * - Reads --fieldName=value from args
 * - If the field is an array type (Schema.Array(...)), splits the value by comma.
 *   - Required arrays (not optional/UndefinedOr) default to [] when no arg given.
 *   - Optional arrays remain undefined when no arg is given.
 * - Otherwise passes the raw string (or undefined) — the schema decoder handles
 *   further coercions like NumberFromString, BooleanFromString, UUID validation
 *
 * This eliminates the need to manually write `{ id: getArg(args, "id"), ... }`
 * in every command file.
 */
export const parseArgsFromSchema = <Fields extends Schema.Struct.Fields>(
  schema: Schema.Struct<Fields>,
  args: string[],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ast = (fieldSchema as Schema.Schema<any>).ast;
    const rawValue = getArg(args, key);
    if (isArrayAst(ast)) {
      if (rawValue !== undefined) {
        result[key] = rawValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (isOptionalArrayAst(ast)) {
        // optional/UndefinedOr array: leave as undefined when no arg
        result[key] = undefined;
      } else {
        // required array: default to empty array
        result[key] = [];
      }
    } else {
      result[key] = rawValue;
    }
  }
  return result;
};

/**
 * Returns a shallow copy of the object with all undefined-valued keys removed.
 * Useful for building API request bodies where omitting a key means "no change"
 * vs. passing undefined which may not survive serialization.
 */
export const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;

export interface HelpMeta {
  /** e.g. "actor get", "link edit" — shown in Usage line */
  usage: string;
  /** One-line description of what the command does */
  description: string;
  /** Output description, e.g. "JSON actor object". Defaults to "JSON object" */
  output?: string;
  /** Any extra text appended after the options block (e.g. type-specific flags) */
  notes?: string;
}

/**
 * Generates a formatted help string from an Effect Schema.Struct definition.
 * Reads field names and descriptions from schema annotations so help stays
 * in sync with the schema automatically.
 */
export const helpFromSchema = <Fields extends Schema.Struct.Fields>(
  schema: Schema.Struct<Fields>,
  meta: HelpMeta,
): string => {
  const PAD = 28;
  const lines: string[] = [];

  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ast = (fieldSchema as Schema.Schema<any>).ast;
    const description =
      (ast.annotations[SchemaAST.DescriptionAnnotationId] as
        | string
        | undefined) ?? "";
    const optional = isOptionalField(ast);
    const flag = `--${key}=<value>`.padEnd(PAD);
    const suffix = optional ? "" : " (required)";
    lines.push(`  ${flag}${description}${suffix}`);
  }

  lines.push(`  ${"--help".padEnd(PAD)}Show this help message`);

  const output = meta.output ?? "JSON object";
  const notes = meta.notes ? `\n${meta.notes}` : "";

  return `
Usage: agent ${meta.usage} [options]

${meta.description}

Options:
${lines.join("\n")}${notes}

Output: ${output}
`;
};
