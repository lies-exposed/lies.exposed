import { type TypeOf } from "io-ts";
import * as Actor from "../../Actor.js";
import * as Death from "../Death.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchDeathEvent = SearchEventCodec(Death.Death, {
  victim: Actor.Actor,
});

export type SearchDeathEvent = TypeOf<typeof SearchDeathEvent>;
