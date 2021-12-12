import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { ResourceEndpoints } from "./types";

const SingleEventOutput = http.Common.Output(http.Events.Event, "Event");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/events",
  Input: {
    Query: http.Events.Uncategorized.GetEventsQueryFilter,
  },
  Output: http.Common.ListOutput(http.Events.Event, "ListEvent"),
});

export const Search = Endpoint({
  Method: "GET",
  getPath: () => `/events/search`,
  Input: {
    Query: http.Events.Uncategorized.GetEventsQueryFilter,
  },
  Output: t.strict(
    {
      data: t.array(http.Events.SearchEvent),
      totals: t.strict({
        events: t.number,
        deaths: t.number,
        scientificStudies: t.number,
      }),
    },
    "Events"
  ),
});

export const SearchV2 = Endpoint({
  Method: "GET",
  getPath: () => `/v2/events/search`,
  Input: {
    Query: http.Events.Uncategorized.GetEventsQueryFilter,
  },
  Output: t.strict(
    {
      data: t.array(http.Events.EventV2),
      totals: t.strict({
        events: t.number,
        deaths: t.number,
        scientificStudies: t.number,
      }),
    },
    "Events"
  ),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/events",
  Input: {
    Body: http.Events.Uncategorized.CreateEventBody,
  },
  Output: SingleEventOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleEventOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: http.Events.Uncategorized.EditEventBody,
  },
  Output: SingleEventOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
    Search,
    SearchV2
  },
});

export { events };
