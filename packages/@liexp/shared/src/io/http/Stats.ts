import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { ACTORS } from "./Actor.js";
import { ListOutput, Output } from "./Common/Output.js";
import { GROUPS } from "./Group.js";
import { KEYWORDS } from "./Keyword.js";

export const StatsType = t.union([KEYWORDS, ACTORS, GROUPS], "StatsType");
export type StatsType = t.TypeOf<typeof StatsType>;

export const Stats = t.strict(
  {
    actors: t.record(UUID, t.number),
    groups: t.record(UUID, t.number),
    keywords: t.record(UUID, t.number),
  },
  "Stats",
);
export type Stats = t.TypeOf<typeof Stats>;

export const SingleOutput = Output(Stats, "Stats");
export type SingleOutput = Output<Stats>;
export const OutputList = ListOutput(Stats, "StatsList");
export type OutputList = ListOutput<Stats>;
