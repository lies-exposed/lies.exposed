import { Schema } from "effect";
import { ACTORS } from "./Actor.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID } from "./Common/UUID.js";
import { GROUPS } from "./Group.js";
import { KEYWORDS } from "./Keyword.js";

export const StatsType = Schema.Union(KEYWORDS, ACTORS, GROUPS).annotations({
  title: "StatsType",
});
export type StatsType = typeof StatsType.Type;

export const Stats = Schema.Struct({
  actors: Schema.Record({ key: UUID, value: Schema.Number }),
  groups: Schema.Record({ key: UUID, value: Schema.Number }),
  keywords: Schema.Record({ key: UUID, value: Schema.Number }),
}).annotations({
  title: "Stats",
});
export type Stats = typeof Stats.Type;

export const SingleOutput = Output(Stats).annotations({
  title: "StatsOutput",
});
export type SingleOutput = Output<Stats>;
export const OutputList = ListOutput(Stats, "StatsList");
export type OutputList = ListOutput<Stats>;
