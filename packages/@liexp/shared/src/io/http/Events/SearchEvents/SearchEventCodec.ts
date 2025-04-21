import { Schema } from "effect";
import { Keyword } from "../../Keyword.js";
import { Link } from "../../Link.js";
import { Media } from "../../Media/index.js";

export interface EventProps extends Schema.Struct.Fields {
  payload: Schema.Struct<Schema.Struct.Fields>;
}

export type SearchEventCodec<
  E extends Schema.Struct.Fields,
  P extends Schema.Struct.Fields,
> = Schema.Struct<
  Omit<E, "payload"> & {
    payload: E["payload"] extends Schema.Struct<infer A>
      ? Schema.Struct<A & P>
      : never;
    media: Schema.Array$<typeof Media>;
    keywords: Schema.Array$<typeof Keyword>;
    links: Schema.Array$<typeof Link>;
  }
>;

export const SearchEventCodec = <
  EventFields extends Schema.Struct.Fields,
  PayloadP extends Schema.Struct.Fields,
>(
  eventType: EventFields,
  payloadOverride: PayloadP,
): SearchEventCodec<EventFields, PayloadP> => {
  const payloadT = eventType.payload as Schema.Struct<{
    payload: Schema.Struct<any>;
  }>;

  const codec = Schema.Struct({
    ...eventType,
    payload: Schema.Struct({
      ...payloadT.fields,
      ...payloadOverride,
    }),
    media: Schema.Array(Media),
    keywords: Schema.Array(Keyword),
    links: Schema.Array(Link),
  });

  return codec as unknown as SearchEventCodec<EventFields, PayloadP>;
};
