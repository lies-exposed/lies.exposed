import { type Actor } from "@liexp/shared/lib/io/http";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import {
  type CellPluginComponentProps,
  type DataTType
} from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ComponentsPickerPopover } from "../ComponentPickerPopover";

export interface ComponentsPickerPopoverState extends DataTType {
  struct: Actor.Actor;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <RecentActorsIcon />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ComponentsPickerPopoverState>
>;

export const COMPONENT_PICKER_POPOVER = "liexp/plugin/component-picker-popover";

const componentPickerPopoverPlugin =
  pluginFactories.createComponentPlugin<ComponentsPickerPopoverState>({
    Component: ({
      struct,
      style,
      className,
      useSelected,
      useFocused,
      getTextContents,
      children,
      readOnly,
      ...props
    }) => {
      // console.log("component", { ...props });

      // const isSelected = useSelected();
      const isFocused = useFocused();

      // console.log({ isFocused, isSelected });
      if (!readOnly) {
        return <span>{children}</span>;
      }

      if (struct && !isFocused) {
        return <span>Struct exits</span>;
      }

      // console.log({ ...props, displayAvatar, className });
      return <span />;
    },
    controls: {
      type: "custom",
      Component: ({ add, remove, close, data, ...props }) => {
        // console.log("control", { data, ...props });
        if (!data) {
          return null;
        }

        let container = document.getElementById("#component-picker-popover");
        if (!container) {
          container = document.createElement("div");
          container.id = "component-picker-popover";
          document.body.append(container);
        }

        const root = ReactDOM.createRoot(container);
        root.render(
          <QueryClientProvider client={new QueryClient()}>
            <ComponentsPickerPopover
              open={true}
              disablePortal={true}
              onClose={() => {
                root.unmount();
              }}
              onSelect={(c) => {
                // eslint-disable-next-line no-console
                console.log("selected", c);
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
    icon: <RecentActorsIcon />,
    label: "Component Picker",
    // hotKey: "/",
    onKeyDown(e, editor, next) {
      // console.log('on key down');
    },
    customAdd(editor) {
      // console.log("custom add", editor);
    },
    customRemove(edit) {
      // console.log("custom remove");
    },
  });

export { componentPickerPopoverPlugin };
