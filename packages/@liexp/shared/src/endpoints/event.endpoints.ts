import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import {
  EventTotals,
  GetSearchEventsQuery,
} from "../io/http/Events/SearchEventsQuery";
import { ResourceEndpoints } from "./types";

const SingleEventOutput = http.Common.Output(http.Events.Event, "Event");
const ListEventOutput = t.strict(
  {
    data: t.array(
      t.intersection([
        http.Events.Event,
        t.partial({
          score: t.number,
        }),
      ])
    ),
    total: t.number,
    totals: EventTotals,
  },
  "Events"
);

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
    Query: t.type({ url: t.string }),
  },
  Output: ListEventOutput,
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
  Custom: {
    CreateFromLink,
    GetFromLink,
  },
});

export { events };
