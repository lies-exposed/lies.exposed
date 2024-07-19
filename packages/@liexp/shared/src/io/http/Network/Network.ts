import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import { Actor, ACTORS } from "../Actor.js";
import { EventTotals } from "../Events/EventTotals.js";
import { EVENTS, type EventType } from "../Events/index.js";
import { Group, GROUPS } from "../Group.js";
import { Keyword, KEYWORDS } from "../Keyword.js";
import { Media } from "../Media.js";

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
export type GetNetworkQuerySerialized = serializedType<typeof GetNetworkQuery>;

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
    source: UUID,
    target: UUID,
    fill: t.string,
    value: t.number,
    stroke: t.string,
    sourceType: NetworkType,
  },
  "NetworkLink",
);
export type NetworkLink = t.TypeOf<typeof NetworkLink>;

export interface NetworkNodeDatum {
  id: string;
  label: string;
  innerColor: string;
  outerColor: string;
}

export interface NetworkNode<N extends NetworkNodeDatum> {
  data: N;
}

export interface NetworkPointNode<N extends NetworkNodeDatum>
  extends NetworkNode<N> {
  x: number;
  y: number;
}

export interface EventNetworkDatum extends NetworkNodeDatum {
  title: string;
  date: Date;
  type: EventType;
  image: string | undefined;
  groupBy: NetworkGroupBy[];
  actors: Actor[];
  groups: Group[];
  keywords: Keyword[];
  selected: boolean;
}

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

export type NetworkGraphOutput = Omit<
  t.TypeOf<typeof NetworkGraphOutput>,
  "events"
> & { events: EventNetworkDatum[] };
