import ComponentPickerIcon from "@mui/icons-material/ManageSearchOutlined";
import {
  type CellPluginComponentProps,
  type DataTType,
} from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  ComponentsPickerPopover,
  type PickablePlugin,
} from "../ComponentPickerPopover";
import { ACTOR_INLINE, ActorInlineRenderer } from "./actor/ActorInline.plugin";
import { GROUP_INLINE, GroupInlineRenderer } from "./group/GroupInline.plugin";
import {
  KEYWORD_INLINE,
  KeywordInlineRenderer,
} from "./keyword/KeywordInline.plugin";

export interface ComponentsPickerPopoverState extends DataTType {
  plugin: PickablePlugin;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <ComponentPickerIcon />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ComponentsPickerPopoverState>
>;

export const COMPONENT_PICKER_POPOVER = "liexp/plugin/component-picker-popover";

const ANCHOR_ID = "component-picker-popover-anchor";
const componentPickerPopoverPlugin =
  pluginFactories.createComponentPlugin<ComponentsPickerPopoverState>({
    Component: ({ plugin, ...props }) => {
      if (plugin) {
        switch (plugin.type) {
          case ACTOR_INLINE: {
            return <ActorInlineRenderer {...props} {...plugin.data} />;
          }
          case GROUP_INLINE: {
            return <GroupInlineRenderer {...props} {...plugin.data} />;
          }
          case KEYWORD_INLINE: {
            return <KeywordInlineRenderer {...props} {...plugin.data} />;
          }
          default: {
            // eslint-disable-next-line no-console
            console.log({ ...props, plugin });
            return <span>Unknown plugin </span>;
          }
        }
      }

      return <span id={ANCHOR_ID}>No plugin to display</span>;
    },
    controls: {
      type: "custom",
      Component: ({ data, add, close, open, ...props }) => {
        // console.log("control", { data, ...props });

        let container = document.getElementById("component-picker-popover");
        if (!container) {
          container = document.createElement("div");
          container.id = "component-picker-popover";
          document.body.append(container);
        }

        const root = ReactDOM.createRoot(container);
        const anchorEl = document.getElementById(ANCHOR_ID)

        root.render(
          <QueryClientProvider client={new QueryClient()}>
            <ComponentsPickerPopover
              plugin={{ data, open, ...props, add: () => {}, close: () => {} }}
              open={open}
              disablePortal={false}
              anchorEl={anchorEl}
              onClose={() => {
                close();
                root.unmount();
              }}
              onSelect={(c) => {
                // console.log("selected", c);
                add({ data: { plugin: c } });
                close();
              }}
            />
          </QueryClientProvider>
        );

        return <div />;
      },
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: COMPONENT_PICKER_POPOVER,
    object: "inline",
    isVoid: true,
    icon: <ComponentPickerIcon />,
    label: "Component Picker",
    hotKey: "/",
  });

export { componentPickerPopoverPlugin };
