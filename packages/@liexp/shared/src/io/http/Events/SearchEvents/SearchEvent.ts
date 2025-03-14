import { Schema } from "effect";
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

const SearchEvent = Schema.Union(
  SearchBookEvent,
  SearchDeathEvent,
  SearchDocumentaryEvent,
  SearchPatentEvent,
  SearchScientificStudyEvent,
  SearchTransactionEvent,
  SearchQuoteEvent,
  SearchUncategorizedEvent,
).annotations({
  title: "SearchEvent",
});

type SearchEvent = typeof SearchEvent.Type;

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
