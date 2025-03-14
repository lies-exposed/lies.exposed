import * as Actor from "../../Actor.js";
import * as Death from "../Death.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchDeathEvent = SearchEventCodec(Death.Death.fields, {
  victim: Actor.Actor,
});

export type SearchDeathEvent = typeof SearchDeathEvent.Type;
