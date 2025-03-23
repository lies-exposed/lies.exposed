import { Schema } from "effect";
import { Actor, ACTORS } from "../Actor.js";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull.js";
import { UUID } from "../Common/UUID.js";
import { EventTotals } from "../Events/EventTotals.js";
import { EVENTS, type EventType } from "../Events/index.js";
import { Group, GROUPS } from "../Group.js";
import { Keyword, KEYWORDS } from "../Keyword.js";
import { Media } from "../Media/Media.js";

export const NetworkType = Schema.Union(
  KEYWORDS,
  ACTORS,
  GROUPS,
  EVENTS,
  Schema.Literal("hierarchy"),
).annotations({
  title: "NetworkType",
});
export type NetworkType = typeof NetworkType.Type;

export const NetworkGroupBy = Schema.Union(
  KEYWORDS,
  ACTORS,
  GROUPS,
).annotations({
  title: "NetworkGroupBy",
});
export type NetworkGroupBy = typeof NetworkGroupBy.Type;

export const GetNetworkQuery = Schema.Struct({
  ids: OptionFromNullishToNull(Schema.NonEmptyArray(UUID)),
  startDate: OptionFromNullishToNull(Schema.String),
  endDate: OptionFromNullishToNull(Schema.String),
  relations: OptionFromNullishToNull(Schema.Array(NetworkGroupBy)),
  emptyRelations: OptionFromNullishToNull(Schema.BooleanFromString),
  keywords: OptionFromNullishToNull(Schema.NonEmptyArray(UUID)),
  groups: OptionFromNullishToNull(Schema.NonEmptyArray(UUID)),
  actors: OptionFromNullishToNull(Schema.NonEmptyArray(UUID)),
}).annotations({
  title: "GetNetworkQuery",
});

export type GetNetworkQuery = typeof GetNetworkQuery.Type;
export type GetNetworkQuerySerialized = typeof GetNetworkQuery.Encoded;

export const GetNetworkParams = Schema.Struct({
  type: NetworkType,
  // id: UUID
}).annotations({
  title: "GetNetworkParams",
});
export type GetNetworkParams = typeof GetNetworkParams.Type;

export const NetworkLink = Schema.Struct({
  source: UUID,
  target: UUID,
  fill: Schema.String,
  value: Schema.Number,
  stroke: Schema.String,
  sourceType: NetworkType,
}).annotations({
  title: "NetworkLink",
});
export type NetworkLink = typeof NetworkLink.Type;

export interface NetworkNodeDatum {
  id: UUID;
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
  groupBy: readonly NetworkGroupBy[];
  actors: readonly Actor[];
  groups: readonly Group[];
  keywords: readonly Keyword[];
  selected: boolean;
}

export const NetworkGraphOutput = Schema.Struct({
  events: Schema.Array(Schema.Any),
  actors: Schema.Array(Actor),
  groups: Schema.Array(Group),
  keywords: Schema.Array(Keyword),
  media: Schema.Array(Media),
  eventLinks: Schema.Array(NetworkLink),
  selectedLinks: Schema.Array(NetworkLink),
  actorLinks: Schema.Array(NetworkLink),
  groupLinks: Schema.Array(NetworkLink),
  keywordLinks: Schema.Array(NetworkLink),
  startDate: Schema.Date,
  endDate: Schema.Date,
  totals: EventTotals,
}).annotations({
  title: "NetworkGraphOutput",
});

export type NetworkGraphOutput = Omit<
  typeof NetworkGraphOutput.Type,
  "events"
> & { events: EventNetworkDatum[] };
