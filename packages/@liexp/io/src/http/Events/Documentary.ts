import { Schema } from "effect";
import { UUID } from "../Common/UUID.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { DOCUMENTARY } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const DocumentaryListQuery = GetSearchEventsQuery.omit(
  "eventType",
).annotations({
  title: "DocumentaryListQuery",
});

export type DocumentaryListQuery = typeof DocumentaryListQuery.Type;

export const DocumentaryPayload = Schema.Struct({
  title: Schema.String,
  media: UUID,
  website: Schema.Union(UUID, Schema.Undefined),
  authors: Schema.Struct({
    actors: Schema.Array(UUID),
    groups: Schema.Array(UUID),
  }),
  subjects: Schema.Struct({
    actors: Schema.Array(UUID),
    groups: Schema.Array(UUID),
  }),
}).annotations({
  title: "DocumentaryPayload",
});
export type DocumentaryPayload = typeof DocumentaryPayload.Type;
export const EditDocumentaryPayload = Schema.Struct({
  ...DocumentaryPayload.fields,
  website: Schema.Union(UUID, Schema.Undefined, Schema.Null),
});
export type EditDocumentaryPayload = typeof EditDocumentaryPayload.Type;

export const CreateDocumentaryBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: DOCUMENTARY,
  payload: EditDocumentaryPayload,
}).annotations({
  title: "CreateDocumentaryBody",
});

export type CreateDocumentaryBody = typeof CreateDocumentaryBody.Type;

export const EditDocumentaryBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: DOCUMENTARY,
  payload: EditDocumentaryPayload,
}).annotations({
  title: "EditDocumentaryBody",
});

export type EditDocumentaryBody = typeof EditDocumentaryBody.Type;

export const Documentary = Schema.Struct({
  ...EventCommon.fields,
  type: DOCUMENTARY,
  payload: DocumentaryPayload,
}).annotations({
  title: "DocumentaryEvent",
});
export type Documentary = typeof Documentary.Type;
