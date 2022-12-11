import * as t from "io-ts";
import { ACTORS } from "./Actor";
import { GROUPS } from "./Group";
import { KEYWORDS } from "./Keyword";

export const StatsType = t.union([KEYWORDS, ACTORS, GROUPS], "StatsType");
export type StatsType = t.TypeOf<typeof StatsType>;
