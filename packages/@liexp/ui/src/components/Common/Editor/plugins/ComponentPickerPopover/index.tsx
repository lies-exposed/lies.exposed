import { COMPONENT_PICKER_POPOVER_PLUGIN } from "@liexp/shared/lib/slate/plugins/customSlate.js";
import { type CellPluginComponentProps } from "@react-page/editor/lib-es/index.js";
import { pluginFactories } from "@react-page/plugins-slate/lib-es/index.js";
import * as React from "react";
import { Icons } from '../../../../mui/index.js';
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
  icon: <Icons. ComponentPickerIcon />,
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
