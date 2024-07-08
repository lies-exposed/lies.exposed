import { http } from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import { type Node, useReactFlow } from "reactflow";
import { Button, Icons, Stack } from "../../../../../mui/index.js";

interface GroupBoxNodeContextMenuProps {
  node: Node;
}

export const GroupBoxNodeContextMenu: React.FC<
  GroupBoxNodeContextMenuProps
> = ({ node }) => {
  const { getNodes, setNodes } = useReactFlow();
  const childNodes = React.useMemo(
    () => getNodes().filter((n) => n.parentId === node.id),
    [node, getNodes],
  );

  const handleRevert = React.useCallback(() => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.parentId === node.id) {
          return {
            ...n,
            parentId: undefined,
          };
        } else if (n.id === node.id) {
          return {
            ...n,
            style: {
              width: 30,
              height: 30,
            },
            type: http.Group.Group.name,
          };
        }
        return n;
      }),
    );
  }, [node]);

  return (
    <Stack>
      <p style={{ margin: "0.5em" }}>
        <small>parent: {node?.parentId}</small>
      </p>
      <p style={{ margin: "0.5em" }}>
        <small>children: {childNodes.length}</small>
      </p>
      <Button size="small" startIcon={<Icons.Search />} onClick={handleRevert}>
        Revert to {node.type}
      </Button>
    </Stack>
  );
};
