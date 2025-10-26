import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { OptionFromNullishToNull } from "../../../io/http/Common/OptionFromNullishToNull.js";
import { Output } from "../../../io/http/Common/Output.js";
import { UUID } from "../../../io/http/Common/UUID.js";
import { SearchEvent } from "../../../io/http/Events/SearchEvents/SearchEvent.js";
import { GetSearchEventsQuery } from "../../../io/http/Events/SearchEvents/SearchEventsQuery.js";
import { PaginationQuery } from "../../../io/http/Query/PaginationQuery.js";
import * as http from "../../../io/http/index.js";

const SingleEventOutput = http.Common.Output(http.Events.Event).annotations({
  title: "Event",
});
export const ListEventOutput = Schema.Struct({
  data: Schema.Array(
    Schema.extend(
      Schema.Struct({
        score: Schema.Union(Schema.Number, Schema.Undefined),
      }),
      http.Events.Event,
    ).annotations({
      title: "EventWithScore",
    }),
  ),
  total: Schema.Number,
  totals: http.Events.SearchEvent.EventTotals.EventTotals,
  firstDate: Schema.Union(Schema.String, Schema.Undefined),
  lastDate: Schema.Union(Schema.String, Schema.Undefined),
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
    Body: http.Events.CreateEventBody,
  },
  Output: Output(
    Schema.Union(http.Events.Event, Schema.Struct({ success: Schema.Boolean })),
  ),
});

export const CreateSuggestion = Endpoint({
  Method: "POST",
  getPath: () => `/events/suggestions`,
  Input: {
    Body: http.EventSuggestion.CreateEventSuggestion,
  },
  Output: Schema.Struct({
    data: http.EventSuggestion.EventSuggestion,
  }).annotations({
    title: "CreateSuggestionOutput",
  }),
});

export const EditSuggestion = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: http.EventSuggestion.EventSuggestion,
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
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: SingleEventOutput,
});

export const GetFromLink = Endpoint({
  Method: "GET",
  getPath: () => `/events-from-link`,
  Input: {
    Query: Schema.Struct({ url: http.Common.URL, ...PaginationQuery.fields }),
  },
  Output: Schema.Struct({
    ...ListEventOutput.fields,
    suggestions: Schema.Array(http.EventSuggestion.CreateEventSuggestion),
  }).annotations({ title: "GetEventsFromLinkOutput" }),
});

export const GetSuggestion = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: { Params: Schema.Struct({ id: UUID }) },
  Output: http.Common.ListOutput(
    http.EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

export const GetSuggestions = Endpoint({
  Method: "GET",
  getPath: () => `/events/suggestions`,
  Input: {
    Query: Schema.Struct({
      ...http.Query.SortQuery.fields,
      ...http.Query.PaginationQuery.fields,
      status: OptionFromNullishToNull(
        http.EventSuggestion.EventSuggestionStatus,
      ),
      links: OptionFromNullishToNull(Schema.Array(UUID)),
      creator: OptionFromNullishToNull(UUID),
    }),
  },
  Output: http.Common.ListOutput(
    http.EventSuggestion.EventSuggestion,
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
  Output: http.Common.ListOutput(
    http.EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

const SearchEvents = Endpoint({
  Method: "GET",
  getPath: () => "/events/search",
  Input: {
    Query: GetSearchEventsQuery,
  },
  Output: http.Common.Output(
    Schema.Struct({
      events: Schema.Array(SearchEvent),
      total: Schema.Number,
      totals: http.Events.SearchEvent.EventTotals.EventTotals,
      actors: Schema.Array(http.Actor.Actor),
      groups: Schema.Array(http.Group.Group),
      groupsMembers: Schema.Array(http.GroupMember.GroupMember),
      media: Schema.Array(http.Media.Media),
      keywords: Schema.Array(http.Keyword.Keyword),
      links: Schema.Array(http.Link.Link),
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
    Body: http.Events.EditEventBody,
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
  },
});

export { events };
