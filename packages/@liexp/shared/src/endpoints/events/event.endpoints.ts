import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { GetSearchEventsQuery } from "../../io/http/Events/SearchEvents/SearchEventsQuery.js";
import { PaginationQuery } from "../../io/http/Query/PaginationQuery.js";
import * as http from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

const SingleEventOutput = http.Common.Output(http.Events.Event, "Event");
export const ListEventOutput = t.strict(
  {
    data: t.array(
      t.intersection(
        [
          http.Events.Event,
          t.partial({
            score: t.number,
          }),
        ],
        "EventWithScore",
      ),
      "Data",
    ),
    total: t.number,
    totals: http.Events.SearchEvent.EventTotals.EventTotals,
    firstDate: t.union([t.string, t.undefined]),
    lastDate: t.union([t.string, t.undefined]),
  },
  "Events",
);
export type ListEventOutput = t.TypeOf<typeof ListEventOutput>;

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/events`,
  Input: {
    Query: GetSearchEventsQuery.type,
  },
  Output: ListEventOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/events",
  Input: {
    Body: http.Events.CreateEventBody,
  },
  Output: SingleEventOutput,
});

export const CreateFromLink = Endpoint({
  Method: "POST",
  getPath: () => `/events/from-link`,
  Input: {
    Body: t.strict({
      url: t.string,
    }),
  },
  Output: SingleEventOutput,
});

export const CreateSuggestion = Endpoint({
  Method: "POST",
  getPath: () => `/events/suggestions`,
  Input: {
    Body: http.EventSuggestion.CreateEventSuggestion,
  },
  Output: t.strict(
    {
      data: t.any,
    },
    "CreateSuggestionOutput",
  ),
});

export const EditSuggestion = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: http.EventSuggestion.EventSuggestion,
  },
  Output: t.strict(
    {
      data: t.any,
    },
    "CreateSuggestionOutput",
  ),
});

export const DeleteSuggestion = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.strict(
    {
      data: t.any,
    },
    "DeleteSuggestionOutput",
  ),
});

export const CreateFromSuggestion = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/events/suggestions/${id}/event`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.unknown,
  },
  Output: t.strict({
    data: t.any,
  }),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleEventOutput,
});

export const GetFromLink = Endpoint({
  Method: "GET",
  getPath: () => `/events-from-link`,
  Input: {
    Query: t.type({ url: http.Common.URL, ...PaginationQuery.props }),
  },
  Output: t.intersection(
    [
      ListEventOutput,
      t.type({
        suggestions: t.array(http.EventSuggestion.CreateEventSuggestion),
      }),
    ],
    "GetEventsFromLinkOutput",
  ),
});

export const GetSuggestion = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/suggestions/${id}`,
  Input: { Params: t.type({ id: UUID }) },
  Output: http.Common.ListOutput(
    http.EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

export const GetSuggestions = Endpoint({
  Method: "GET",
  getPath: () => `/events/suggestions`,
  Input: {
    Query: t.type({
      ...http.Query.SortQuery.props,
      ...http.Query.PaginationQuery.props,
      status: optionFromNullable(http.EventSuggestion.EventSuggestionStatus),
      links: optionFromNullable(t.array(UUID)),
      creator: optionFromNullable(UUID),
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
    Body: t.type({
      q: t.string,
      p: t.number,
      providers: t.array(t.string),
      keywords: t.array(t.string),
      date: optionFromNullable(t.string),
    }),
  },
  Output: http.Common.ListOutput(
    http.EventSuggestion.EventSuggestion,
    "EventSuggestionListOutput",
  ),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: http.Events.EditEventBody,
  },
  Output: SingleEventOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
    CreateFromLink,
    CreateSuggestion,
    EditSuggestion,
    DeleteSuggestion,
    CreateFromSuggestion,
    GetFromLink,
    GetSuggestions,
    GetSuggestion,
    SearchEventsFromProvider,
  },
});

export { events };
