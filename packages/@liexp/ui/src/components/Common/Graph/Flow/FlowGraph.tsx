import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type DefaultEdgeOptions,
  type FitViewOptions,
  type ReactFlowProps,
} from "reactflow";
import "reactflow/dist/style.css";

export interface FlowGraphProps extends ReactFlowProps {
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
