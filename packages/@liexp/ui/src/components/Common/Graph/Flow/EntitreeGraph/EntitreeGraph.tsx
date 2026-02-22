import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import * as React from "react";
import { CustomNode } from "./CustomNode.js";
import { layoutElements } from "./layout-elements.js";
import { useTheme } from "../../../../../theme/index.js";
import { getRelationshipColor } from "../../../../../theme/styleUtils.js";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  custom: CustomNode,
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  fontSize: 11,
  alignItems: "center",
  background: "rgba(255,255,255,0.9)",
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid #eee",
};

const emptyStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  color: "#999",
  fontSize: 13,
};

interface EntitreeGraphProps {
  tree: any;
  rootId: string;
  onActorClick?: (id: string) => void;
}

const EntitreeGraphInner: React.FC<EntitreeGraphProps> = ({
  tree,
  rootId,
  onActorClick,
}) => {
  const theme = useTheme();
  const { fitView } = useReactFlow();

  // Create legend items with theme-based colors
  const legendItems = React.useMemo(() => [
    { color: theme.palette.grey[600], label: "Parent / Child" },
    { color: getRelationshipColor(theme, "spouse"), label: "Spouse" },
    { color: getRelationshipColor(theme, "partner"), label: "Partner", dashed: true },
    { color: getRelationshipColor(theme, "sibling"), label: "Sibling" },
  ], [theme]);

  const { nodes: initialLayoutedNodes, edges: initialLayoutedEdges } =
    React.useMemo(() => layoutElements(tree, rootId, "TB"), [tree, rootId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayoutedEdges);

  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = layoutElements(
      tree,
      rootId,
      "TB",
    );
    setNodes(newNodes);
    setEdges(newEdges);
    window.requestAnimationFrame(() => {
      void fitView({ padding: 0.2 });
    });
  }, [tree, rootId]);

  const onConnect = React.useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds,
        ),
      ),
    [],
  );

  const onLayout = React.useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutElements(
        tree,
        rootId,
        direction,
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      window.requestAnimationFrame(() => {
        void fitView({ padding: 0.2 });
      });
    },
    [tree, rootId, fitView],
  );

  if (nodes.length === 0) {
    return (
      <div style={emptyStyle}>
        No graph data — the family tree may be empty or contain invalid
        relations.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={
        onActorClick ? (_, node) => onActorClick(node.id) : undefined
      }
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      nodeTypes={nodeTypes}
      style={{
        width: "100%",
        height: "100%",
        cursor: onActorClick ? "pointer" : undefined,
      }}
    >
      <Panel position="top-right">
        <button onClick={() => onLayout("TB")}>vertical layout</button>
        <button onClick={() => onLayout("LR")}>horizontal layout</button>
      </Panel>
      <Panel position="bottom-left">
        <div style={legendStyle}>
          {legendItems.map((item) => (
            <span
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <svg width="20" height="10">
                <line
                  x1="0"
                  y1="5"
                  x2="20"
                  y2="5"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={
                    "dashed" in item && item.dashed ? "4 2" : undefined
                  }
                />
              </svg>
              {item.label}
            </span>
          ))}
        </div>
      </Panel>
    </ReactFlow>
  );
};

export const EntitreeGraph: React.FC<EntitreeGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <EntitreeGraphInner {...props} />
    </ReactFlowProvider>
  );
};
