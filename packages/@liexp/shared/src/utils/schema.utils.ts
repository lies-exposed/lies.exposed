import { type Schema, SchemaAST } from "effect";
import { isSome } from "effect/Option";
import { z } from "zod";

type AnySchema =
  | SchemaAST.AST
  | SchemaAST.OptionalType
  | readonly SchemaAST.Type[]
  | SchemaAST.Type;

/**
 * Converts a Schema.Struct to an object where each property is the corresponding Zod schema
 */
export const effectToZodStruct = <A extends Schema.Struct.Fields>(
  schema: Schema.Struct<A>,
): {
  [K in keyof A]: z.ZodType<Schema.Schema.Type<A[K]>>;
} => {
  const ast = schema.ast;
  if (!("_tag" in ast)) {
    throw new Error("Invalid schema AST");
  }

  // For struct types the AST will have the fields directly on the type
  const fields = schema.fields;
  if (!fields || typeof fields !== "object") {
    throw new Error("Expected a Struct schema with fields");
  }

  const result: Record<string, z.ZodType> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = effectToZod(value);
  }

  return result as { [K in keyof A]: z.ZodType<Schema.Schema.Type<A[K]>> };
};

/**
 * Extracts title annotation from Effect schema AST
 */
const getTitleAnnotation = (ast: SchemaAST.AST): string | undefined => {
  try {
    const titleAnnotation = SchemaAST.getTitleAnnotation(ast);
    return isSome(titleAnnotation) ? titleAnnotation.value : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Extracts description annotation from Effect schema AST
 */
const getDescriptionAnnotation = (ast: SchemaAST.AST): string | undefined => {
  try {
    const descriptionAnnotation = SchemaAST.getDescriptionAnnotation(ast);
    return isSome(descriptionAnnotation)
      ? descriptionAnnotation.value
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Applies title and description annotations to a Zod schema
 */
const applyAnnotations = (
  zodSchema: z.ZodType,
  ast: SchemaAST.AST,
): z.ZodType => {
  const title = getTitleAnnotation(ast);
  const description = getDescriptionAnnotation(ast);

  // Check if we have custom annotations (not just default ones)
  const hasCustomTitle =
    title && !["string", "number", "boolean"].includes(title);
  const hasCustomDescription =
    description &&
    description !== "a string" &&
    description !== "a number" &&
    description !== "a boolean";

  if (hasCustomTitle || hasCustomDescription) {
    // Use custom description if available, otherwise use custom title
    const descriptionText = hasCustomDescription
      ? description
      : hasCustomTitle
        ? title
        : "";

    if (descriptionText) {
      return zodSchema.describe(descriptionText);
    }
  }

  return zodSchema;
};

export const effectToZod = <A>(schema: Schema.Schema<A>): z.ZodType<A> => {
  // Get the AST from schema._ast
  const ast = schema.ast;

  const convert = (ast: AnySchema): z.ZodType => {
    if ("_tag" in ast) {
      const baseSchema = (() => {
        switch (ast._tag) {
          // Base types
          case "StringKeyword":
            return z.string();
          case "NumberKeyword":
            return z.number();
          case "BooleanKeyword":
            return z.boolean();
          case "UndefinedKeyword":
            return z.undefined();
          case "VoidKeyword":
            return z.void();
          case "NeverKeyword":
            return z.never();
          case "UnknownKeyword":
            return z.unknown();
          case "AnyKeyword":
            return z.any();
          case "SymbolKeyword":
            return z.symbol();
          case "ObjectKeyword":
            return z.object({});
          case "Literal": {
            return z.literal(ast.literal);
          }
          case "TypeLiteral": {
            // console.log(ast.indexSignatures, ast.propertySignatures);
            const props = ast.propertySignatures.reduce((acc, p) => {
              const zodSchema = convert(p);
              return {
                ...acc,
                [p.name]: p.isOptional ? zodSchema.optional() : zodSchema,
              };
            }, {});
            return z.object(props);
          }
          // Composite types
          case "TupleType": {
            // handle Schema.Array (tuple with 0 elements, 1 rest)
            if (ast.elements.length === 0) {
              if (ast.rest.length === 1) {
                return z.array(convert(ast.rest[0]));
              }
            }

            // handle Tuple
            const elements = ast.elements.map((type) =>
              convert(type as AnySchema),
            );
            const rest = ast.rest ? convert(ast.rest as AnySchema) : [];
            const arrayRest = Array.isArray(rest) ? rest : [];

            return z.tuple([...elements, ...arrayRest] as [
              z.ZodTypeAny,
              ...z.ZodTypeAny[],
            ]);
          }
          case "Union":
            if (ast.types.length < 2) {
              throw new Error("Union type must have at least 2 types");
            }
            return z.union([
              convert(ast.types[0]),
              convert(ast.types[1]),
              ...ast.types.slice(2).map(convert),
            ]);
          case "Refinement": {
            const baseSchema = convert(ast.from);
            return baseSchema.refine(
              (val: unknown) => {
                const result = ast.filter(val, { errors: "first" }, ast);

                if (isSome(result)) {
                  // Parse issue detected
                  return false;
                }
                return true;
              },
              {
                message: "Refinement check failed",
              },
            );
          }
          //   case "IntersectionType":
          //     if (ast.types.length < 2) {
          //       throw new Error("Intersection type must have at least 2 types")
          //     }
          //     return z.intersection(convert(ast.types[0]), convert(ast.types[1]))
          //   case "ObjectType":
          //     return z.object(
          //       Object.fromEntries(
          //         Object.entries(ast.properties).map(([key, value]) => [
          //           key,
          //           convert(value)
          //         ])
          //       )
          //     )
          default:
            throw new Error(
              `Unsupported schema type: ${(ast as { _tag: string })._tag}`,
            );
        }
      })();

      // Apply annotations to the base schema
      return applyAnnotations(baseSchema, ast);
    } else {
      // handle optional type
      if ("isOptional" in ast) {
        if (ast.isOptional) {
          return convert(ast.type).optional();
        }
        return convert(ast.type);
      } else if (Array.isArray(ast)) {
        const schemas = ast.map((type) => convert(type));
        if (schemas.length < 2) return schemas[0];
        return z.union([schemas[0], schemas[1], ...schemas.slice(2)]);
      } else if ("type" in ast) {
        return convert(ast.type);
      }

      throw new Error(`Unsupported schema type: ${JSON.stringify(ast)}`);
    }
  };

  return convert(ast);
};
