import { COMPONENT_PICKER_POPOVER_PLUGIN } from "@liexp/react-page/lib/customSlate.js";
import { pluginFactories } from "@liexp/react-page/lib/index.js";
import { type CellPluginComponentProps } from "@liexp/react-page/lib/react-page.types.js";
import * as React from "react";
import { Icons } from "../../../../mui/index.js";
import { ComponentPickerPopoverControl } from "./ComponentPickerPopoverPluginControl.js";
import {
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
} from "./ComponentPickerPopoverPluginControlAnchor.js";
import { ComponentPickerPopoverRenderer } from "./ComponentPickerPopoverPluginRenderer.js";
import { type ComponentPickerPopoverState } from "./types.js";

export interface ComponentPickerPopoverSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ComponentPickerPopoverSettings = {
  icon: <Icons.ComponentPickerIcon />,
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
    icon: <Icons.ComponentPickerIcon />,
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
