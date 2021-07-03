import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { Actor } from "./Actor";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Group } from "./Group";

export const GroupMember = t.strict(
  {
    ...BaseFrontmatter.type.props,
    group: Group,
    actor: Actor,
    startDate: DateFromISOString,
    endDate: t.union([t.undefined, DateFromISOString]),
    events: t.array(t.string),
    body: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "GroupMember"
);

export type GroupMember = t.TypeOf<typeof GroupMember>;
