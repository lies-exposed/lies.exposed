import * as t from "io-ts";
import { DateFromISOStringC } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "./Common/BaseProps";
import { Color } from "./Common/Color";

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

export const Group = t.strict(
  {
    ...BaseProps.type.props,
    name: t.string,
    kind: GroupKind,
    color: Color,
    avatar: t.union([t.undefined, t.string]),
    subGroups: t.array(t.string),
    members: t.array(t.string),
    excerpt: t.union([t.string, t.null]),
    body: t.string,
    body2: t.union([t.UnknownRecord, t.null]),
  },
  "Group"
);

export type Group = t.TypeOf<typeof Group>;
