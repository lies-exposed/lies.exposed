import { type SlatePluginControls } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import * as React from "react";
import { List, ListItem, Typography } from "../../mui";
import { Popover, type PopoverProps } from "../Popover";
import {
  ACTOR_INLINE,
  ActorInlineControl,
  ActorInlinePluginIcon,
} from "./plugins/actor/ActorInline.plugin";
import {
  GROUP_INLINE,
  GroupInlineControl,
  GroupInlinePluginIcon,
} from "./plugins/group/GroupInline.plugin";
import {
  KEYWORD_INLINE,
  KeywordInlineControl,
  KeywordInlinePluginIcon,
} from "./plugins/keyword/KeywordInline.plugin";

export interface PickablePlugin {
  icon: JSX.Element;
  name: string;
  type: string;
  data?: any;
}

const PLUGINS = [
  // { name: "paragraph", type: PARAGRAPH_TYPE },
  // { name: "pre", type: PARAGRAPH_PRE_TYPE },
  // { name: "underline", type: EMPHASIZE_U_TYPE },
  // { name: "italic", type: EMPHASIZE_EM_TYPE },
  // { name: "bold", type: EMPHASIZE_STRONG_TYPE },
  { name: "Actor", type: ACTOR_INLINE, icon: ActorInlinePluginIcon },
  { name: "Group", type: GROUP_INLINE, icon: GroupInlinePluginIcon },
  { name: "Keyword", type: KEYWORD_INLINE, icon: KeywordInlinePluginIcon },
];

export const ComponentsPickerPopover: React.FC<
  Omit<PopoverProps, "onClose" | "onSelect"> & {
    onSelect: (p: PickablePlugin) => void;
    onClose: () => void;
  } & {
    plugin: SlatePluginControls<any>;
  }
> = ({ onClose, open = false, onSelect, plugin, ...props }) => {
  const [selectedPlugin, setSelectedPlugin] = React.useState<
    PickablePlugin | undefined
  >(undefined);

  const handleClick = (p: any): void => {
    setSelectedPlugin(p);
  };

  const Autocomplete = React.useMemo(() => {
    const commonProps = {
      popover: { ...props, open },
      add: (data: any) => {
        onSelect({ ...PLUGINS[0], ...selectedPlugin, ...data });
        onClose();
      },
      close: () => {
        onClose();
      },
    };
    switch (selectedPlugin?.type) {
      case ACTOR_INLINE: {
        return <ActorInlineControl {...plugin} {...commonProps} />;
      }
      case GROUP_INLINE: {
        return <GroupInlineControl {...plugin} {...commonProps} />;
      }
      default: {
        return <KeywordInlineControl {...plugin} {...commonProps} />;
      }
    }
  }, [selectedPlugin]);

  return !selectedPlugin ? (
    <Popover {...props} disablePortal={true} open={open} onClose={onClose}>
      <List>
        {PLUGINS.map((p) => (
          <ListItem
            key={p.type}
            style={{ marginTop: 5 }}
            onClick={() => {
              handleClick(p);
            }}
          >
            <p.icon style={{ marginRight: 10 }} />
            <Typography variant="subtitle2">{p.name}</Typography>
          </ListItem>
        ))}
      </List>
    </Popover>
  ) : (
    Autocomplete
  );
};
