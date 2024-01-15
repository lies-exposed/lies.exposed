import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { BySubjectId } from "../Common/index.js";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent.js";
import { QUOTE } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const QuoteListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
  },
  "QuoteListQuery",
);
export type QuoteListQuery = t.TypeOf<typeof QuoteListQuery>;

export const QuotePayload = t.strict(
  {
    actor: t.union([UUID, t.undefined]),
    subject: t.union([BySubjectId, t.undefined]),
    quote: t.union([t.string, t.undefined]),
    details: t.union([t.string, t.undefined]),
  },
  "QuotePayload",
);
export type QuotePayload = t.TypeOf<typeof QuotePayload>;

export const CreateQuoteBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: QUOTE,
    payload: QuotePayload,
  },
  "CreateQuoteBody",
);
export type CreateQuoteBody = t.TypeOf<typeof CreateQuoteBody>;

export const EditQuoteBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: QUOTE,
    payload: QuotePayload,
  },
  "EditQuoteBody",
);

export type EditQuoteBody = t.TypeOf<typeof EditQuoteBody>;

export const Quote = t.strict(
  {
    ...EventCommon.type.props,
    type: QUOTE,
    payload: QuotePayload,
  },
  "Quote",
);

export type Quote = t.TypeOf<typeof Quote>;
