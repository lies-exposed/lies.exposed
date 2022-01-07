import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { propsOmit } from "../../../tests/arbitrary/utils.arbitrary";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { CreateLink } from "../Link";
import { CreateMedia } from "../Media";

const createLinkProps = propsOmit(CreateLink, ["events"]);
const CreateEventLink = t.strict(createLinkProps, "CreateEventLink");

export const CreateEventCommon = t.strict(
  {
    excerpt: t.union([t.UnknownRecord, t.undefined]),
    body: t.union([t.UnknownRecord, t.undefined]),
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
    excerpt: optionFromUndefined(t.UnknownRecord),
    body: optionFromUndefined(t.UnknownRecord),
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
    media: t.array(UUID),
    links: t.array(UUID),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "EventCommon"
);
export type EventCommon = t.TypeOf<typeof EventCommon>;
