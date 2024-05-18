import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import React, { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { IconButton, Icons, Stack } from "../../../../mui/index.js";
import { ContextMenu, ContextMenuProps } from "./ContextMenu.js";

export type PaneContextMenuProps = ContextMenuProps;

export const PaneContextMenu: React.FC<PaneContextMenuProps> = ({
  ...contextMenuProps
}) => {
  const { getNode, addNodes } = useReactFlow();

  const addGroupNode = useCallback(() => {
    const position = {
      x: contextMenuProps.left! + 50,
      y: contextMenuProps.top! + 50,
    };

    addNodes({
      type: "group",
      selected: false,
      dragging: false,
      data: { label: "Group" },
      id: uuid(),
      position,
      width: 200,
      height: 300,
    });
  }, [getNode, addNodes]);

  return (
    <ContextMenu {...contextMenuProps}>
      <Stack>
        <Stack direction="column">
          <IconButton size="small" onClick={addGroupNode}>
            <Icons.AddCircle />
            Add Group
          </IconButton>
        </Stack>
      </Stack>
    </ContextMenu>
  );
};
