import {
  ACTOR_INLINE,
  EVENT_BLOCK_PLUGIN_ID,
  GROUP_INLINE,
  KEYWORD_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { uuid } from "@liexp/shared/lib/utils/uuid";
// eslint-disable-next-line no-restricted-imports
import { type OverridableComponent } from "@mui/material/OverridableComponent";
import { type DataTType } from "@react-page/editor";
import { type SlatePluginControls } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import * as React from "react";
import { List, ListItem, Typography } from "../../../mui";
import { Popover, type PopoverProps } from "../../Popover";
import {
  ActorInlineControlContent,
  ActorInlinePluginIcon,
  type ActorInlineState,
} from "../plugins/actor/ActorInline.plugin";
import {
  EventBlockPluginControl,
  EventBlockPluginIcon,
  type EventBlockState,
} from "../plugins/event/eventBlock.plugin";
import {
  GroupInlineControlContent,
  GroupInlinePluginIcon,
  type GroupInlineState,
} from "../plugins/group/GroupInline.plugin";
import {
  KeywordInlineControlContent,
  KeywordInlinePluginIcon,
  type KeywordInlineState,
} from "../plugins/keyword/KeywordInline.plugin";
import {
  MediaBlockPluginControl,
  MediaBlockPluginIcon,
  type MediaBlockState,
} from "../plugins/media/mediaBlock";

export type PickablePlugin = {
  icon: OverridableComponent<any>;
  name: string;
} & (
  | {
      type: typeof ACTOR_INLINE;
      data?: ActorInlineState;
    }
  | {
      type: typeof GROUP_INLINE;
      data?: GroupInlineState;
    }
  | {
      type: typeof KEYWORD_INLINE;
      data?: KeywordInlineState;
    }
  | {
      type: typeof MEDIA_BLOCK_PLUGIN;
      data?: MediaBlockState;
    }
  | {
      type: typeof EVENT_BLOCK_PLUGIN_ID;
      data?: EventBlockState;
    }
) &
  DataTType;

const PLUGINS = [
  { name: "Actor", type: ACTOR_INLINE, icon: ActorInlinePluginIcon },
  { name: "Group", type: GROUP_INLINE, icon: GroupInlinePluginIcon },
  { name: "Keyword", type: KEYWORD_INLINE, icon: KeywordInlinePluginIcon },
  {
    name: "Media",
    type: MEDIA_BLOCK_PLUGIN,
    icon: MediaBlockPluginIcon,
  },
  { name: "Event", type: EVENT_BLOCK_PLUGIN_ID, icon: EventBlockPluginIcon },
];

export const ComponentsPickerPopover: React.FC<
  Omit<PopoverProps, "onClose" | "onSelect"> & {
    onSelect: (p: PickablePlugin) => void;
    onClose: () => void;
  } & {
    plugin: SlatePluginControls<PickablePlugin>;
  }
> = ({ onClose, open = false, onSelect, plugin, ...props }) => {
  const [selectedPlugin, setSelectedPlugin] = React.useState<
    PickablePlugin | undefined
  >(plugin.data);

  const handleClick = (p: any): void => {
    setSelectedPlugin(p);
  };

  const pluginControl = React.useMemo(() => {
    const commonProps = {
      // popover: { ...props, open },
      data: plugin.data ?? {},
      onAdd: (data: any) => {
        if (selectedPlugin) {
          onSelect({
            ...selectedPlugin,
            data,
          });
        }
      },
      onRemove: () => {
        setSelectedPlugin(undefined);
        if (plugin.data) {
          plugin.remove?.();
        } else {
          onClose();
        }
      },
    };
    switch (selectedPlugin?.type) {
      case ACTOR_INLINE: {
        return <ActorInlineControlContent {...plugin} {...commonProps} />;
      }
      case GROUP_INLINE: {
        return <GroupInlineControlContent {...plugin} {...commonProps} />;
      }
      case MEDIA_BLOCK_PLUGIN: {
        const data: MediaBlockState = {
          media: [],
          ...selectedPlugin.data,
        };
        return (
          <MediaBlockPluginControl
            {...{ ...plugin, pluginConfig: plugin.pluginConfig as any }}
            {...commonProps}
            data={data}
            readOnly={false}
            isEditMode={true}
            focused={false}
            isPreviewMode={false}
            nodeId={uuid()}
            remove={commonProps.onRemove}
            onChange={commonProps.onAdd}
          />
        );
      }
      case EVENT_BLOCK_PLUGIN_ID:
        return (
          <EventBlockPluginControl
            {...(plugin as any)}
            {...commonProps}
            readOnly={false}
            isEditMode={true}
            focused={false}
            isPreviewMode={false}
            nodeId={uuid()}
            onChange={commonProps.onAdd}
            remove={commonProps.onRemove}
          />
        );
      default: {
        return <KeywordInlineControlContent {...plugin} {...commonProps} />;
      }
    }
  }, [selectedPlugin]);

  return (
    <Popover {...props} open={open} onClose={onClose}>
      {!selectedPlugin ? (
        <List>
          {PLUGINS.map((p) => (
            <ListItem
              key={p.type}
              style={{ marginTop: 5, cursor: "pointer" }}
              onClick={() => {
                handleClick(p);
              }}
            >
              <p.icon style={{ marginRight: 10 }} />
              <Typography variant="subtitle2">{p.name}</Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        pluginControl
      )}
    </Popover>
  );
};
