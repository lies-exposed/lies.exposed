import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "./Common/Output.js";
import { UUID } from "./Common/UUID.js";
import { CreateMedia, Media } from "./Media/Media.js";
import { GetListQuery } from "./Query/index.js";

export const GROUPS = Schema.Literal("groups").annotations({
  description: "Resource type identifier for groups",
});
export type GROUPS = typeof GROUPS.Type;

export const GroupKind = Schema.Union(
  Schema.Literal("Public"),
  Schema.Literal("Private"),
).annotations({
  title: "GroupKind",
  description: "Visibility type of a group (Public or Private)",
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
  ).annotations({
    description: "Sort groups by field (id, name, createdAt, or updatedAt)",
  }),
  ids: OptionFromNullishToNull(Schema.Array(UUID)).annotations({
    description: "Filter groups by specific UUIDs",
  }),
  members: OptionFromNullishToNull(Schema.Array(Schema.String)).annotations({
    description: "Filter groups by member actor IDs",
  }),
}).annotations({
  title: "GetGroupListQuery",
  description:
    "Query parameters for listing groups with pagination and filtering",
});
export type GetGroupListQuery = typeof GetGroupListQuery.Type;

export const AddGroupBody = Schema.Struct({
  name: Schema.String.annotations({
    description: "Name of the group",
  }),
  username: Schema.String.annotations({
    description: "Unique username identifier for the group",
  }),
  color: Schema.String.annotations({
    description: "Color associated with the group (hex format, without #)",
  }),
  kind: GroupKind.annotations({
    description: "Visibility type of the group (Public or Private)",
  }),
  avatar: Schema.Union(UUID, CreateMedia, Schema.Undefined).annotations({
    description: "Avatar media UUID or media creation object",
  }),
  excerpt: Schema.Union(
    BlockNoteDocument,
    Schema.Any,
    Schema.Undefined,
  ).annotations({
    description: "Short description of the group as BlockNote document",
  }),
  body: Schema.Union(
    BlockNoteDocument,
    Schema.Any,
    Schema.Undefined,
  ).annotations({
    description: "Full description as BlockNote document",
  }),
  startDate: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Group establishment or start date",
  }),
  endDate: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Group dissolution or end date (if applicable)",
  }),
  members: Schema.Array(
    Schema.Struct({
      actor: UUID.annotations({
        description: "Actor UUID for the member",
      }),
      body: BlockNoteDocument.annotations({
        description: "Description of the membership",
      }),
      startDate: Schema.Date.annotations({
        description: "Membership start date",
      }),
      endDate: OptionFromNullishToNull(Schema.Date).annotations({
        description: "Membership end date (null if still active)",
      }),
    }).annotations({
      title: "CreateGroupMember",
      description: "Group member details for creation",
    }),
  ).annotations({
    description: "Array of group members",
  }),
}).annotations({
  title: "AddGroupBody",
  description: "Schema for creating a new group with all required fields",
});

export type AddGroupBody = typeof AddGroupBody.Type;

export const CreateGroupBody = Schema.Union(
  Schema.Struct({
    search: Schema.String.annotations({
      description: "Search query to find or create a group",
    }),
  }),
  AddGroupBody,
).annotations({
  description:
    "Schema for creating a group either by search query or with full details",
});
export type CreateGroupBody = typeof CreateGroupBody.Type;

export const EditGroupBody = Schema.Struct({
  name: OptionFromNullishToNull(Schema.String).annotations({
    description: "Name of the group (null to keep current)",
  }),
  username: OptionFromNullishToNull(Schema.String).annotations({
    description:
      "Unique username identifier for the group (null to keep current)",
  }),
  color: OptionFromNullishToNull(Schema.String).annotations({
    description:
      "Color associated with the group in hex format without # (null to keep current)",
  }),
  kind: OptionFromNullishToNull(GroupKind).annotations({
    description:
      "Visibility type of the group (Public or Private) (null to keep current)",
  }),
  excerpt: OptionFromNullishToNull(BlockNoteDocument).annotations({
    description:
      "Short description as BlockNote document (null to keep current)",
  }),
  body: OptionFromNullishToNull(BlockNoteDocument).annotations({
    description:
      "Full description as BlockNote document (null to keep current)",
  }),
  avatar: OptionFromNullishToNull(UUID).annotations({
    description: "Avatar media UUID (null to keep current)",
  }),
  startDate: OptionFromNullishToNull(Schema.String).annotations({
    description:
      "Group establishment date in ISO format (YYYY-MM-DD) (null to keep current)",
  }),
  endDate: OptionFromNullishToNull(Schema.String).annotations({
    description:
      "Group dissolution date in ISO format (YYYY-MM-DD) (null to keep current)",
  }),
  members: OptionFromNullishToNull(
    Schema.Array(
      Schema.Union(
        UUID.annotations({
          description: "Existing member UUID",
        }),
        Schema.Struct({
          actor: UUID.annotations({
            description: "Actor UUID for the member",
          }),
          body: OptionFromNullishToNull(BlockNoteDocument).annotations({
            description: "Description of the membership (null if not provided)",
          }),
          startDate: Schema.Date.annotations({
            description: "Membership start date",
          }),
          endDate: OptionFromNullishToNull(Schema.Date).annotations({
            description: "Membership end date (null if still active)",
          }),
        }).annotations({
          title: "EditGroupMember",
          description: "Group member details for editing",
        }),
      ),
    ),
  ).annotations({
    description: "Array of group members (null to keep current)",
  }),
}).annotations({
  title: "EditGroupBody",
  description: "Schema for editing an existing group with optional fields",
});

export type EditGroupBody = typeof EditGroupBody.Type;

export const Group = Schema.Struct({
  ...BaseProps.fields,
  name: Schema.String.annotations({
    description: "Name of the group",
  }),
  username: Schema.Union(Schema.String, Schema.Undefined).annotations({
    description: "Unique username identifier for the group",
  }),
  kind: GroupKind.annotations({
    description: "Visibility type of the group (Public or Private)",
  }),
  color: Color.annotations({
    description: "Color associated with the group for UI display",
  }),
  startDate: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Group establishment or start date",
  }),
  endDate: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Group dissolution or end date (if applicable)",
  }),
  avatar: Schema.Union(Media, Schema.Undefined).annotations({
    description: "Avatar media object",
  }),
  subGroups: Schema.Array(Schema.String).annotations({
    description: "Array of sub-group UUIDs",
  }),
  members: Schema.Array(Schema.String).annotations({
    description: "Array of member UUIDs",
  }),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Short description of the group as BlockNote document",
  }),
  body: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Full description as BlockNote document",
  }),
}).annotations({
  title: "Group",
  description: "Complete group entity with all properties",
});

export type Group = typeof Group.Type;

export const GroupOutput = Output(Group).annotations({
  title: "GroupOutput",
  description: "API response wrapper for a single group",
});
export type GroupOutput = Output<Group>;
export const GroupListOutput = ListOutput(Group, "ListGroup").annotations({
  description: "API response wrapper for a list of groups with pagination",
});
export type GroupListOutput = ListOutput<Group>;
