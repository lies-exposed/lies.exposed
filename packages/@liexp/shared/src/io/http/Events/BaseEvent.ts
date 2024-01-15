import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromUndefined } from "../../Common/optionFromUndefined.js";
import { UUID } from "../Common/UUID.js";
import { CreateLink } from "../Link.js";
import { CreateMedia } from "../Media.js";

const createLinkProps = propsOmit(CreateLink, ["events"]);
const CreateEventLink = t.strict(createLinkProps, "CreateEventLink");

const SlateValue = t.partial(
  {
    id: t.string,
    rows: t.array(t.any),
    version: t.number,
  },
  "SlateValue",
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
  "CreateEventCommon",
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
  "EditEventCommon",
);
export type EditEventCommon = t.TypeOf<typeof EditEventCommon>;

export const EventCommon = t.strict(
  {
    ...CreateEventCommon.type.props,
    id: UUID,
    media: t.array(UUID, "media"),
    links: t.array(UUID, "links"),
    socialPosts: t.union([t.array(UUID), t.undefined]),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined], "deletedAt"),
  },
  "EventCommon",
);
export type EventCommon = t.TypeOf<typeof EventCommon>;
