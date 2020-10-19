import * as t from "io-ts"
import { FundFrontmatter } from "./Fund"
import { ProtestFrontmatter } from "./Protest"

export const Event = t.union([FundFrontmatter, ProtestFrontmatter], "Event")
export type Event = t.TypeOf<typeof Event>
