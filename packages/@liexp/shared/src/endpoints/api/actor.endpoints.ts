import { nonEmptyRecordFromType } from "@liexp/io/lib/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import * as Actor from "@liexp/io/lib/http/Actor.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

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

export const Merge = Endpoint({
  Method: "POST",
  getPath: () => "/actors/merge",
  Input: {
    Body: Actor.MergeActorBody,
  },
  Output: SingleActorOutput,
});

// Link existing events to an actor
export const LinkEventsBody = Schema.Struct({
  eventIds: Schema.Array(UUID),
}).annotations({ identifier: "LinkActorEventsBody" });

export const LinkEventsOutput = Schema.Struct({
  data: Schema.Struct({
    linked: Schema.Array(UUID),
    failed: Schema.Array(
      Schema.Struct({
        eventId: UUID,
        reason: Schema.String,
      }),
    ),
  }),
}).annotations({ identifier: "LinkActorEventsOutput" });

export const LinkEvents = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/actors/${id}/events`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: LinkEventsBody,
  },
  Output: LinkEventsOutput,
});

// Unlink an event from an actor
export const UnlinkEvent = Endpoint({
  Method: "DELETE",
  getPath: ({ id, eventId }) => `/actors/${id}/events/${eventId}`,
  Input: {
    Params: Schema.Struct({ id: UUID, eventId: UUID }),
  },
  Output: Schema.Struct({
    data: Schema.Struct({ success: Schema.Boolean }),
  }),
});

export const actors = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    Merge,
    LinkEvents,
    UnlinkEvent,
  },
});
