import * as t from "io-ts";
import * as EventTotals from "../EventTotals.js";
import { SearchBookEvent } from "./SearchBookEvent.js";
import { SearchDeathEvent } from "./SearchDeathEvent.js";
import { SearchDocumentaryEvent } from "./SearchDocumentaryEvent.js";
import * as SearchEventsQuery from "./SearchEventsQuery.js";
import { SearchPatentEvent } from "./SearchPatentEvent.js";
import { SearchQuoteEvent } from "./SearchQuoteEvent.js";
import { SearchScientificStudyEvent } from "./SearchScientificStudyEvent.js";
import { SearchTransactionEvent } from "./SearchTransactionEvent.js";
import { SearchUncategorizedEvent } from "./SearchUncategorizedEvent.js";

const SearchEvent = t.union(
  [
    SearchBookEvent,
    SearchDeathEvent,
    SearchDocumentaryEvent,
    SearchPatentEvent,
    SearchScientificStudyEvent,
    SearchTransactionEvent,
    SearchQuoteEvent,
    SearchUncategorizedEvent,
  ],
  "SearchEvent",
);

type SearchEvent = t.TypeOf<typeof SearchEvent>;

export {
  EventTotals,
  SearchEvent,
  SearchEventsQuery,
  type SearchBookEvent,
  type SearchDeathEvent,
  type SearchDocumentaryEvent,
  type SearchPatentEvent,
  type SearchQuoteEvent,
  type SearchScientificStudyEvent,
  type SearchTransactionEvent,
  type SearchUncategorizedEvent,
};
