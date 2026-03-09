import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateUncategorizedEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Event title (required)",
  }),
  actors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs",
  }),
  groupsMembers: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group-member UUIDs",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD",
  }),
});

export const EditUncategorizedEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Event title",
  }),
  actors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs",
  }),
  groupsMembers: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group-member UUIDs",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD",
  }),
});
