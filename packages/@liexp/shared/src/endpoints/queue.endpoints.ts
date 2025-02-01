import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import * as Queue from "../io/http/Queue/index.js";
import { ResourceEndpoints } from "./types.js";

const SingleQueueOutput = Output(Queue.Queue, "Queue");

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/queues`,
  Input: {
    Query: Queue.GetQueueListQuery,
  },
  Output: ListOutput(Queue.Queue, "Queues"),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: ({ type, resource }) => `/queues/${type}/${resource}`,
  Input: {
    Params: t.type({
      resource: Queue.QueueResourceNames,
      type: Queue.QueueTypes,
    }),
    Body: Queue.CreateQueue,
  },
  Output: SingleQueueOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ type, resource, id }) => `/queues/${type}/${resource}/${id}`,
  Input: {
    Params: Queue.GetQueueParams,
  },
  Output: SingleQueueOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ type, resource, id }) => `/queues/${type}/${resource}/${id}`,
  Input: {
    Params: Queue.GetQueueParams,
    Body: Queue.Queue,
  },
  Output: SingleQueueOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ type, resource, id }) => `/queues/${type}/${resource}/${id}`,
  Input: {
    Params: Queue.GetQueueParams,
  },
  Output: SingleQueueOutput,
});

const ProcessJob = Endpoint({
  Method: "POST",
  getPath: ({ type, resource, id }) =>
    `/queues/${type}/${resource}/${id}/process`,
  Input: {
    Params: Queue.GetQueueParams,
  },
  Output: SingleQueueOutput,
});

const queues = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: { ProcessJob },
});

export { queues };
