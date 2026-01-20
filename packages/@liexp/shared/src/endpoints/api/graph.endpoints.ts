import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { GetNetworkQuery } from "@liexp/io/lib/http/Network/Network.js";
import { GetListQuery } from "@liexp/io/lib/http/Query/index.js";
import {
  FlowGraphOutput,
  GetFlowGraphParams,
} from "@liexp/io/lib/http/graphs/FlowGraph.js";
import { CreateGraphData, Graph } from "@liexp/io/lib/http/graphs/Graph.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleGraphOutput = Output(Graph).annotations({
  title: "Graph",
});
const ListGraphsOutput = ListOutput(Graph, "Graphs");

export const GetGraph = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/graphs/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleGraphOutput,
});

export const ListGraphs = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: GetListQuery,
  },
  Output: ListGraphsOutput,
});

export const CreateGraph = Endpoint({
  Method: "POST",
  getPath: () => `/graphs`,
  Input: {
    Body: CreateGraphData,
  },
  Output: SingleGraphOutput,
});

export const EditGraph = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/graphs/${id}`,
  Input: {
    Params: Schema.Struct({
      id: UUID,
    }),
    Body: CreateGraphData,
  },
  Output: SingleGraphOutput,
});

export const DeleteGraph = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/graphs/${id}`,
  Input: {
    Params: Schema.Struct({
      id: UUID,
    }),
  },
  Output: SingleGraphOutput,
});

export const GetFlowGraph = Endpoint({
  Method: "GET",
  getPath: ({ id, type }) => `/graphs/flows/${type}/${id}`,
  Input: {
    Params: GetFlowGraphParams,
    Query: GetNetworkQuery,
  },
  Output: Schema.Struct({ data: FlowGraphOutput }),
});

export const EditFlowGraph = Endpoint({
  Method: "PUT",
  getPath: ({ id, type }) => `/graphs/flows/${type}/${id}`,
  Input: {
    Params: GetFlowGraphParams,
    Body: Schema.Struct({
      regenerate: Schema.Boolean,
    }),
  },
  Output: Schema.Struct({ data: FlowGraphOutput }),
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
