import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type DefaultEdgeOptions,
  type FitViewOptions,
  type ReactFlowProps,
} from "@xyflow/react";
import * as React from "react";
import { type EdgeType } from "./links/index.js";
import { type NodeType } from "./nodes/index.js";
import "@xyflow/react/dist/style.css";

export interface FlowGraphProps extends ReactFlowProps<NodeType, EdgeType> {
  miniMap?: boolean;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

// eslint-disable-next-line react/display-name
export const FlowGraph = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<FlowGraphProps>
>(({ children, miniMap, ...props }, ref) => {
  return (
    <ReactFlow
      ref={ref}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={fitViewOptions}
      {...props}
    >
      <Controls />
      {miniMap ? <MiniMap /> : null}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      {children}
    </ReactFlow>
  );
});
