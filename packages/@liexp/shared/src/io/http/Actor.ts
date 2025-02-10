import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { CreateMedia, Media } from "./Media/Media.js";
import { GetListQuery } from "./Query/index.js";

export const ACTORS = t.literal("actors");
export type ACTORS = t.TypeOf<typeof ACTORS>;

export const GetListActorQueryFilter = t.partial({
  ids: optionFromNullable(t.array(t.string)),
  withDeleted: optionFromNullable(BooleanFromString),
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
    avatar: t.union([UUID, CreateMedia, t.undefined]),
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
  },
  "AddActorBody",
);

export type AddActorBody = t.TypeOf<typeof AddActorBody>;

export const SearchActorBody = t.type({ search: t.string }, "SearchActorBody");
export const CreateActorBody = t.union(
  [SearchActorBody, AddActorBody],
  "CreateActorBody",
);
export type CreateActorBody = t.TypeOf<typeof CreateActorBody>;

export const Actor = t.strict(
  {
    ...BaseProps.type.props,
    fullName: t.string,
    username: t.string,
    avatar: t.union([Media, t.undefined]),
    color: Color,
    memberIn: t.array(t.union([UUID, t.any])),
    excerpt: t.union([BlockNoteDocument, t.null]),
    body: t.union([BlockNoteDocument, t.null]),
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
    /**
     * The death event of the actor, if any
     */
    death: t.union([UUID, t.undefined]),
  },
  "Actor",
);

export type Actor = t.TypeOf<typeof Actor>;
