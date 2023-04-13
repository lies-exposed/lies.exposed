import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/BooleanFromString";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from "io-ts-types/UUID";
import { nonEmptyArray } from "io-ts-types/nonEmptyArray";
import { optionFromNullable } from "io-ts-types/optionFromNullable";
import { Actor, ACTORS } from "./Actor";
import { Group, GROUPS } from "./Group";
import { Keyword, KEYWORDS } from "./Keyword";
import { Media } from "./Media";

export const NetworkType = t.union(
  [KEYWORDS, ACTORS, GROUPS, t.literal("events"), t.literal('hierarchy')],
  "NetworkType"
);
export type NetworkType = t.TypeOf<typeof NetworkType>;

export const NetworkGroupBy = t.union(
  [KEYWORDS, ACTORS, GROUPS],
  "NetworkGroupBy"
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
  "GetNetworkQuery"
);

export type GetNetworkQuery = t.TypeOf<typeof GetNetworkQuery>;

export const GetNetworkParams = t.type(
  {
    type: NetworkType,
    id: UUID
  },
  "GetNetworkParams"
);
export type GetNetworkParams = t.TypeOf<typeof GetNetworkParams>;

export const NetworkGraphOutput = t.strict(
  {
    events: t.array(t.any),
    actors: t.array(Actor),
    groups: t.array(Group),
    keywords: t.array(Keyword),
    media: t.array(Media),
    eventLinks: t.array(t.any),
    selectedLinks: t.array(t.any),
    actorLinks: t.array(t.any),
    groupLinks: t.array(t.any),
    keywordLinks: t.array(t.any),
    startDate: DateFromISOString,
    endDate: DateFromISOString,
  },
  "NetworkGraphOutput"
);

export type NetworkGraphOutput = t.TypeOf<typeof NetworkGraphOutput>;
