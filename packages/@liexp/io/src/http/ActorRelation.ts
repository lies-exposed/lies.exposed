import { Schema } from "effect";
import { type ActorEncoded, Actor } from "./Actor.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID } from "./Common/UUID.js";
import { GetListQuery } from "./Query/GetListQuery.js";

export const ActorRelationType = Schema.Union(
  Schema.Literal("PARENT_CHILD").annotations({
    description:
      "Parent-child family relationship (biological, adoptive, or step-relation)",
  }),
  Schema.Literal("SPOUSE").annotations({
    description: "Married spouse relationship",
  }),
  Schema.Literal("PARTNER").annotations({
    description: "Unmarried partner relationship (romantic or business)",
  }),
).annotations({
  description:
    "Type of relationship between two actors: PARENT_CHILD (family hierarchy), SPOUSE (marriage), or PARTNER (unmarried partnership)",
});
export type ActorRelationType = typeof ActorRelationType.Type;

export const GetListActorRelationQuery = Schema.Struct({
  ...GetListQuery.fields,
  type: OptionFromNullishToNull(ActorRelationType),
  actor: OptionFromNullishToNull(UUID),
});
export type GetListActorRelationQuery = typeof GetListActorRelationQuery.Type;

export const CreateActorRelation = Schema.Struct({
  actor: UUID.annotations({ description: "Actor UUID (source)" }),
  relatedActor: UUID.annotations({
    description: "Related actor UUID (target)",
  }),
  type: ActorRelationType.annotations({ description: "Relation type" }),
  startDate: OptionFromNullishToNull(Schema.DateFromString).annotations({
    description: "Relation start date",
  }),
  endDate: OptionFromNullishToNull(Schema.DateFromString).annotations({
    description: "Relation end date (null if still active)",
  }),
  excerpt: OptionFromNullishToNull(BlockNoteDocument).annotations({
    description: "Short description of the relation as BlockNote document",
  }),
}).annotations({
  title: "CreateActorRelation",
  description: "Schema for creating a new actor-to-actor relation",
});
export type CreateActorRelation = typeof CreateActorRelation.Type;

const actorRelationFields = {
  ...BaseProps.fields,
  startDate: Schema.UndefinedOr(Schema.Date).annotations({
    description: "Relation start date",
  }),
  endDate: Schema.UndefinedOr(Schema.Date).annotations({
    description: "Relation end date (undefined if still active)",
  }),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Short description of the relation as BlockNote document",
  }),
  type: ActorRelationType.annotations({ description: "Relation type" }),
};

export interface ActorRelationEncoded extends Schema.Struct.Encoded<
  typeof actorRelationFields
> {
  readonly actor: ActorEncoded;
  readonly relatedActor: ActorEncoded;
}

export const ActorRelation = Schema.Struct({
  ...actorRelationFields,
  actor: Schema.suspend(() => Actor).annotations({
    description: "Actor entity for the source of the relation (lazy)",
  }),
  relatedActor: Schema.suspend(() => Actor).annotations({
    description: "Actor entity for the target of the relation (lazy)",
  }),
}).annotations({
  title: "ActorRelation",
  description: "Complete actor relation entity with all properties",
});
export type ActorRelation = typeof ActorRelation.Type;

export const SingleActorRelationOutput = Output(ActorRelation).annotations({
  title: "SingleActorRelation",
  description: "API response wrapper for a single actor relation",
});
export type SingleActorRelationOutput = Output<ActorRelation>;

export const ListActorRelationOutput = ListOutput(
  ActorRelation,
  "ListActorRelation",
).annotations({
  description:
    "API response wrapper for a list of actor relations with pagination",
});
export type ListActorRelationOutput = typeof ListActorRelationOutput.Type;
