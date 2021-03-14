import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
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
    body: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "Group"
);

export type GroupMember = t.TypeOf<typeof GroupMember>;
