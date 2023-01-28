import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/BooleanFromString";
import { UUID } from "io-ts-types/UUID";
import { optionFromNullable } from "io-ts-types/optionFromNullable";
import { ACTORS } from "./Actor";
import { GROUPS } from "./Group";
import { KEYWORDS } from "./Keyword";

export const NetworkType = t.union([KEYWORDS, ACTORS, GROUPS], "NetworkType");
export type NetworkType = t.TypeOf<typeof NetworkType>;

export const NetworkGroupBy = t.union(
  [KEYWORDS, ACTORS, GROUPS],
  "NetworkGroupBy"
);
export type NetworkGroupBy = t.TypeOf<typeof NetworkGroupBy>;

export const GetNetworkQuery = t.type(
  {
    startDate: optionFromNullable(t.string),
    endDate: optionFromNullable(t.string),
    groupBy: NetworkGroupBy,
    relation: NetworkGroupBy,
    emptyRelations: optionFromNullable(BooleanFromString),
  },
  "GetNetworkQuery"
);

export type GetNetworkQuery = t.TypeOf<typeof GetNetworkQuery>;

export const GetNetworkParams = t.type(
  {
    type: NetworkType,
    id: UUID,
  },
  "GetNetworkParams"
);
export type GetNetworkParams = t.TypeOf<typeof GetNetworkParams>;
