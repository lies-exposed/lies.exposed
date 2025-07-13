import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { UUID } from "./Common/UUID.js";
import { CreateMedia, Media } from "./Media/Media.js";
import { Nation } from "./Nation.js";
import { GetListQuery } from "./Query/index.js";

export const ACTORS = Schema.Literal("actors");
export type ACTORS = typeof ACTORS.Type;

const GetListActorQueryStruct = Schema.Struct({
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  memberIn: OptionFromNullishToNull(Schema.Array(UUID)),
  withDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
});

export const GetListActorQueryFilter = Schema.partial(GetListActorQueryStruct);

export type GetListActorQueryFilter = typeof GetListActorQueryFilter.Type;

export const GetListActorQuery = Schema.Struct({
  ...GetListQuery.fields,
  ...GetListActorQueryStruct.fields,
}).annotations({
  title: "GetListActorQuery",
});
export type GetListActorQuery = typeof GetListActorQuery.Type;

export const AddActorBody = Schema.Struct({
  username: Schema.String,
  fullName: Schema.String,
  color: Schema.String,
  excerpt: BlockNoteDocument,
  nationalities: Schema.Array(UUID),
  body: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Undefined),
  avatar: Schema.Union(UUID, CreateMedia, Schema.Undefined),
  bornOn: Schema.Union(Schema.Date, Schema.Undefined),
  diedOn: Schema.Union(Schema.Date, Schema.Undefined),
}).annotations({
  title: "AddActorBody",
});

export type AddActorBody = typeof AddActorBody.Type;

export const SearchActorBody = Schema.Struct({
  search: Schema.String,
}).annotations({
  title: "SearchActorBody",
});
export const CreateActorBody = Schema.Union(
  SearchActorBody,
  AddActorBody,
).annotations({ title: "CreateActorBody" });
export type CreateActorBody = typeof CreateActorBody.Type;

export const Actor = Schema.Struct({
  ...BaseProps.fields,
  fullName: Schema.String,
  username: Schema.String,
  avatar: Schema.Union(Media, Schema.Undefined),
  color: Color,
  nationalities: Schema.Array(Schema.Union(Nation, UUID)),
  memberIn: Schema.Array(Schema.Union(UUID, Schema.Any)),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null),
  body: Schema.Union(BlockNoteDocument, Schema.Null),
  bornOn: Schema.Union(Schema.Date, Schema.Undefined),
  diedOn: Schema.Union(Schema.Date, Schema.Undefined),
  /**
   * The death event of the actor, if any
   */
  death: Schema.Union(UUID, Schema.Undefined),
}).annotations({
  title: "Actor",
});

export type Actor = typeof Actor.Type;
