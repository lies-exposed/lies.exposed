import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Color } from "./Common/Color.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { UUID } from "./Common/UUID.js";
import { GroupMember, type GroupMemberEncoded } from "./GroupMember.js";
import { CreateMedia, Media } from "./Media/Media.js";
import { Nation } from "./Nation.js";
import { GetListQuery } from "./Query/index.js";

export const ACTORS = Schema.Literal("actors").annotations({
  description: "Resource type identifier for actors",
});
export type ACTORS = typeof ACTORS.Type;

const GetListActorQueryStruct = Schema.Struct({
  ids: OptionFromNullishToNull(Schema.Array(UUID)).annotations({
    description: "Filter actors by specific UUIDs",
  }),
  memberIn: OptionFromNullishToNull(Schema.Array(UUID)).annotations({
    description: "Filter actors by group membership (group UUIDs)",
  }),
  withDeleted: OptionFromNullishToNull(Schema.BooleanFromString).annotations({
    description: "Include deleted actors in results",
  }),
});

export const GetListActorQueryFilter = Schema.partial(
  GetListActorQueryStruct,
).annotations({
  description: "Partial filter options for listing actors",
});

export type GetListActorQueryFilter = typeof GetListActorQueryFilter.Type;

export const GetListActorQuery = Schema.Struct({
  ...GetListQuery.fields,
  ...GetListActorQueryStruct.fields,
}).annotations({
  title: "GetListActorQuery",
  description:
    "Query parameters for listing actors with pagination and filtering",
});
export type GetListActorQuery = typeof GetListActorQuery.Type;

export const AddActorBody = Schema.Struct({
  username: Schema.String.annotations({
    description: "Unique username for the actor",
  }),
  fullName: Schema.String.annotations({
    description: "Full name of the actor",
  }),
  color: Schema.String.annotations({
    description: "Color associated with the actor (hex format, without #)",
  }),
  excerpt: BlockNoteDocument.annotations({
    description: "Short description of the actor as BlockNote document",
  }),
  nationalities: Schema.Array(UUID).annotations({
    description: "Array of nationality UUIDs",
  }),
  body: Schema.Union(
    BlockNoteDocument,
    Schema.Any,
    Schema.Undefined,
  ).annotations({
    description: "Full biography as BlockNote document",
  }),
  avatar: Schema.Union(UUID, CreateMedia, Schema.Undefined).annotations({
    description: "Avatar media UUID or media creation object",
  }),
  bornOn: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Birth date",
  }),
  diedOn: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Death date (if applicable)",
  }),
}).annotations({
  title: "AddActorBody",
  description: "Schema for creating a new actor with all required fields",
});

export type AddActorBody = typeof AddActorBody.Type;

export const SearchActorBody = Schema.Struct({
  search: Schema.String.annotations({
    description: "Search query to find or create an actor",
  }),
}).annotations({
  title: "SearchActorBody",
  description:
    "Schema for searching and potentially creating an actor by search query",
});
export const CreateActorBody = Schema.Union(
  SearchActorBody,
  AddActorBody,
).annotations({
  title: "CreateActorBody",
  description:
    "Schema for creating an actor either by search query or with full details",
});
export type CreateActorBody = typeof CreateActorBody.Type;

