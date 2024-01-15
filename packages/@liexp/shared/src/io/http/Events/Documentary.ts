import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent.js";
import { DOCUMENTARY } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const DocumentaryListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
  },
  "DocumentaryListQuery",
);
export type DocumentaryListQuery = t.TypeOf<typeof DocumentaryListQuery>;

export const DocumentaryPayload = t.strict(
  {
    title: t.string,
    media: UUID,
    website: t.union([UUID, t.undefined]),
    authors: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
    subjects: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
  },
  "DocumentaryPayload",
);
export type DocumentaryPayload = t.TypeOf<typeof DocumentaryPayload>;
export const EditDocumentaryPayload = t.strict({
  ...DocumentaryPayload.type.props,
  website: t.union([UUID, t.undefined, t.null]),
});
export type EditDocumentaryPayload = t.TypeOf<typeof EditDocumentaryPayload>;

export const CreateDocumentaryBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: DOCUMENTARY,
    payload: EditDocumentaryPayload,
  },
  "CreateDocumentaryBody",
);

export type CreateDocumentaryBody = t.TypeOf<typeof CreateDocumentaryBody>;

export const EditDocumentaryBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: DOCUMENTARY,
    payload: EditDocumentaryPayload,
  },
  "EditDocumentaryBody",
);

export type EditDocumentaryBody = t.TypeOf<typeof EditDocumentaryBody>;

export const Documentary = t.strict(
  {
    ...EventCommon.type.props,
    type: DOCUMENTARY,
    payload: DocumentaryPayload,
  },
  "DocumentaryEvent",
);
export type Documentary = t.TypeOf<typeof Documentary>;
