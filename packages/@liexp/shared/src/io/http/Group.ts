import * as t from "io-ts";
import { UUID } from "io-ts-types/UUID";
import { type DateFromISOStringC } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/optionFromNullable";
import { BaseProps } from "./Common/BaseProps";
import { Color } from "./Common/Color";
import { GetListQuery } from "./Query";

export const GROUPS = t.literal("groups");
export type GROUPS = t.TypeOf<typeof GROUPS>;

export const GroupKind = t.union(
  [t.literal("Public"), t.literal("Private")],
  "GroupKind"
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
      ])
    ),
    name: optionFromNullable(t.string),
    ids: optionFromNullable(t.array(UUID)),
    members: optionFromNullable(t.array(t.string)),
  },
  "GetGroupListQuery"
);
export type GetGroupListQuery = t.TypeOf<typeof GetGroupListQuery>;

export const Group = t.strict(
  {
    ...BaseProps.type.props,
    name: t.string,
    kind: GroupKind,
    color: Color,
    avatar: t.union([t.undefined, t.string]),
    subGroups: t.array(t.string),
    members: t.array(t.string),
    excerpt: t.union([t.UnknownRecord, t.null]),
    body: t.union([t.UnknownRecord, t.null]),
  },
  "Group"
);

export type Group = t.TypeOf<typeof Group>;
