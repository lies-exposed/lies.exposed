import * as t from "io-ts";
import {
  DateFromISOString,
  type DateFromISOStringC,
} from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "./Common/BaseProps.js";
import { Color } from "./Common/Color.js";
import { ListOutput, Output } from "./Common/Output.js";
import { GetListQuery } from "./Query/index.js";

export const GROUPS = t.literal("groups");
export type GROUPS = t.TypeOf<typeof GROUPS>;

export const GroupKind = t.union(
  [t.literal("Public"), t.literal("Private")],
  "GroupKind",
);
export type GroupKind = t.TypeOf<typeof GroupKind>;

export interface GroupC extends t.Props {
  id: t.StringC;
  createdAt: DateFromISOStringC;
  updatedAt: DateFromISOStringC;
  name: t.StringC;
  kind: t.UnionC<[t.LiteralC<"Public">, t.LiteralC<"Private">]>;
  color: t.StringC;
  avatar: t.UnionC<[t.StringC, t.UndefinedC]>;
  members: t.ArrayC<t.StringC>;
  subGroups: t.ArrayC<t.ExactType<t.TypeC<GroupC>>>;
  body: t.StringC;
  body2: t.UnionC<[t.UnknownRecordC, t.UndefinedC]>;
}

export type GroupType = t.RecursiveType<t.ExactC<t.TypeC<GroupC>>>;

export const GetGroupListQuery = t.type(
  {
    ...GetListQuery.props,
    _sort: optionFromNullable(
      t.union([
        t.literal("id"),
        t.literal("name"),
        t.literal("createdAt"),
        t.literal("updatedAt"),
      ]),
    ),
    name: optionFromNullable(t.string),
    ids: optionFromNullable(t.array(UUID)),
    members: optionFromNullable(t.array(t.string)),
  },
  "GetGroupListQuery",
);
export type GetGroupListQuery = t.TypeOf<typeof GetGroupListQuery>;

export const CreateGroupBody = t.strict(
  {
    name: t.string,
    username: t.string,
    color: t.string,
    kind: GroupKind,
    avatar: t.string,
    excerpt: t.union([t.UnknownRecord, t.undefined]),
    body: t.UnknownRecord,
    startDate: t.union([DateFromISOString, t.undefined]),
    endDate: t.union([DateFromISOString, t.undefined]),
    members: t.array(
      t.strict(
        {
          actor: UUID,
          body: t.UnknownRecord,
          startDate: DateFromISOString,
          endDate: optionFromNullable(DateFromISOString),
        },
        "CreateGroupMember",
      ),
    ),
  },
  "CreateGroupBody",
);

export type CreateGroupBody = t.TypeOf<typeof CreateGroupBody>;

export const EditGroupBody = t.strict(
  {
    ...CreateGroupBody.type.props,
    members: t.array(
      t.union([
        UUID,
        t.strict(
          {
            actor: UUID,
            body: t.UnknownRecord,
            startDate: DateFromISOString,
            endDate: optionFromNullable(DateFromISOString),
          },
          "CreateGroupMember",
        ),
      ]),
    ),
  },
  "EditGroupBody",
);

export type EditGroupBody = t.TypeOf<typeof EditGroupBody>;

export const Group = t.strict(
  {
    ...BaseProps.type.props,
    name: t.string,
    username: t.union([t.string, t.undefined]),
    kind: GroupKind,
    color: Color,
    startDate: t.union([DateFromISOString, t.undefined]),
    endDate: t.union([DateFromISOString, t.undefined]),
    avatar: t.union([t.undefined, t.string]),
    subGroups: t.array(t.string),
    members: t.array(t.string),
    excerpt: t.union([t.UnknownRecord, t.null]),
    body: t.union([t.UnknownRecord, t.null]),
  },
  "Group",
);

export type Group = t.TypeOf<typeof Group>;

export const GroupOutput = Output(Group, "Group");
export type GroupOutput = Output<Group>;
export const GroupListOutput = ListOutput(Group, "ListGroup");
export type GroupListOutput = ListOutput<Group>;
