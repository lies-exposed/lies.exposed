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

export type FlowGraphProps = ReactFlowProps;

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

export const FlowGraph: React.FC<FlowGraphProps> = ({
  // nodes: _nodes = initialNodes,
  // edges: _edges = initialEdges,
  ...props
}) => {
  // const [nodes, setNodes] = useNodesState(_nodes);
  // const [edges, setEdges] = useEdgesState(_edges);

  // const onNodesChange = React.useCallback(
  //   (changes: NodeChange[]) =>
  //     { setNodes((nds) => applyNodeChanges(changes, nds)); },
  //   []
  // );
  // const onEdgesChange = React.useCallback(
  //   (changes: EdgeChange[]) =>
  //     { setEdges((eds) => applyEdgeChanges(changes, eds)); },
  //   []
  // );

  // const onConnect = React.useCallback(
  //   (params: Edge | Connection) => { setEdges((eds) => addEdge(params, eds)); },
  //   [setEdges]
  // );

  return (
    <ReactFlow
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={fitViewOptions}
      {...props}
    >
      <Controls />
      <MiniMap />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};
