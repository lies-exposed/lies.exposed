import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreatePatentEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Patent title (required)",
  }),
  ownerActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Actor UUIDs of patent owners (comma-separated when passed as CLI arg)",
  }),
  ownerGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Group UUIDs of patent owners (comma-separated when passed as CLI arg)",
  }),
  source: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID as patent source",
  }),
});

export const EditPatentEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Patent title",
  }),
  ownerActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Actor UUIDs of patent owners (comma-separated when passed as CLI arg)",
  }),
  ownerGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Group UUIDs of patent owners (comma-separated when passed as CLI arg)",
  }),
  source: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID as patent source",
  }),
});
