import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { propsOmit } from "../../utils";
import { UUID } from "../Common/UUID";
import { CreateLink } from "../Link";
import { CreateMedia } from "../Media";

const createLinkProps = propsOmit(CreateLink, ["events"]);
const CreateEventLink = t.strict(createLinkProps, "CreateEventLink");

const SlateValue = t.partial(
  {
    id: t.string,
    rows: t.array(t.any),
    version: t.number,
  },
  "SlateValue"
);

export const CreateEventCommon = t.strict(
  {
    excerpt: t.union([SlateValue, t.undefined]),
    body: t.union([SlateValue, t.undefined]),
    date: DateFromISOString,
    draft: t.boolean,
    media: t.array(t.union([UUID, CreateMedia])),
    links: t.array(t.union([UUID, CreateEventLink])),
    keywords: t.array(UUID),
  },
  "CreateEventCommon"
);
export type CreateEventCommon = t.TypeOf<typeof CreateEventCommon>;

export const EditEventCommon = t.strict(
  {
    excerpt: optionFromUndefined(SlateValue),
    body: optionFromUndefined(SlateValue),
    draft: optionFromUndefined(t.boolean),
    date: optionFromUndefined(DateFromISOString),
    keywords: optionFromUndefined(t.array(UUID)),
    media: optionFromUndefined(t.array(t.union([UUID, CreateMedia]))),
    links: optionFromUndefined(t.array(t.union([UUID, CreateEventLink]))),
  },
  "EditEventCommon"
);
export type EditEventCommon = t.TypeOf<typeof EditEventCommon>;

export const EventCommon = t.strict(
  {
    ...CreateEventCommon.type.props,
    id: UUID,
    media: t.array(UUID, 'media'),
    links: t.array(UUID, "links"),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined], 'deletedAt'),
  },
  "EventCommon"
);
export type EventCommon = t.TypeOf<typeof EventCommon>;
