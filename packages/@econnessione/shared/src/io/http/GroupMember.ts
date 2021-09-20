import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { Actor } from "./Actor";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Group } from "./Group";

export const CreateGroupMember = t.strict(
  {
    group: t.string,
    actor: t.string,
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    body: t.string,
  },
  "CreateGroupMember"
);
export type CreateGroupMember = t.TypeOf<typeof CreateGroupMember>;

export const GroupMember = t.strict(
  {
    ...BaseFrontmatter.type.props,
    group: Group,
    actor: Actor,
    // events: t.array(t.string),
    startDate: DateFromISOString,
    endDate: t.union([t.undefined, DateFromISOString]),
    body: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "GroupMember"
);

export type GroupMember = t.TypeOf<typeof GroupMember>;
