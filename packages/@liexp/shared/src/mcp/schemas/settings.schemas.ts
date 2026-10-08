import { Schema } from "effect";

export const FindSettingsInputSchema = Schema.Struct({
  q: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query (partial match on key)",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Literal("key"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt", "updatedAt", or "key"',
  }),
  order: Schema.Union(
    Schema.Literal("ASC"),
    Schema.Literal("DESC"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort order: "ASC" for ascending or "DESC" for descending',
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination start index",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination end index",
  }),
});
export type FindSettingsInputSchema = typeof FindSettingsInputSchema.Type;

export const GetSettingInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "Key/ID of the setting to retrieve (required)",
  }),
});
export type GetSettingInputSchema = typeof GetSettingInputSchema.Type;

export const CreateSettingInputSchema = Schema.Struct({
  key: Schema.String.annotations({
    description: "Setting key (required)",
  }),
  value: Schema.String.annotations({
    description: "Setting value (required)",
  }),
});
export type CreateSettingInputSchema = typeof CreateSettingInputSchema.Type;

export const EditSettingInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "Key/ID of the setting to edit (required)",
  }),
  key: Schema.UndefinedOr(Schema.String).annotations({
    description: "Setting key or null to keep current",
  }),
  value: Schema.UndefinedOr(Schema.String).annotations({
    description: "Setting value or null to keep current",
  }),
});
export type EditSettingInputSchema = typeof EditSettingInputSchema.Type;