export const EditActorBody = Schema.Struct({
  username: OptionFromNullishToNull(Schema.String).annotations({
    description: "Unique username for the actor (null to keep current)",
  }),
  fullName: OptionFromNullishToNull(Schema.String).annotations({
    description: "Full name of the actor (null to keep current)",
  }),
  color: OptionFromNullishToNull(Schema.String).annotations({
    description:
      "Color associated with the actor in hex format without # (null to keep current)",
  }),
  excerpt: OptionFromNullishToNull(BlockNoteDocument).annotations({
    description:
      "Short description as BlockNote document (null to keep current)",
  }),
  body: OptionFromNullishToNull(BlockNoteDocument).annotations({
    description: "Full biography as BlockNote document (null to keep current)",
  }),
  avatar: OptionFromNullishToNull(UUID).annotations({
    description: "Avatar media UUID (null to keep current)",
  }),
  bornOn: OptionFromNullishToNull(Schema.String).annotations({
    description: "Birth date in ISO format (YYYY-MM-DD) (null to keep current)",
  }),
  diedOn: OptionFromNullishToNull(Schema.String).annotations({
    description: "Death date in ISO format (YYYY-MM-DD) (null to keep current)",
  }),
  nationalities: OptionFromNullishToNull(Schema.Array(UUID)).annotations({
    description: "Array of nationality UUIDs (null to keep current)",
  }),
  memberIn: OptionFromNullishToNull(
    Schema.Array(
      Schema.Union(
        UUID.annotations({
          description: "Existing group membership UUID",
        }),
        Schema.Struct({
          group: UUID.annotations({
            description: "Group UUID",
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
          description: "New group membership details",
        }),
      ),
    ),
  ).annotations({
    description: "Array of group memberships (null to keep current)",
  }),
}).annotations({
  title: "EditActorBody",
  description: "Schema for editing an existing actor with optional fields",
});
export type EditActorBody = typeof EditActorBody.Type;

const actorFields = {
  ...BaseProps.fields,
  fullName: Schema.String.annotations({
    description: "Full name of the actor",
  }),
  username: Schema.String.annotations({
    description: "Unique username identifier for the actor",
  }),
  avatar: Schema.Union(Media, Schema.Undefined).annotations({
    description: "Avatar media object",
  }),
  color: Color.annotations({
    description: "Color associated with the actor for UI display",
  }),
  nationalities: Schema.Array(Schema.Union(Nation, UUID)).annotations({
    description: "Array of nationalities (full objects or UUIDs)",
  }),
};

// Type interface for Actor (decoded/application type)
export interface Actor extends Schema.Struct.Type<typeof actorFields> {
  readonly memberIn: readonly (Schema.Schema.Type<typeof UUID> | GroupMember)[];
  readonly excerpt: Schema.Schema.Type<typeof BlockNoteDocument> | null;
  readonly body: Schema.Schema.Type<typeof BlockNoteDocument> | null;
  readonly bornOn: Date | undefined;
  readonly diedOn: Date | undefined;
  readonly death: Schema.Schema.Type<typeof UUID> | undefined;
}

// Encoded interface for Actor (wire format)
export interface ActorEncoded
  extends Schema.Struct.Encoded<typeof actorFields> {
  readonly memberIn: readonly (
    | Schema.Schema.Encoded<typeof UUID>
    | GroupMemberEncoded
  )[];
  readonly excerpt: Schema.Schema.Encoded<typeof BlockNoteDocument> | null;
  readonly body: Schema.Schema.Encoded<typeof BlockNoteDocument> | null;
  readonly bornOn: string | undefined;
  readonly diedOn: string | undefined;
  readonly death: Schema.Schema.Encoded<typeof UUID> | undefined;
}

export const Actor = Schema.Struct({
  ...actorFields,
  memberIn: Schema.Array(
    Schema.Union(
      UUID,
      Schema.suspend(
        (): Schema.Schema<GroupMember, GroupMemberEncoded> => GroupMember,
      ).annotations({
        description:
          "Array of group memberships (UUIDs or full membership objects)",
      }),
    ),
  ),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Short description of the actor as BlockNote document",
  }),
  body: Schema.Union(BlockNoteDocument, Schema.Null).annotations({
    description: "Full biography as BlockNote document",
  }),
  bornOn: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Birth date of the actor",
  }),
  diedOn: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    description: "Death date of the actor (if deceased)",
  }),
  death: Schema.Union(UUID, Schema.Undefined).annotations({
    description: "UUID of the death event (if applicable)",
  }),
}).annotations({
  title: "Actor",
  description: "Complete actor entity with all properties",
});
