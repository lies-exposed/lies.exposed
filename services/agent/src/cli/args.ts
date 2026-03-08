import { type AST, type Schema } from "effect";

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

/**
 * Checks whether an Effect Schema AST node represents an array type
 * (i.e., Schema.Array(...)). Unwraps Union, Transformation, and
 * PropertySignatureDeclaration recursively.
 */
const isArrayAst = (ast: AST.AST): boolean => {
  switch (ast._tag) {
    case "TupleType":
      // Schema.Array creates a TupleType with rest elements and no fixed elements
      return (ast as AST.TupleType).rest.length > 0;
    case "Union":
      return ast.types
        .filter(
          (t) => t._tag !== "UndefinedKeyword" && t._tag !== "NullKeyword",
        )
        .some(isArrayAst);
    case "Transformation":
      return isArrayAst(ast.from);
    case "PropertySignatureDeclaration":
      return isArrayAst((ast as any).type);
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
const isOptionalArrayAst = (ast: AST.AST): boolean => {
  switch (ast._tag) {
    case "PropertySignatureDeclaration":
      // Schema.optional(...) sets isOptional=true on the declaration
      return (ast as any).isOptional && isArrayAst(ast);
    case "Union":
      return (
        ast.types.some((t) => t._tag === "UndefinedKeyword") &&
        ast.types.some(isArrayAst)
      );
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
