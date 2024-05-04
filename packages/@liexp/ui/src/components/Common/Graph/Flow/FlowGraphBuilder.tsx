import { Group } from "@liexp/shared/lib/io/http/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import React, { useCallback } from "react";
import {
  Connection,
  Edge,
  Node,
  NodeDragHandler,
  ReactFlowProps,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { PaneContextMenu } from "../../../Common/Graph/Flow/ContextMenu/PaneContextMenu.js";
import { nodeTypes } from "../../../Common/Graph/Flow/nodes/index.js";
import { AutocompleteActorInput } from "../../../Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "../../../Input/AutocompleteGroupInput.js";
import { FormControlLabel, Stack, Switch } from "../../../mui/index.js";
import {
  NodeContextMenu,
  NodeContextMenuProps,
} from "./ContextMenu/Node/NodeContextMenu.js";
import { FlowGraph } from "./FlowGraph.js";

interface FlowGraphBuilderProps extends ReactFlowProps {
  nodes: Node[];
  edges: Edge[];
  options: Record<string, any>;
  onGraphChange: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onOptionsChange: (options: Record<string, any>) => void;
}

const contextMenuPositioner = (
  event: React.MouseEvent<Element>,
  pane: DOMRect,
) => {
  const paneTop = pane.top;
  const paneLeft = pane.left;
  const paneWidth = pane.width;
  const paneHeight = pane.height;

  const top =
    event.clientY < paneTop + paneHeight - 200 ? event.clientY : undefined;
  const left =
    event.clientX < paneLeft + paneWidth - 200 ? event.clientX : undefined;
  const right =
    (event.clientX >= paneWidth + paneLeft - 200 &&
      paneLeft + paneWidth - event.clientX) ||
    undefined;
  const bottom =
    (event.clientY >= paneHeight + paneTop - 200 &&
      paneTop + paneHeight - event.clientY) ||
    undefined;

  return { top, left, right, bottom };
};

export const FlowGraphBuilder: React.FC<FlowGraphBuilderProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  options: initialOptions,
  onGraphChange,
  onOptionsChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = React.useState<Omit<
    NodeContextMenuProps,
    "onClick"
  > | null>(null);
  const ref = React.useRef<HTMLElement | null>(null);
  // this ref stores the current dragged node
  const dragRef = React.useRef<Node | null>(null);

  // target is the node that the node is dragged over
  const [target, setTarget] = React.useState<Node | null>(null);

  // settings like debug, snap-to-grid, etc.
  const [settings, setSettings] = React.useState({
    debug: false,
    snapToGrid: false,
    miniMap: false,
    ...initialOptions,
  });

  const debugBox = React.useMemo(() => {
    if (settings.debug) {
      return (
        <Stack
          direction="column"
          style={{ position: "absolute", bottom: 20, right: 30 }}
        >
          <div>
            {dragRef.current
              ? `Dragging (${dragRef.current.type}): ${dragRef.current.id}`
              : "No dragging node"}
          </div>
          <div>
            {target
              ? `Target (${target.type}): ${target.id}`
              : "No target node"}
          </div>
          <div>
            Nodes:
            {nodes.map((n) => (
              <div key={n.id}>
                {n.type}: {n.id}
              </div>
            ))}
          </div>
        </Stack>
      );
    }
    return null;
  }, [target, dragRef, settings]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent<Element>, node: Node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current?.getBoundingClientRect();

      if (pane) {
        const { top, left, right, bottom } = contextMenuPositioner(event, pane);
        setMenu({
          id: node.id,
          type: node.type,
          top,
          left,
          right,
          bottom,
        });
      }
    },
    [setMenu, ref],
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent<Element>) => {
      // Prevent native context menu from showing
      event.preventDefault();
      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = event.currentTarget.getBoundingClientRect();
      if (pane) {
        const { top, left, right, bottom } = contextMenuPositioner(event, pane);
        setMenu({
          id: undefined as any,
          top,
          left,
          right,
          bottom,
        });
      }
    },
    [setMenu],
  );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onGroupsChange = React.useCallback(
    (gg: Group.Group[]) => {
      if (gg[0]) {
        const { body, excerpt, ...group } = gg[0];
        setNodes((nodes) =>
          nodes.concat([
            {
              id: gg[0].id,
              data: group,
              type: Group.Group.name,
              position: { x: 100, y: 100 },
            },
          ]),
        );
      }
    },
    [nodes],
  );

  const onActorsChange = React.useCallback(
    (gg: http.Actor.Actor[]) => {
      if (gg[0]) {
        const { body, excerpt, ...group } = gg[0];
        setNodes((nodes) =>
          nodes.concat([
            {
              id: gg[0].id,
              data: group,
              type: http.Actor.Actor.name,
              position: { x: 100, y: 100 },
            },
          ]),
        );
      }
    },
    [nodes],
  );

  const onNodeDragStart: NodeDragHandler = (evt, node) => {
    dragRef.current = node;
  };

  const onNodeDrag: NodeDragHandler = (evt, node) => {
    if (!node.width || !node.height) {
      return;
    }
    const pane = ref.current?.getBoundingClientRect();
    if (!pane) {
      return;
    }
    const nodeWidth = node.width!;
    const nodeHeight = node.height!;
    // calculate the center point of the node from position and dimensions
    const centerX = pane.left + node.position.x + nodeWidth / 2;
    const centerY = pane.top + node.position.y + nodeHeight / 2;

    // find a node where the center point is inside
    const targetNode =
      nodes.find((n) => {
        const isHovered =
          centerX > pane.left + n.position.x &&
          centerX < pane.left + n.position.x + n.width! &&
          centerY > pane.top + n.position.y &&
          centerY < pane.top + n.position.y + n.height!;
        const isDifferentFromSourceNode = n.id !== node.id; // this is needed, otherwise we would always find the dragged node

        return isHovered && isDifferentFromSourceNode;
      }) ?? null;

    setTarget(targetNode);
  };

  const onNodeDragStop: NodeDragHandler = (evt, node) => {
    // on drag stop, we swap the colors of the nodes
    // const nodeColor = node.data.label;
    // const targetColor = target?.data.label;
    const pane = ref.current?.getBoundingClientRect();
    if (!pane) {
      return;
    }

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === target?.id) {
          if (target.type === "group") {
            // TODO: update dimensions based on children
          } else {
            n.style = {
              ...n.style,
              width: 200,
              height: 300,
            };
            n.type = "group";
          }
        }
        // the current dragging node
        else if (n.id === node.id) {
          n.style = {
            ...n.style,
            opacity: 1,
          };

          if (target) {
            if (n.parentId !== target.id) {
              n.parentId = target.id;
              n.position = {
                x: n.position.x - target.position.x,
                y: n.position.y - target.position.y,
              };
            }
          } else {
            n.parentId = undefined;
          }
        }
        return n;
      }),
    );

    setTarget(null);
    dragRef.current = null;
  };

  React.useEffect(() => {
    // whenever the target changes, we swap the colors temporarily
    // this is just a placeholder, implement your own logic here
    setNodes((nodes) => {
      return nodes.map((n) => {
        if (n.id === target?.id) {
          if (n.type === "group") {
            n.style = {
              ...n.style,
              opacity: 0.5,
            };
          }
        } else {
          n.style = {
            ...n.style,
            opacity: 1,
          };
        }

        return n;
      });
    });
  }, [target]);

  React.useEffect(() => {
    onGraphChange({ nodes, edges });
  }, [nodes, edges]);

  React.useEffect(() => {
    onOptionsChange(settings);
  }, [settings]);

  const groupIds = nodes.map((n) => n.id);

  return (
    <Stack direction="row">
      <Stack
        display="flex"
        style={{ flexGrow: 1, height: 600, width: "70%", position: "relative" }}
      >
        <FlowGraph
          ref={ref as any}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          className="react-flow-subflows-example"
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          snapToGrid={settings.snapToGrid}
          miniMap={settings.miniMap}
          onNodesDelete={(nodes) => {
            const nodeIds = nodes.map((n) => n.id);
            setNodes((nodes) =>
              nodes.map((n) => {
                if (n.parentId && nodeIds.includes(n.parentId)) {
                  n.parentId = undefined;
                }
                return n;
              }),
            );
            setEdges((edges) =>
              edges.filter((edge) => !nodeIds.includes(edge.source)),
            );
          }}
        >
          {menu?.id ? (
            <NodeContextMenu onClick={onPaneClick} {...menu} />
          ) : menu ? (
            <PaneContextMenu onClick={onPaneClick} {...menu} />
          ) : null}

          {debugBox}
        </FlowGraph>
      </Stack>

      <Stack
        display={"flex"}
        style={{ flexShrink: 0, width: "20%" }}
        spacing={2}
      >
        <Stack>
          <FormControlLabel
            label="debug"
            control={
              <Switch
                value={settings.debug}
                onChange={(_, debug) => {
                  setSettings((settings) => ({ ...settings, debug }));
                }}
              />
            }
          />
          <FormControlLabel
            label="snap-to-grid"
            control={
              <Switch
                value={settings.snapToGrid}
                onChange={(_, snapToGrid) => {
                  setSettings((settings) => ({ ...settings, snapToGrid }));
                }}
              />
            }
          />
          <FormControlLabel
            label="mini-map"
            control={
              <Switch
                value={settings.miniMap}
                onChange={(_, miniMap) => {
                  setSettings((settings) => ({ ...settings, miniMap }));
                }}
              />
            }
          />
        </Stack>

        <AutocompleteGroupInput
          selectedItems={[]}
          excludeIds={groupIds}
          onChange={onGroupsChange}
        />
        <AutocompleteActorInput selectedItems={[]} onChange={onActorsChange} />
      </Stack>
    </Stack>
  );
};
