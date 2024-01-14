import MediaIcon from "@mui/icons-material/VideoFileOutlined.js";
import type {
  CellPlugin,
  CellPluginComponentProps,
  DataTType,
} from "@react-page/editor/lib-es/index.js";
import React from "react";
import ActorsBox from "../../../../../containers/ActorsBox.js";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput.js";
import { Box } from "../../../../mui/index.js";

export interface ActorInlineState extends DataTType {
  actorId: string;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <MediaIcon />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ActorInlineState>
>;

const createPlugin = (
  settings?: ActorInlineSettings,
): CellPlugin<ActorInlineState> => {
  const mergedSettings = { ...defaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: (props) => {
        const [selectedItems, setSelectedItems] = React.useState([]);
        return (
          <Box style={{ height: 200 }}>
            <AutocompleteActorInput
              {...props}
              selectedItems={selectedItems}
              onChange={(items) => {
                setSelectedItems(selectedItems);
                props.onChange({ actorId: items[0].id });
              }}
            />
          </Box>
        );
      },
    },
    Renderer: ({ children, ...props }) => {
      if (props.data.actorId) {
        const ids = [props.data.actorId];
        return (
          <ActorsBox
            params={{
              filter: { ids },
              pagination: { perPage: ids.length, page: 1 },
              sort: {
                field: "createdAt",
                order: "DESC",
              },
            }}
            onActorClick={() => {}}
          />
        );
      }

      return <span>Select an actor ...</span>;
    },
    id: "liexp/editor/plugins/ActorInline",
    version: 1,
    icon: mergedSettings.icon,
    title: "Actor Inline",
    isInlineable: true,
    description: "Select an actor to display",
  };
};
export default createPlugin;
