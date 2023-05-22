import {
  ACTOR_INLINE,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  LINK_INLINE,
  MEDIA_BLOCK_PLUGIN
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { uuid } from "@liexp/shared/lib/utils/uuid";
// eslint-disable-next-line no-restricted-imports
import { type SlatePluginControls } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import * as React from "react";
import { List, ListItem, Typography } from "../../../../mui";
import { Popover, type PopoverProps } from "../../../Popover";
import {
  ActorInlineControlContent
} from "../actor/ActorInline.plugin";
import {
  EventBlockPluginControl
} from "../event/eventBlock.plugin";
import {
  GroupInlineControlContent
} from "../group/GroupInline.plugin";
import {
  KeywordInlineControlContent
} from "../keyword/KeywordInline.plugin";
import { LinkInlineControlContent } from "../links/LinkInline.plugin";
import {
  MediaBlockPluginControl,
  type MediaBlockState
} from "../media/mediaBlock";
import { PLUGINS } from './constants';
import { type PickablePlugin } from './types';


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
      data: plugin.data?.data ?? {},
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
      case LINK_INLINE: {
        return <LinkInlineControlContent {...plugin} {...commonProps} />;
      }
      case MEDIA_BLOCK_PLUGIN: {
        const data: MediaBlockState = {
          media: [],
          ...commonProps.data,
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
      case EVENT_BLOCK_PLUGIN:
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
