import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyRecordFromType } from "../../Common/NonEmptyRecord";
import { BaseFrontmatter, Point, UUID } from "../Common";
import { optionFromUndefined } from "../Common/optionFromUndefined";
import { CreateKeyword } from "../Keyword";
import { CreateLink } from "../Link";
import { GetListQuery } from "../Query";

export const GetEventsQueryFilter = t.partial(
  {
    ...GetListQuery.props,
    groupsMembers: optionFromUndefined(t.array(t.string)),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    links: optionFromUndefined(t.array(t.string)),
    keywords: optionFromUndefined(t.array(t.string)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    title: optionFromUndefined(t.string),
  },
  "GetEventsQueryFilter"
);

export type GetEventsQueryFilter = t.TypeOf<typeof GetEventsQueryFilter>;

export const CreateEventBody = t.strict(
  {
    title: t.string,
    images: optionFromUndefined(
      t.array(
        t.union([
          UUID,
          t.strict({
            location: t.string,
            description: t.string,
          }),
        ])
      )
    ),
    links: t.array(t.union([UUID, CreateLink])),
    keywords: t.array(t.union([UUID, CreateKeyword])),
    actors: t.array(UUID),
    groups: t.array(UUID),
    groupsMembers: t.array(UUID),
    startDate: DateFromISOString,
    endDate: optionFromUndefined(DateFromISOString),
    body: t.string,
  },
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = nonEmptyRecordFromType({
  title: optionFromUndefined(t.string),
  images: optionFromUndefined(
    t.array(
      t.union([
        UUID,
        t.strict({
          location: t.string,
          description: t.string,
        }),
      ])
    )
  ),
  links: optionFromUndefined(t.array(t.union([UUID, CreateLink]))),
  location: optionFromUndefined(Point),
  actors: optionFromUndefined(t.array(t.string)),
  groups: optionFromUndefined(t.array(t.string)),
  groupsMembers: optionFromUndefined(t.array(t.string)),
  keywords: optionFromUndefined(t.array(t.string)),
  startDate: optionFromUndefined(DateFromISOString),
  endDate: optionFromUndefined(DateFromISOString),
  body: optionFromUndefined(t.string),
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
