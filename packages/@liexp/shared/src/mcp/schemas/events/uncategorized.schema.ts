import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateUncategorizedEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Event title (required)",
  }),
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Group UUIDs (comma-separated when passed as CLI arg)",
  }),
  groupsMembers: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Group-member UUIDs (comma-separated when passed as CLI arg)",
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
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Group UUIDs (comma-separated when passed as CLI arg)",
  }),
  groupsMembers: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Group-member UUIDs (comma-separated when passed as CLI arg)",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD",
  }),
});
