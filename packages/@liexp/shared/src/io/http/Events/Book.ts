import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BySubjectId } from "../Common/BySubject.js";
import { UUID } from "../Common/index.js";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent.js";
import { BOOK } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const BookListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
    publisher: optionFromNullable(t.array(UUID)),
  },
  "BookListQuery",
);

export const BookPayload = t.strict(
  {
    title: t.string,
    media: t.strict({ pdf: UUID, audio: t.union([UUID, t.undefined]) }),
    authors: t.array(BySubjectId),
    publisher: t.union([BySubjectId, t.undefined]),
  },
  "BookPayload",
);

export type BookPayload = t.TypeOf<typeof BookPayload>;

export const CreateBookBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: BOOK,
    payload: BookPayload,
  },
  "CreateBookBody",
);
export type CreateBookBody = t.TypeOf<typeof CreateBookBody>;

export const EditBookBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: BOOK,
    payload: BookPayload,
  },
  "EditBookBody",
);
export type EditBookBody = t.TypeOf<typeof EditBookBody>;

export const Book = t.strict(
  {
    ...EventCommon.type.props,
    type: BOOK,
    payload: BookPayload,
  },
  "Book",
);
export type Book = t.TypeOf<typeof Book>;
