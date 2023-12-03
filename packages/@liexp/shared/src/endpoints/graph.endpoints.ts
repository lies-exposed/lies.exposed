import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { GetNetworkQuery } from "../io/http/Network";
import { GetListQuery } from "../io/http/Query";
import {
  FlowGraphOutput,
  GetFlowGraphParams,
} from "../io/http/graphs/FlowGraph";
import { GraphData, GraphId } from "../io/http/graphs/Graph";
import { ResourceEndpoints } from "./types";

export const GetGraph = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({ id: GraphId }),
  },
  Output: t.strict({ data: GraphData }),
});

export const GetFlowGraph = Endpoint({
  Method: "GET",
  getPath: ({ id, type }) => `/graphs/flows/${type}/${id}`,
  Input: {
    Params: GetFlowGraphParams,
    Query: GetNetworkQuery,
  },
  Output: t.strict({ data: FlowGraphOutput }),
});

export const EditFlowGraph = Endpoint({
  Method: "PUT",
  getPath: ({ id, type }) => `/graphs/flows/${type}/${id}`,
  Input: {
    Params: GetFlowGraphParams,
    Body: t.strict({
      regenerate: t.boolean,
    }),
  },
  Output: t.strict({ data: FlowGraphOutput }),
});

export const ListGraphs = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: t.partial({
      ...GetListQuery.props,
    }),
  },
  Output: t.strict({ data: t.array(GraphData) }),
});

export const CreateGraph = Endpoint({
  Method: "POST",
  getPath: () => `/graphs`,
  Input: {
    Body: t.unknown,
  },
  Output: t.strict({ data: GraphData }),
});

export const EditGraph = Endpoint({
  Method: "PUT",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({
      id: GraphId,
    }),
  },
  Output: t.strict({ data: GraphData }),
});

export const DeleteGraph = Endpoint({
  Method: "DELETE",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({
      id: GraphId,
    }),
  },
  Output: t.strict({ data: GraphData }),
});

export const graphs = ResourceEndpoints({
  Get: GetGraph,
  List: ListGraphs,
  Create: CreateGraph,
  Edit: EditGraph,
  Delete: DeleteGraph,
  Custom: {
    GetGraphByType: GetFlowGraph,
    EditFlowGraph,
  },
});
