import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Actor } from "./Actor.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { ListOutput, Output } from "./Common/index.js";
import { Group } from "./Group.js";

export const CreateGroupMember = t.strict(
  {
    group: t.string,
    actor: t.string,
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    body: BlockNoteDocument,
  },
  "CreateGroupMember",
);
export type CreateGroupMember = t.TypeOf<typeof CreateGroupMember>;

export const GroupMember = t.strict(
  {
    ...BaseProps.type.props,
    group: Group,
    actor: Actor,
    startDate: DateFromISOString,
    endDate: t.union([t.undefined, DateFromISOString]),
    excerpt: t.union([BlockNoteDocument, t.any, t.null]),
    body: t.union([BlockNoteDocument, t.any, t.null]),
    createdAt: t.string,
    updatedAt: t.string,
  },
  "GroupMember",
);

export type GroupMember = t.TypeOf<typeof GroupMember>;

export const SingleGroupMemberOutput = Output(GroupMember, "GroupMember");
export type SingleGroupMemberOutput = Output<GroupMember>;
export const ListGroupMemberOutput = ListOutput(GroupMember, "ListGroupMember");
export type ListGroupMemberOutput = ListOutput<GroupMember>;
