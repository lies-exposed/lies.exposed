import type {
  CellPlugin,
  CellPluginComponentProps,
  DataTType,
} from "@liexp/react-page/lib/react-page.types.js";
import MediaIcon from "@mui/icons-material/VideoFileOutlined.js";
import React from "react";
import { GroupsBox } from "../../../../../containers/GroupsBox.js";
import { AutocompleteGroupInput } from "../../../../Input/AutocompleteGroupInput.js";
import { Box } from "../../../../mui/index.js";

export interface GroupInlineState extends DataTType {
  groupId: string;
}

export interface GroupInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: GroupInlineSettings = {
  icon: <MediaIcon />,
};

export type GroupInlineControlType = React.ComponentType<
  CellPluginComponentProps<GroupInlineState>
>;

const createPlugin = (
  settings?: GroupInlineSettings,
): CellPlugin<GroupInlineState> => {
  const mergedSettings = { ...defaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: (props) => {
        const [selectedItems, setSelectedItems] = React.useState([]);
        return (
          <Box style={{ height: 200 }}>
            <AutocompleteGroupInput
              {...props}
              selectedItems={selectedItems}
              onChange={(items) => {
                setSelectedItems(selectedItems);
                props.onChange({ groupId: items[0].id });
              }}
            />
          </Box>
        );
      },
    },
    Renderer: ({ children, ...props }) => {
      if (props.data.groupId) {
        const ids = [props.data.groupId];
        return (
          <GroupsBox
            params={{
              filter: { ids },
              pagination: { perPage: ids.length, page: 1 },
              sort: {
                field: "createdAt",
                order: "DESC",
              },
            }}
            onItemClick={() => {}}
          />
        );
      }

      return <span>Select an actor ...</span>;
    },
    id: "liexp/editor/plugins/GroupInline",
    version: 1,
    icon: mergedSettings.icon,
    title: "Group Inline",
    isInlineable: true,
    description: "Select an actor to display",
  };
};
export default createPlugin;
