import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID } from "./Common/UUID.js";
import { CreateMedia, Media } from "./Media/Media.js";
import { GetListQuery } from "./Query/index.js";

export const GROUPS = Schema.Literal("groups");
export type GROUPS = typeof GROUPS.Type;

export const GroupKind = Schema.Union(
  Schema.Literal("Public"),
  Schema.Literal("Private"),
).annotations({
  title: "GroupKind",
});
export type GroupKind = typeof GroupKind.Type;

export interface GroupC {
  id: Schema.String;
  createdAt: Schema.Date;
  updatedAt: Schema.Date;
  name: Schema.String;
  username: Schema.Union<[typeof Schema.String, typeof Schema.Undefined]>;
  kind: Schema.Union<[Schema.Literal<["Public"]>, Schema.Literal<["Private"]>]>;
  color: Schema.String;
  avatar: Schema.Union<[typeof Schema.String, typeof Schema.Undefined]>;
  members: Schema.Array$<typeof Schema.String>;
  subGroups: Schema.Array$<typeof Schema.Any>;
  body: Schema.String;
  body2: Schema.Union<[typeof BlockNoteDocument, typeof Schema.Undefined]>;
}

// export type GroupType = t.RecursiveType<t.ExactC<t.TypeC<GroupC>>>;
export type GroupType = any;

export const GetGroupListQuery = Schema.Struct({
  ...GetListQuery.fields,
  _sort: OptionFromNullishToNull(
    Schema.Union(
      Schema.Literal("id"),
      Schema.Literal("name"),
      Schema.Literal("createdAt"),
      Schema.Literal("updatedAt"),
    ),
  ),
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  members: OptionFromNullishToNull(Schema.Array(Schema.String)),
}).annotations({
  title: "GetGroupListQuery",
});
export type GetGroupListQuery = typeof GetGroupListQuery.Type;

export const CreateGroupBody = Schema.Struct({
  name: Schema.String,
  username: Schema.String,
  color: Schema.String,
  kind: GroupKind,
  avatar: Schema.Union(UUID, CreateMedia, Schema.Undefined),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Undefined),
  body: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Undefined),
  startDate: Schema.Union(Schema.Date, Schema.Undefined),
  endDate: Schema.Union(Schema.Date, Schema.Undefined),
  members: Schema.Array(
    Schema.Struct({
      actor: UUID,
      body: BlockNoteDocument,
      startDate: Schema.Date,
      endDate: OptionFromNullishToNull(Schema.Date),
    }).annotations({
      title: "CreateGroupMember",
    }),
  ),
}).annotations({
  title: "CreateGroupBody",
});

export type CreateGroupBody = typeof CreateGroupBody.Type;

export const EditGroupBody = Schema.Struct({
  ...CreateGroupBody.fields,
  members: Schema.Array(
    Schema.Union(
      UUID,
      Schema.Struct({
        actor: UUID,
        body: BlockNoteDocument,
        startDate: Schema.Date,
        endDate: OptionFromNullishToNull(Schema.Date),
      }).annotations({
        title: "CreateGroupMember",
      }),
    ),
  ),
}).annotations({
  title: "EditGroupBody",
});

export type EditGroupBody = typeof EditGroupBody.Type;

export const Group = Schema.Struct({
  ...BaseProps.fields,
  name: Schema.String,
  username: Schema.Union(Schema.String, Schema.Undefined),
  kind: GroupKind,
  color: Color,
  startDate: Schema.Union(Schema.Date, Schema.Undefined),
  endDate: Schema.Union(Schema.Date, Schema.Undefined),
  avatar: Schema.Union(Media, Schema.Undefined),
  subGroups: Schema.Array(Schema.String),
  members: Schema.Array(Schema.String),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null),
  body: Schema.Union(BlockNoteDocument, Schema.Null),
}).annotations({
  title: "Group",
});

export type Group = typeof Group.Type;

export const GroupOutput = Output(Group).annotations({
  title: "GroupOutput",
});
export type GroupOutput = Output<Group>;
export const GroupListOutput = ListOutput(Group, "ListGroup");
export type GroupListOutput = ListOutput<Group>;
