import { Schema } from "effect";
import { BySubjectId, UUID } from "../Common/index.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { QUOTE } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const QuoteListQuery = Schema.Struct({
  ...GetSearchEventsQuery.omit("eventType").fields,
}).annotations({
  title: "QuoteListQuery",
});
export type QuoteListQuery = typeof QuoteListQuery.Type;

export const QuotePayload = Schema.Struct({
  actor: Schema.Union(UUID, Schema.Undefined),
  subject: Schema.Union(BySubjectId, Schema.Undefined),
  quote: Schema.Union(Schema.String, Schema.Undefined),
  details: Schema.Union(Schema.String, Schema.Undefined),
}).annotations({
  title: "QuotePayload",
});
export type QuotePayload = typeof QuotePayload.Type;

export const CreateQuoteBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: QUOTE,
  payload: QuotePayload,
}).annotations({
  title: "CreateQuoteBody",
});

export type CreateQuoteBody = typeof CreateQuoteBody.Type;

export const EditQuoteBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: QUOTE,
  payload: QuotePayload,
}).annotations({
  title: "EditQuoteBody",
});

export type EditQuoteBody = typeof EditQuoteBody.Type;

export const Quote = Schema.Struct({
  ...EventCommon.fields,
  type: QUOTE,
  payload: QuotePayload,
}).annotations({
  title: "Quote",
});

export type Quote = typeof Quote.Type;
