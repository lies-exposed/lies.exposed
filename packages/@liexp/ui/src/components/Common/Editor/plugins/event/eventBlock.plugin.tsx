import { type Event } from "@liexp/shared/io/http/Events";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps,
  DataTType,
  ImageUploadType
} from "@react-page/editor";
import React from "react";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput";
import EventsBox from "../../../../containers/EventsBox";
import { Box } from "../../../../mui";

export interface EventBlockState extends DataTType {
  event: Event[];
}

export interface EventBlockSettings {
  imageUpload?: ImageUploadType;
  icon?: React.ReactNode;
}

export const defaultSettings: EventBlockSettings = {
  icon: <MediaIcon />,
};

export type ImageControlType = React.ComponentType<
  CellPluginComponentProps<EventBlockState> & {
    imageUpload?: ImageUploadType;
  }
>;

const createPlugin = (
  settings?: EventBlockSettings
): CellPlugin<EventBlockState> => {
  const mergedSettings = { ...defaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: (props) => {
        // console.log(props);
        const selectedItems = props.data?.event ?? [];
        return (
          <Box style={{ height: 200 }}>
            <AutocompleteEventInput
              {...props}
              selectedItems={selectedItems}
              onChange={(items) => { props.onChange({ event: items }); }}
            />
          </Box>
        );
      },
    },
    Renderer: ({ children, ...props }) => {
      const ids = props.data?.event?.map((v) => v.id) ?? [];
      if (ids.length > 0) {
        return (
          <Box style={{ maxWidth: 1200, flexGrow: 0 }}>
            <EventsBox
              title=""
              query={{
                ids,
              }}
              onEventClick={() => {}}
            />
          </Box>
        );
      }

      return <div>Select an event...</div>;
    },
    id: "liexp/editor/plugins/EventBlock",
    version: 1,
    icon: mergedSettings.icon,
    title: "Event Block",
    isInlineable: true,
    description: "Display events carousel",
  };
};
export default createPlugin;
