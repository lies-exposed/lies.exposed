import { propsOmit } from "@liexp/core/lib/io/utils";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";
import { GetSearchEventsQuery } from "./SearchEventsQuery";

export const DOCUMENTARY = t.literal("Documentary");
export type DOCUMENTARY = t.TypeOf<typeof DOCUMENTARY>;

export const DocumentaryListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["type"]),
  },
  "DocumentaryListQuery"
);
export type DocumentaryListQuery = t.TypeOf<typeof DocumentaryListQuery>;

export const DocumentaryPayload = t.strict(
  {
    title: t.string,
    media: UUID,
    website: t.union([t.string, t.undefined]),
    authors: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
    subjects: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
  },
  "DocumentaryPayload"
);
export type DocumentaryPayload = t.TypeOf<typeof DocumentaryPayload>;

export const CreateDocumentaryBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: DOCUMENTARY,
    payload: DocumentaryPayload,
  },
  "CreateDocumentaryBody"
);

export type CreateDocumentaryBody = t.TypeOf<typeof CreateDocumentaryBody>;

export const EditDocumentaryBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: DOCUMENTARY,
    payload: DocumentaryPayload,
  },
  "EditDocumentaryBody"
);

export type EditDocumentaryBody = t.TypeOf<typeof EditDocumentaryBody>;

export const Documentary = t.strict(
  {
    ...EventCommon.type.props,
    type: DOCUMENTARY,
    payload: DocumentaryPayload,
  },
  "DocumentaryEvent"
);
export type Documentary = t.TypeOf<typeof Documentary>;
