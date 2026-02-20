import * as Actor from "@liexp/io/lib/http/Actor.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as EventSuggestion from "@liexp/io/lib/http/EventSuggestion.js";
import * as Events from "@liexp/io/lib/http/Events/index.js";
import { EventType } from "@liexp/io/lib/http/Events/EventType.js";
import { SearchEvent } from "@liexp/io/lib/http/Events/SearchEvents/SearchEvent.js";
import { GetSearchEventsQuery } from "@liexp/io/lib/http/Events/SearchEvents/SearchEventsQuery.js";
import * as Group from "@liexp/io/lib/http/Group.js";
import * as GroupMember from "@liexp/io/lib/http/GroupMember.js";
import * as Keyword from "@liexp/io/lib/http/Keyword.js";
import * as Link from "@liexp/io/lib/http/Link.js";
import * as Media from "@liexp/io/lib/http/Media/index.js";
import { PaginationQuery } from "@liexp/io/lib/http/Query/PaginationQuery.js";
import { SortQuery } from "@liexp/io/lib/http/Query/SortQuery.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleEventOutput = Output(Events.Event).annotations({
  title: "Event",
});
export const ListEventOutput = Schema.Struct({
  data: Schema.Array(
    Schema.extend(
      Schema.Struct({
        score: Schema.Union(Schema.Number, Schema.Undefined),
      }),
      Events.Event,
    ).annotations({
      title: "EventWithScore",
    }),
  ),
  total: Schema.Number,
  totals: Events.SearchEvent.EventTotals.EventTotals,
  firstDate: Schema.Union(Schema.String, Schema.Undefined),
  lastDate: Schema.Union(Schema.String, Schema.Undefined),
  // Optional relations - populated when `relations` query param is provided
  actors: Schema.optional(Schema.Array(Actor.Actor)),
  groups: Schema.optional(Schema.Array(Group.Group)),
  keywords: Schema.optional(Schema.Array(Keyword.Keyword)),
  media: Schema.optional(Schema.Array(Media.Media)),
  links: Schema.optional(Schema.Array(Link.Link)),
  groupsMembers: Schema.optional(Schema.Array(GroupMember.GroupMember)),
}).annotations({
  title: "Events",
});
export type ListEventOutput = typeof ListEventOutput.Type;

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/events`,
  Input: {
    Query: GetSearchEventsQuery,
  },
  Output: ListEventOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/events",
  Input: {
    Body: Events.CreateEventBody,
  },
  Output: Output(
    Schema.Union(Events.Event, Schema.Struct({ success: Schema.Boolean })),
  ),
});

export const CreateSuggestion = Endpoint({
  Method: "POST",
  getPath: () => `/events/suggestions`,
  Input: {
    Body: EventSuggestion.CreateEventSuggestion,
  },
  Output: Schema.Struct({
    data: EventSuggestion.EventSuggestion,
  }).annotations({
    title: "CreateSuggestionOutput",
  }),
});

export const EditSuggestion = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: EventSuggestion.EventSuggestion,
  },
  Output: Schema.Struct({
    data: Schema.Any,
  }).annotations({
    title: "CreateSuggestionOutput",
  }),
});

export const DeleteSuggestion = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Struct({
    data: Schema.Any,
  }).annotations({
    title: "DeleteSuggestionOutput",
  }),
});

export const CreateFromSuggestion = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/events/suggestions/${id}/event`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Unknown,
  },
  Output: Schema.Struct({
    data: Schema.Any,
  }),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleEventOutput,
});

export const GetFromLink = Endpoint({
  Method: "GET",
  getPath: () => `/events-from-link`,
  Input: {
    Query: Schema.Struct({ url: URL, ...PaginationQuery.fields }),
  },
  Output: Schema.Struct({
    ...ListEventOutput.fields,
    suggestions: Schema.Array(EventSuggestion.CreateEventSuggestion),
  }).annotations({ title: "GetEventsFromLinkOutput" }),
});

export const GetSuggestion = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: { Params: Schema.Struct({ id: UUID }) },
  Output: ListOutput(
    EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

export const GetSuggestions = Endpoint({
  Method: "GET",
  getPath: () => `/events/suggestions`,
  Input: {
    Query: Schema.Struct({
      ...SortQuery.fields,
      ...PaginationQuery.fields,
      status: OptionFromNullishToNull(
        EventSuggestion.EventSuggestionStatus,
      ),
      links: OptionFromNullishToNull(Schema.Array(UUID)),
      creator: OptionFromNullishToNull(UUID),
    }),
  },
  Output: ListOutput(
    EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

export const SearchEventsFromProvider = Endpoint({
  Method: "POST",
  getPath: () => `/events/suggestions-by-provider`,
  Input: {
    Body: Schema.Struct({
      query: Schema.String,
      page: Schema.Number,
      providers: Schema.Array(Schema.String),
      keywords: Schema.Array(Schema.String),
      date: OptionFromNullishToNull(Schema.String),
    }),
  },
  Output: ListOutput(
    EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

const SearchEvents = Endpoint({
  Method: "GET",
  getPath: () => "/events/search",
  Input: {
    Query: GetSearchEventsQuery,
  },
  Output: Output(
    Schema.Struct({
      events: Schema.Array(SearchEvent),
      total: Schema.Number,
      totals: Events.SearchEvent.EventTotals.EventTotals,
      actors: Schema.Array(Actor.Actor),
      groups: Schema.Array(Group.Group),
      groupsMembers: Schema.Array(GroupMember.GroupMember),
      media: Schema.Array(Media.Media),
      keywords: Schema.Array(Keyword.Keyword),
      links: Schema.Array(Link.Link),
      firstDate: Schema.Union(Schema.String, Schema.Undefined),
      lastDate: Schema.Union(Schema.String, Schema.Undefined),
    }).annotations({
      title: "Data",
    }),
  ).annotations({
    title: "SearchEvents",
  }),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.EditEventBody,
  },
  Output: SingleEventOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleEventOutput,
});

export const EditManyEvents = Endpoint({
  Method: "PUT",
  getPath: () => `/events`,
  Input: {
    Body: Schema.Struct({
      params: Schema.Struct({
        action: Schema.Literal("merge"),
        ids: Schema.Array(UUID),
        toType: EventType,
      }),
    }),
  },
  Output: SingleEventOutput,
});

const events = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: {
    CreateSuggestion,
    EditSuggestion,
    DeleteSuggestion,
    CreateFromSuggestion,
    GetFromLink,
    GetSuggestions,
    GetSuggestion,
    SearchEventsFromProvider,
    SearchEvents,
    EditManyEvents,
  },
});

export { events };
