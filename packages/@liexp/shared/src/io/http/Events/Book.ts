import { Schema } from "effect";
import { BySubjectId } from "../Common/BySubject.js";
import { UUID } from "../Common/index.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { BOOK } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const BookListQuery = Schema.Struct({
  ...GetSearchEventsQuery.omit("eventType").fields,
  publisher: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({
  title: "BookListQuery",
});

export const BookPayload = Schema.Struct({
  title: Schema.String,
  media: Schema.Struct({
    pdf: UUID,
    audio: Schema.Union(UUID, Schema.Undefined),
  }),
  authors: Schema.Array(BySubjectId),
  publisher: Schema.Union(BySubjectId, Schema.Undefined),
}).annotations({
  title: "BookPayload",
});

export type BookPayload = typeof BookPayload.Type;

export const CreateBookBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: BOOK,
  payload: BookPayload,
}).annotations({
  title: "CreateBookBody",
});
export type CreateBookBody = typeof CreateBookBody.Type;

export const EditBookBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: BOOK,
  payload: BookPayload,
}).annotations({
  title: "EditBookBody",
});
export type EditBookBody = typeof EditBookBody.Type;

export const Book = Schema.Struct({
  ...EventCommon.fields,
  type: BOOK,
  payload: BookPayload,
}).annotations({
  title: "Book",
});
export type Book = typeof Book.Type;
