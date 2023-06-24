import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { EVENT_BLOCK_PLUGIN } from "@liexp/shared/lib/slate/plugins/customSlate";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps,
  CellPluginCustomControlsComonent,
  CellPluginRenderer,
  DataTType,
  ImageUploadType,
} from "@react-page/editor";
import { parseISO } from "date-fns";
import React from "react";
import { EventCardGrid } from "../../../../Cards/Events/EventCardGrid";
import { AutocompleteEventInput } from "../../../../Input/AutocompleteEventInput";
import EventList from "../../../../lists/EventList/EventList";
import { Box, Button, Grid } from "../../../../mui";

export interface EventBlockState extends DataTType {
  events: Event[];
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

export const EventBlockPluginRenderer: CellPluginRenderer<EventBlockState> = ({
  children,
  isEditMode,
  isPreviewMode,
  ...props
}) => {
  const events = props.data?.events ?? [];
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
          <EventCardGrid
            events={events.map((e) =>
              toSearchEvent(e, {
                keywords: new Map(),
                groups: new Map(),
                actors: new Map(),
                media: new Map(),
                links: new Map(),
                groupsMembers: new Map(),
              })
            )}
            onItemClick={() => {}}
          />
        )}
      </Box>
    );
  }

  return <div>Select an event...</div>;
};

export const EventBlockPluginControl: CellPluginCustomControlsComonent<
  EventBlockState
> = ({ data, onChange, remove, ...props }) => {
  const [s, setS] = React.useState<EventBlockState>({
    events: data.events ?? [],
  });

  const selectedItems = React.useMemo(() => s.events, [s.events]);

  return (
    <Box style={{ height: 200 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AutocompleteEventInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              if (items.length > 0) {
                setS({ events: items });
              }
            }}
          />
        </Grid>
        <Grid item sm={12}>
          <Button
            variant="contained"
            disabled={s.events.length < 1}
            onClick={() => {
              onChange(s);
            }}
          >
            Add
          </Button>
          <Button
            onClick={() => {
              remove?.();
            }}
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const eventBlockPlugin = (
  settings?: EventBlockSettings
): CellPlugin<EventBlockState> => {
  const mergedSettings = { ...defaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: EventBlockPluginControl,
    },
    Renderer: EventBlockPluginRenderer,
    id: EVENT_BLOCK_PLUGIN,
    version: 1,
    icon: mergedSettings.icon,
    title: "Event Block",
    isInlineable: true,
    description: "Display events carousel",
  };
};

export const EventBlockPluginIcon = MediaIcon;
export default eventBlockPlugin;
