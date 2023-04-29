import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps,
  DataTType,
  ImageUploadType,
} from "@react-page/editor";
import { parseISO } from "date-fns";
import React from "react";
import EventsBox from "../../../../../containers/EventsBox";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput";
import EventList from "../../../../lists/EventList/EventList";
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

export const EVENT_BLOCK_PLUGIN_ID = "liexp/editor/plugins/EventBlock";

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
              discrete={false}
              selectedItems={selectedItems}
              onChange={(items) => {
                props.onChange({ event: items });
              }}
            />
          </Box>
        );
      },
    },
    Renderer: ({ children, isEditMode, isPreviewMode, ...props }) => {
      const events = props.data?.event ?? [];
      if (events.length > 0) {
        return (
          <Box style={{ maxWidth: 1200, flexGrow: 0 }}>
            {isEditMode ? (
              <EventList
                events={events.map((e) =>
                  toSearchEvent(
                    {
                      ...e,
                      date:
                        typeof e.date === "object"
                          ? e.date
                          : parseISO(e.date as any),
                    },
                    {}
                  )
                )}
                onClick={() => {}}
                onActorClick={() => {}}
                onGroupClick={() => {}}
                onGroupMemberClick={() => {}}
                onKeywordClick={() => {}}
                onRowInvalidate={() => {}}
              />
            ) : (
              <EventsBox
                title=""
                query={{
                  ids: events.map((v) => v.id),
                }}
                onEventClick={() => {}}
              />
            )}
          </Box>
        );
      }

      return <div>Select an event...</div>;
    },
    id: EVENT_BLOCK_PLUGIN_ID,
    version: 1,
    icon: mergedSettings.icon,
    title: "Event Block",
    isInlineable: true,
    description: "Display events carousel",
  };
};
export default createPlugin;
