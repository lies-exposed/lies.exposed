import { Schema } from "effect";
import { Actor } from "./Actor.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { ListOutput, Output } from "./Common/index.js";
import { Group } from "./Group.js";
import { OptionFromNullishToNull } from './Common/OptionFromNullishToNull.js';

export const CreateGroupMember = Schema.Struct({
  group: Schema.String,
  actor: Schema.String,
  startDate: Schema.DateFromString,
  endDate: OptionFromNullishToNull(Schema.DateFromString),
  body: BlockNoteDocument,
}).annotations({
  title: "CreateGroupMember",
});
export type CreateGroupMember = typeof CreateGroupMember.Type;

export const GroupMember = Schema.Struct({
  ...BaseProps.fields,
  group: Group,
  actor: Actor,
  startDate: Schema.DateFromString,
  endDate: Schema.Union(Schema.Undefined, Schema.DateFromString).annotations({
    title: "EndDate",
  }),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    title: "Excerpt",
  }),
  body: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    title: "Body",
  }),
  createdAt: Schema.String,
  updatedAt: Schema.String,
}).annotations({
  title: "GroupMember",
});

export type GroupMember = typeof GroupMember.Type;

export const SingleGroupMemberOutput = Output(GroupMember).annotations({ title: 'SingleGroupMember'});
export type SingleGroupMemberOutput = Output<GroupMember>;
export const ListGroupMemberOutput = ListOutput(GroupMember, "ListGroupMember");
export type ListGroupMemberOutput = ListOutput<GroupMember>;
