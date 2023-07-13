import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Actor } from "./Actor";
import { ListOutput, Output } from "./Common";
import { BaseProps } from "./Common/BaseProps";
import { Group } from "./Group";

export const CreateGroupMember = t.strict(
  {
    group: t.string,
    actor: t.string,
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    body: t.UnknownRecord,
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
    excerpt: t.union([t.UnknownRecord, t.null]),
    body: t.union([t.UnknownRecord, t.null]),
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
