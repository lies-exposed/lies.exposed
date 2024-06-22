import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { GetListQuery } from "./Query/index.js";

export const ACTORS = t.literal("actors");
export type ACTORS = t.TypeOf<typeof ACTORS>;

export const GetListActorQueryFilter = t.partial({
  ids: optionFromNullable(t.array(t.string)),
});

export type GetListActorQueryFilter = t.TypeOf<typeof GetListActorQueryFilter>;

export const GetListActorQuery = t.type(
  {
    ...GetListQuery.props,
    ...GetListActorQueryFilter.props,
  },
  "GetListActorQuery",
);
export type GetListActorQuery = t.TypeOf<typeof GetListActorQuery>;

export const AddActorBody = t.strict(
  {
    username: t.string,
    fullName: t.string,
    color: t.string,
    excerpt: BlockNoteDocument,
    body: t.union([BlockNoteDocument, t.any, t.undefined]),
    avatar: t.union([t.undefined, t.string]),
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
  },
  "AddActorBody",
);

export type AddActorBody = t.TypeOf<typeof AddActorBody>;

export const Actor = t.strict(
  {
    ...BaseProps.type.props,
    fullName: t.string,
    username: t.string,
    avatar: t.union([t.undefined, t.string]),
    color: Color,
    memberIn: t.array(t.string),
    death: t.union([t.undefined, t.string]),
    excerpt: t.union([BlockNoteDocument, t.any, t.null]),
    body: t.union([BlockNoteDocument, t.any, t.null]),
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
  },
  "Actor",
);

export type Actor = t.TypeOf<typeof Actor>;
