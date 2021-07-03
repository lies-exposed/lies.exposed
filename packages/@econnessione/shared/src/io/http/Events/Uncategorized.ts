import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { nonEmptyRecordFromType } from "../../Common/NonEmptyRecord";
import { BaseFrontmatter, Point } from "../Common";
import { EventLink } from "./EventLink";

export const GetEventsQueryFilter = t.partial({
  actors: optionFromNullable(t.array(t.string)),
  groups: optionFromNullable(t.array(t.string)),
});
export type GetEventsQueryFilter = t.TypeOf<typeof GetEventsQueryFilter>;

export const CreateEventBody = t.strict(
  {
    title: t.string,
    images: optionFromNullable(
      nonEmptyArray(
        t.strict({
          location: t.string,
          description: t.string,
        })
      )
    ),
    actors: t.array(t.string),
    groups: t.array(t.string),
    groupMembers: t.array(t.string),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    body: t.string,
  },
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = nonEmptyRecordFromType({
  title: optionFromNullable(t.string),
  images: optionFromNullable(
    t.array(
      t.strict({
        location: t.string,
        description: t.string,
      })
    )
  ),
  links: optionFromNullable(t.array(t.string)),
  location: optionFromNullable(Point),
  actors: optionFromNullable(t.array(t.string)),
  groups: optionFromNullable(t.array(t.string)),
  groupsMembers: optionFromNullable(t.array(t.string)),
  startDate: optionFromNullable(DateFromISOString),
  endDate: optionFromNullable(DateFromISOString),
  body: optionFromNullable(t.string),
});

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const UNCATEGORIZED = t.literal("Uncategorized");

export const Uncategorized = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: UNCATEGORIZED,
    title: t.string,
    startDate: DateFromISOString,
    endDate: t.union([DateFromISOString, t.undefined]),
    location: t.union([t.undefined, Point]),
    images: t.array(
      t.strict({ id: t.string, location: t.string, description: t.string })
    ),
    links: t.array(EventLink),
    actors: t.array(t.string),
    groups: t.array(t.string),
    groupsMembers: t.array(t.string),
    topics: t.array(t.string),

    body: t.string,
  },
  UNCATEGORIZED.value
);
export type Uncategorized = t.TypeOf<typeof Uncategorized>;
