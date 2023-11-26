import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/BooleanFromString";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from "io-ts-types/UUID";
import { nonEmptyArray } from "io-ts-types/nonEmptyArray";
import { optionFromNullable } from "io-ts-types/optionFromNullable";
import { type serializedType } from 'ts-io-error/lib/Codec';
import { Actor, ACTORS } from "./Actor";
import { EVENTS } from "./Events";
import { EventTotals } from './Events/EventTotals';
import { Group, GROUPS } from "./Group";
import { Keyword, KEYWORDS } from "./Keyword";
import { Media } from "./Media";

export const NetworkType = t.union(
  [KEYWORDS, ACTORS, GROUPS, EVENTS, t.literal("hierarchy")],
  "NetworkType",
);
export type NetworkType = t.TypeOf<typeof NetworkType>;

export const NetworkGroupBy = t.union(
  [KEYWORDS, ACTORS, GROUPS],
  "NetworkGroupBy",
);
export type NetworkGroupBy = t.TypeOf<typeof NetworkGroupBy>;

export const GetNetworkQuery = t.type(
  {
    ids: optionFromNullable(nonEmptyArray(UUID)),
    startDate: optionFromNullable(t.string),
    endDate: optionFromNullable(t.string),
    relations: optionFromNullable(t.array(NetworkGroupBy)),
    emptyRelations: optionFromNullable(BooleanFromString),
    keywords: optionFromNullable(nonEmptyArray(UUID)),
    groups: optionFromNullable(nonEmptyArray(UUID)),
    actors: optionFromNullable(nonEmptyArray(UUID)),
  },
  "GetNetworkQuery",
);

export type GetNetworkQuery = t.TypeOf<typeof GetNetworkQuery>;
export type GetNetworkQuerySerialized = serializedType<typeof GetNetworkQuery>

export const GetNetworkParams = t.type(
  {
    type: NetworkType,
    // id: UUID
  },
  "GetNetworkParams",
);
export type GetNetworkParams = t.TypeOf<typeof GetNetworkParams>;

export const NetworkLink = t.type(
  {
    source: t.string,
    target: t.string,
    fill: t.string,
    value: t.number,
    stroke: t.string,
    sourceType: NetworkType,
  },
  "NetworkLink",
);
export type NetworkLink = t.TypeOf<typeof NetworkLink>;

export const NetworkGraphOutput = t.strict(
  {
    events: t.array(t.any),
    actors: t.array(Actor),
    groups: t.array(Group),
    keywords: t.array(Keyword),
    media: t.array(Media),
    eventLinks: t.array(NetworkLink),
    selectedLinks: t.array(NetworkLink),
    actorLinks: t.array(NetworkLink),
    groupLinks: t.array(NetworkLink),
    keywordLinks: t.array(NetworkLink),
    startDate: DateFromISOString,
    endDate: DateFromISOString,
    totals: EventTotals,
  },
  "NetworkGraphOutput",
);

export type NetworkGraphOutput = t.TypeOf<typeof NetworkGraphOutput>;
