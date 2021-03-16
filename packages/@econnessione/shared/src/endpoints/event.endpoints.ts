import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { Output, GetListOutput } from "../io/http/Common";
import { GetListQuery } from "./Query";

const SingleEventOutput = Output(http.Events.Event, "Event");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/events",
  Input: {
    Query: { ...GetListQuery.props, actors: optionFromNullable(t.string) },
  },
  Output: GetListOutput(http.Events.Event, "ListEvent"),
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
    Params: { id: t.string },
  },
  Output: SingleEventOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: { id: t.string },
    Body: http.Events.Uncategorized.EditEventBody,
  },
  Output: SingleEventOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/events/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleEventOutput,
});
