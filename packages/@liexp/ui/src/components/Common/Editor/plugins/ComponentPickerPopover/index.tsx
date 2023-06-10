import { COMPONENT_PICKER_POPOVER_PLUGIN } from "@liexp/shared/lib/slate/plugins/customSlate";
import ComponentPickerIcon from "@mui/icons-material/SearchOffOutlined";
import { type CellPluginComponentProps } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import * as React from "react";
import { ComponentPickerPopoverControl } from "./ComponentPickerPopoverPluginControl";
import {
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
} from "./ComponentPickerPopoverPluginControlAnchor";
import { ComponentPickerPopoverRenderer } from "./ComponentPickerPopoverPluginRenderer";
import { type ComponentPickerPopoverState } from "./types";

export interface ComponentPickerPopoverSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ComponentPickerPopoverSettings = {
  icon: <ComponentPickerIcon />,
};

export type ComponentPickerPopoverControlType = React.ComponentType<
  CellPluginComponentProps<ComponentPickerPopoverState>
>;

const componentPickerPopoverPlugin =
  pluginFactories.createComponentPlugin<ComponentPickerPopoverState>({
    Component: ComponentPickerPopoverRenderer,
    controls: {
      type: "custom",
      Component: ComponentPickerPopoverControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: COMPONENT_PICKER_POPOVER_PLUGIN,
    object: "inline",
    isVoid: true,
    icon: <ComponentPickerIcon />,
    label: "Component Picker",
    hotKey: "ctrl+/",
  });

export {
  componentPickerPopoverPlugin,
  ComponentPickerPopoverControl,
  ComponentPickerPopoverRenderer,
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
  type ComponentPickerPopoverState,
};
