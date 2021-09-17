import * as t from "io-ts";
import { DateFromISOStringC } from "io-ts-types/lib/DateFromISOString";
import {
  optionFromNullable,
  OptionFromNullableC,
} from "io-ts-types/lib/optionFromNullable";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Color } from "./Common/Color";
import { markdownRemark } from "./Common/Markdown";

export const GroupKind = t.union(
  [t.literal("Public"), t.literal("Private")],
  "GroupKind"
);
export type GroupKind = t.TypeOf<typeof GroupKind>;

export interface GroupFrontmatterC extends t.Props {
  id: t.StringC;
  createdAt: DateFromISOStringC;
  updatedAt: DateFromISOStringC;
  name: t.StringC;
  kind: t.UnionC<[t.LiteralC<"Public">, t.LiteralC<"Private">]>;
  color: t.StringC;
  avatar: OptionFromNullableC<t.StringC>;
  members: t.ArrayC<t.StringC>;
  subGroups: OptionFromNullableC<
    t.ArrayC<t.ExactType<t.TypeC<GroupFrontmatterC>>>
  >;
}

export type GroupFrontmatterType = t.RecursiveType<
  t.ExactC<t.TypeC<GroupFrontmatterC>>
>;

export const GroupFrontmatter: GroupFrontmatterType = t.recursion(
  "GroupFrontmatter",
  () =>
    t.strict({
      ...BaseFrontmatter.type.props,
      name: t.string,
      kind: GroupKind,
      color: Color,
      avatar: optionFromNullable(t.string),
      subGroups: optionFromNullable(t.array(t.string)),
      members: optionFromNullable(t.array(t.string)),
    }) as any
);

export type GroupFrontmatter = t.TypeOfProps<GroupFrontmatterC>;

export const GroupMD = markdownRemark(GroupFrontmatter.type, "GroupMD");

export type GroupMD = t.TypeOf<typeof GroupMD>;

export interface GroupC extends t.Props {
  id: t.StringC;
  createdAt: DateFromISOStringC;
  updatedAt: DateFromISOStringC;
  name: t.StringC;
  kind: t.UnionC<[t.LiteralC<"Public">, t.LiteralC<"Private">]>;
  color: t.StringC;
  avatar: t.UnionC<[t.StringC, t.UndefinedC]>;
  members: t.ArrayC<t.StringC>;
  subGroups: t.ArrayC<t.ExactType<t.TypeC<GroupFrontmatterC>>>;
  body: t.StringC;
}

export type GroupType = t.RecursiveType<t.ExactC<t.TypeC<GroupC>>>;

export const Group = t.strict(
  {
    ...BaseFrontmatter.type.props,
    name: t.string,
    kind: GroupKind,
    color: Color,
    avatar: t.union([t.undefined, t.string]),
    subGroups: t.array(t.string),
    members: t.array(t.string),
    body: t.string,
  },
  "Group"
);

export type Group = t.TypeOf<typeof Group>;
