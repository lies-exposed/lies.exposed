import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";

export const EventCommon = t.strict(
  {
    id: UUID,
    draft: t.boolean,
    excerpt: t.union([t.unknown, t.undefined]),
    date: DateFromISOString,
    media: t.array(UUID),
    keywords: t.array(UUID),
    links: t.array(UUID),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "EventCommon"
);
export type EventCommon = t.TypeOf<typeof EventCommon>;
