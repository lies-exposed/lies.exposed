import { nonEmptyRecordFromType } from "@liexp/io/lib/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as IO from "@liexp/io/lib/http/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const List = Endpoint({
  Method: "GET",
  getPath: () => "/actor-relations",
  Input: {
    Query: IO.ActorRelation.GetListActorRelationQuery,
  },
  Output: IO.ActorRelation.ListActorRelationOutput,
});

const Create = Endpoint({
  Method: "POST",
  getPath: () => "/actor-relations",
  Input: {
    Query: undefined,
    Body: IO.ActorRelation.CreateActorRelation,
  },
  Output: IO.ActorRelation.SingleActorRelationOutput,
});

const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actor-relations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: IO.ActorRelation.SingleActorRelationOutput,
});

const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/actor-relations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: nonEmptyRecordFromType({
      actor: OptionFromNullishToNull(UUID),
      relatedActor: OptionFromNullishToNull(UUID),
      type: OptionFromNullishToNull(IO.ActorRelation.ActorRelationType),
      startDate: OptionFromNullishToNull(Schema.Date),
      endDate: OptionFromNullishToNull(Schema.Date),
      excerpt: OptionFromNullishToNull(BlockNoteDocument),
    }),
  },
  Output: IO.ActorRelation.SingleActorRelationOutput,
});

const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/actor-relations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: IO.ActorRelation.SingleActorRelationOutput,
});

const ActorRelationTree = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actor-relations/tree/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  // TODO: use the proper TreeMap type (Record<string, ActorNode>)
  Output: Schema.Any,
});
export const actorRelations = ResourceEndpoints({
  Create,
  Get,
  List,
  Edit,
  Delete,
  Custom: {
    Tree: ActorRelationTree,
  },
});
