import React, { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { IconButton, Icons, Stack } from "../../../../../mui/index.js";
import { ContextMenu, type ContextMenuProps } from "../ContextMenu.js";
import { GroupBoxNodeContextMenu } from "./GroupBoxNodeContextMenu.js";

export interface NodeContextMenuProps extends ContextMenuProps {
  id: string;
  type?: string;
  onClick: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  id,
  type,
  ...contextMenuProps
}) => {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
  const node = React.useMemo(() => getNode(id), [id]);

  const contextMenuContent = React.useMemo(() => {
    if (node?.type === "group") {
      return <GroupBoxNodeContextMenu node={node} />;
    }
    return (
      <div>
        <p style={{ margin: "0.5em" }}>
          <small>
            {type ?? "-"}: {id}
          </small>
        </p>
        <p style={{ margin: "0.5em" }}>
          <small>parent: {node?.parentId}</small>
        </p>
      </div>
    );
  }, [node]);

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (node) {
      const position = {
        x: node.position.x + 50,
        y: node.position.y + 50,
      };

      addNodes({
        ...node,
        selected: false,
        dragging: false,
        id: `${node.id}-copy`,
        position,
      });
    }
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  return (
    <ContextMenu {...contextMenuProps}>
      <Stack>
        {contextMenuContent}
        <Stack direction="row">
          <IconButton size="small" onClick={duplicateNode}>
            <Icons.Copy />
          </IconButton>
          <IconButton size="small" onClick={deleteNode}>
            <Icons.Cancel />
          </IconButton>
        </Stack>
      </Stack>
    </ContextMenu>
  );
};
