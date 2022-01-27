import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { GetSearchEventsQuery } from "../io/http/Events/SearchEventsQuery";
import { ResourceEndpoints } from "./types";

const SingleEventOutput = http.Common.Output(http.Events.Event, "Event");

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/events`,
  Input: {
    Query: GetSearchEventsQuery.type,
  },
  Output: t.strict(
    {
      data: t.array(http.Events.Event),
      total: t.number,
      totals: t.strict({
        uncategorized: t.number,
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
    Body: http.Events.CreateEventBody,
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
    Body: http.Events.EditEventBody,
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
  Custom: {},
});

export { events };
