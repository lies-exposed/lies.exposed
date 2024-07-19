import * as t from "io-ts";
import { ACTORS } from "../Actor.js";
import { UUID } from "../Common/index.js";
import { EVENTS } from "../Events/index.js";
import { GROUPS } from "../Group.js";
import { KEYWORDS } from "../Keyword.js";
import { NetworkGraphOutput } from "../Network/Network.js";

export const FlowGraphType = t.union(
  [KEYWORDS, ACTORS, GROUPS, EVENTS],
  "FlowGraphType",
);
export type FlowGraphType = t.TypeOf<typeof FlowGraphType>;

export const GetFlowGraphParams = t.type(
  {
    id: UUID,
    type: FlowGraphType,
  },
  "GetFlowGraphParams",
);
export type GetFlowGraphParams = t.TypeOf<typeof GetFlowGraphParams>;

export const FlowGraphOutput = t.strict(
  {
    ...NetworkGraphOutput.type.props,
  },
  "FlowGraphData",
);

export type FlowGraphOutput = t.TypeOf<typeof FlowGraphOutput>;
