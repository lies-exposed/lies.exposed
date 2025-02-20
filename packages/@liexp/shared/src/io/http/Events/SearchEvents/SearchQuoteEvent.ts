import type * as t from "io-ts";
import { BySubject } from "../../Common/index.js";
import * as Quote from "../Quote.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchQuoteEvent = SearchEventCodec(Quote.Quote, {
  subject: BySubject,
});

export type SearchQuoteEvent = t.TypeOf<typeof SearchQuoteEvent>;
