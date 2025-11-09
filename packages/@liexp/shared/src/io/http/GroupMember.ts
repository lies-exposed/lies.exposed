import { Schema } from "effect";
import { type ActorEncoded, Actor } from "./Actor.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID } from "./Common/UUID.js";
import { Group } from "./Group.js";

export const CreateGroupMember = Schema.Struct({
  group: UUID.annotations({
    description: "Group UUID",
  }),
  actor: UUID.annotations({
    description: "Actor UUID",
  }),
  startDate: Schema.Date.annotations({
    description: "Membership start date",
  }),
  endDate: OptionFromNullishToNull(Schema.Date).annotations({
    description: "Membership end date (null if still active)",
  }),
  body: BlockNoteDocument.annotations({
    description: "Description of the membership",
  }),
}).annotations({
  title: "CreateGroupMember",
  description: "Schema for creating a new group membership",
});
export type CreateGroupMember = typeof CreateGroupMember.Type;

const groupMemberFields = {
  ...BaseProps.fields,
  startDate: Schema.Date.annotations({
    description: "Membership start date",
  }),
  endDate: Schema.Union(Schema.Undefined, Schema.Date).annotations({
    description: "Membership end date (undefined if still active)",
  }),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Short description of the membership as BlockNote document",
  }),
  body: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Full description of the membership as BlockNote document",
  }),
};

// Type interface for GroupMember (decoded/application type)
export interface GroupMember
  extends Schema.Struct.Type<typeof groupMemberFields> {
  readonly group: Schema.Schema.Type<typeof Group>;
  readonly actor: Actor;
}

// Encoded interface for GroupMember (wire format)
export interface GroupMemberEncoded
  extends Schema.Struct.Encoded<typeof groupMemberFields> {
  readonly group: Schema.Schema.Encoded<typeof Group>;
  readonly actor: ActorEncoded;
}

export const GroupMember = Schema.Struct({
  ...groupMemberFields,
  group: Group.annotations({
    description: "Group entity this membership belongs to",
  }),
  actor: Schema.suspend(
    (): Schema.Schema<Actor, ActorEncoded> => Actor,
  ).annotations({
    description:
      "Actor entity for the member (lazy loaded to avoid circular dependency)",
  }),
}).annotations({
  title: "GroupMember",
  description: "Complete group membership entity with all properties",
});

export const SingleGroupMemberOutput = Output(GroupMember).annotations({
  title: "SingleGroupMember",
  description: "API response wrapper for a single group membership",
});
export type SingleGroupMemberOutput = Output<GroupMember>;
export const ListGroupMemberOutput = ListOutput(
  GroupMember,
  "ListGroupMember",
).annotations({
  description:
    "API response wrapper for a list of group memberships with pagination",
});
export type ListGroupMemberOutput = ListOutput<GroupMember>;
