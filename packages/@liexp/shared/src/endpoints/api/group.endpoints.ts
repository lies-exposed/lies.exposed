import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { OptionFromNullishToNull } from "../../io/http/Common/OptionFromNullishToNull.js";
import { Output, UUID } from "../../io/http/Common/index.js";
import * as Group from "../../io/http/Group.js";
import { GetListQuery } from "../../io/http/Query/index.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      _sort: OptionFromNullishToNull(
        Schema.Union(
          Schema.Literal("id"),
          Schema.Literal("name"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ),
      name: OptionFromNullishToNull(Schema.String),
      username: OptionFromNullishToNull(Schema.String),
      ids: OptionFromNullishToNull(Schema.Array(UUID)),
      members: OptionFromNullishToNull(Schema.Array(Schema.String)),
      excludeIds: OptionFromNullishToNull(Schema.Array(UUID)),
    }),
  },
  Output: Group.GroupListOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: Group.CreateGroupBody,
  },
  Output: Output(
    Schema.Union(
      Group.Group,
      Schema.Struct({
        success: Schema.Boolean,
      }),
    ),
  ),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Group.GroupOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Struct({
      ...Group.EditGroupBody.fields,
      startDate: OptionFromNullishToNull(Schema.Date),
      endDate: OptionFromNullishToNull(Schema.Date),
      excerpt: OptionFromNullishToNull(Schema.Array(Schema.Any)),
      body: OptionFromNullishToNull(Schema.Array(Schema.Any)),
      members: OptionFromNullishToNull(
        Schema.Array(
          Schema.Union(
            UUID,
            Schema.Struct({
              actor: UUID,
              body: OptionFromNullishToNull(Schema.Array(Schema.Any)),
              startDate: Schema.Date,
              endDate: OptionFromNullishToNull(Schema.Date),
            }),
          ),
        ),
      ),
    }),
  },
  Output: Group.GroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Group.GroupOutput,
});

// Link existing events to a group
export const LinkEventsBody = Schema.Struct({
  eventIds: Schema.Array(UUID),
}).annotations({ identifier: "LinkGroupEventsBody" });

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
}).annotations({ identifier: "LinkGroupEventsOutput" });

export const LinkEvents = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/groups/${id}/events`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: LinkEventsBody,
  },
  Output: LinkEventsOutput,
});

// Unlink an event from a group
export const UnlinkEvent = Endpoint({
  Method: "DELETE",
  getPath: ({ id, eventId }) => `/groups/${id}/events/${eventId}`,
  Input: {
    Params: Schema.Struct({ id: UUID, eventId: UUID }),
  },
  Output: Schema.Struct({
    data: Schema.Struct({ success: Schema.Boolean }),
  }),
});

export const groups = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {
    LinkEvents,
    UnlinkEvent,
  },
});
