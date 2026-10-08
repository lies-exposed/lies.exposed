import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const GraphType = Schema.Union(
  Schema.Literal("reactflow"),
  Schema.Literal("AxisGraph"),
).annotations({
  title: "GraphType",
});

export const FindGraphsInputSchema = Schema.Struct({
  q: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query (partial match on label)",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Literal("label"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt", "updatedAt", or "label"',
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
export type FindGraphsInputSchema = typeof FindGraphsInputSchema.Type;

export const GetGraphInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the graph to retrieve",
  }),
});
export type GetGraphInputSchema = typeof GetGraphInputSchema.Type;

export const CreateGraphInputSchema = Schema.Struct({
  type: GraphType.annotations({
    description: "Graph type: reactflow or AxisGraph (required)",
  }),
  label: Schema.String.annotations({
    description: "Display label for the graph (required)",
  }),
  slug: Schema.String.annotations({
    description: "URL-friendly slug identifier (required)",
  }),
  data: Schema.Any.annotations({
    description: "Graph data (required)",
  }),
  options: Schema.Any.annotations({
    description: "Graph options (default: {})",
  }),
});
export type CreateGraphInputSchema = typeof CreateGraphInputSchema.Type;

export const EditGraphInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the graph to edit",
  }),
  type: Schema.UndefinedOr(GraphType).annotations({
    description: "Graph type or null to keep current",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Display label or null to keep current",
  }),
  slug: Schema.UndefinedOr(Schema.String).annotations({
    description: "Slug or null to keep current",
  }),
  data: Schema.UndefinedOr(Schema.Any).annotations({
    description: "Graph data or null to keep current",
  }),
  options: Schema.UndefinedOr(Schema.Any).annotations({
    description: "Graph options or null to keep current",
  }),
});
export type EditGraphInputSchema = typeof EditGraphInputSchema.Type;
