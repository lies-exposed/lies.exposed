import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";

export const GroupMember = t.strict(
  {
    ...BaseFrontmatter.type.props,
    group: t.string,
    actor: t.string,
    startDate: DateFromISOString,
    endDate: t.union([t.undefined, DateFromISOString]),
    body: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "Group"
);

export type GroupMember = t.TypeOf<typeof GroupMember>;
