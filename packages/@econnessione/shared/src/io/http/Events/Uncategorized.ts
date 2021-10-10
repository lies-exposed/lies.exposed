import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { nonEmptyRecordFromType } from "../../Common/NonEmptyRecord";
import { BaseFrontmatter, Point, UUID } from "../Common";
import { CreateKeyword } from "../Keyword";
import { CreateLink } from "../Link";

export const GetEventsQueryFilter = t.partial(
  {
    groupsMembers: optionFromNullable(t.array(t.string)),
    actors: optionFromNullable(t.array(t.string)),
    groups: optionFromNullable(t.array(t.string)),
    links: optionFromNullable(t.array(t.string)),
    startDate: optionFromNullable(DateFromISOString),
    endDate: optionFromNullable(DateFromISOString),
  },
  "GetEventsQueryFilter"
);

export type GetEventsQueryFilter = t.TypeOf<typeof GetEventsQueryFilter>;

export const CreateEventBody = t.strict(
  {
    title: t.string,
    images: optionFromNullable(
      t.array(
        t.strict({
          location: t.string,
          description: t.string,
        })
      )
    ),
    links: t.array(t.union([UUID, CreateLink])),
    keywords: t.array(t.union([UUID, CreateKeyword])),
    actors: t.array(UUID),
    groups: t.array(UUID),
    groupsMembers: t.array(UUID),
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
  links: optionFromNullable(t.array(t.union([UUID, CreateLink]))),
  location: optionFromNullable(Point),
  actors: optionFromNullable(t.array(t.string)),
  groups: optionFromNullable(t.array(t.string)),
  groupsMembers: optionFromNullable(t.array(t.string)),
  keywords: optionFromNullable(t.array(t.string)),
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
    endDate: t.union([t.undefined, DateFromISOString]),
    location: t.union([t.undefined, Point]),
    images: t.array(
      t.strict({ id: t.string, location: t.string, description: t.string })
    ),
    links: t.array(t.string),
    actors: t.array(t.string),
    groups: t.array(t.string),
    groupsMembers: t.array(t.string),
    keywords: t.array(t.string),
    body: t.string,
  },
  UNCATEGORIZED.value
);
export type Uncategorized = t.TypeOf<typeof Uncategorized>;
