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

export const events = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
});
