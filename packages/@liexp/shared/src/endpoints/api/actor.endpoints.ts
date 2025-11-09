import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { nonEmptyRecordFromType } from "../../io/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "../../io/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "../../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/index.js";
import { Actor } from "../../io/http/index.js";

export const SingleActorOutput = Output(Actor.Actor).annotations({
  identifier: "SingleActorOutput",
});
export type SingleActorOutput = typeof SingleActorOutput.Type;

export const ListActorOutput = ListOutput(Actor.Actor, "Actors");
export type ListActorOutput = typeof ListActorOutput.Type;

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/actors",
  Input: {
    Query: Actor.GetListActorQuery,
  },
  Output: ListActorOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleActorOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/actors",
  Input: {
    Query: undefined,
    Body: Actor.CreateActorBody,
  },
  Output: Output(
    Schema.Union(
      Actor.Actor,
      Schema.Struct({
        success: Schema.Boolean,
      }),
    ),
  ),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: nonEmptyRecordFromType({
      ...Actor.EditActorBody.fields,
      // Override for HTTP endpoint - dates come as Date objects from HTTP
      bornOn: OptionFromNullishToNull(Schema.Date),
      diedOn: OptionFromNullishToNull(Schema.Date),
      // Override for HTTP endpoint - BlockNote comes as arrays
      excerpt: OptionFromNullishToNull(Schema.Array(Schema.Any)),
      body: OptionFromNullishToNull(Schema.Array(Schema.Any)),
      memberIn: OptionFromNullishToNull(
        Schema.Array(
          Schema.Union(
            UUID,
            Schema.Struct({
              group: UUID,
              body: Schema.Union(BlockNoteDocument, Schema.Null),
              startDate: Schema.Date,
              endDate: OptionFromNullishToNull(Schema.Date),
            }),
          ),
        ),
      ),
    }).annotations({
      title: "EditActorBody",
    }),
  },
  Output: SingleActorOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleActorOutput,
});

export const actors = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {},
});
