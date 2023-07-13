import * as t from "io-ts";
import { ACTORS } from "../Actor";
import { UUID } from "../Common";
import { EVENTS } from "../Events";
import { GROUPS } from "../Group";
import { KEYWORDS } from "../Keyword";
import { NetworkGraphOutput } from "../Network";

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
