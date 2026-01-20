import { BySubject } from "../../Common/index.js";
import * as Quote from "../Quote.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchQuoteEvent = SearchEventCodec(Quote.Quote.fields, {
  subject: BySubject,
});

export type SearchQuoteEvent = typeof SearchQuoteEvent.Type;
