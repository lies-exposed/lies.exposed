import { Schema } from "effect";
import { ACTORS } from "../Actor.js";
import { UUID } from "../Common/index.js";
import { EVENTS } from "../Events/index.js";
import { GROUPS } from "../Group.js";
import { KEYWORDS } from "../Keyword.js";
import { NetworkGraphOutput } from "../Network/Network.js";

export const FlowGraphType = Schema.Union(
  KEYWORDS,
  ACTORS,
  GROUPS,
  EVENTS,
).annotations({
  title: "FlowGraphType",
});
export type FlowGraphType = typeof FlowGraphType.Type;

export const GetFlowGraphParams = Schema.Struct({
  id: UUID,
  type: FlowGraphType,
}).annotations({
  title: "GetFlowGraphParams",
});
export type GetFlowGraphParams = typeof GetFlowGraphParams.Type;

export const FlowGraphOutput = Schema.Struct(
  NetworkGraphOutput.fields,
).annotations({
  title: "FlowGraphData",
});

export type FlowGraphOutput = typeof FlowGraphOutput.Type;
