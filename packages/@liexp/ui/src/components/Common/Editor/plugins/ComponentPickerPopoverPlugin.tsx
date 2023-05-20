import {
  ACTOR_INLINE,
  COMPONENT_PICKER_POPOVER,
  EVENT_BLOCK_PLUGIN_ID,
  GROUP_INLINE,
  KEYWORD_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import ComponentPickerIcon from "@mui/icons-material/ManageSearchOutlined";
import {
  type CellPluginComponentProps,
  type DataTType,
} from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { CircularProgress } from "../../../mui";
import {
  ComponentsPickerPopover,
  type PickablePlugin,
} from "../components/ComponentPickerPopover";
import { ActorInlineRenderer } from "./actor/ActorInline.plugin";
import { EventBlockPluginRenderer } from "./event/eventBlock.plugin";
import { GroupInlineRenderer } from "./group/GroupInline.plugin";
import { KeywordInlineRenderer } from "./keyword/KeywordInline.plugin";
import { MediaBlockPluginRenderer } from "./media/mediaBlock";

export const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  // eslint-disable-next-line no-console
  console.error("error", error);
  return (
    <>
      <div>{error.name}</div>
      <div>{error.message}</div>
    </>
  );
};
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

export const ANCHOR_ID = "component-picker-popover-anchor";

// let root: ReactDOM.Root | undefined;

export const ComponentPickerPopoverControl: React.FC<
  SlatePluginControls<ComponentsPickerPopoverState>
> = ({ data, add, close, open, isActive, ...props }) => {
  const anchorEl = document.getElementById(ANCHOR_ID);
  // console.log("control", { isActive, open, anchorEl: !!anchorEl });
  return open && isActive && anchorEl ? (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <React.Suspense>
        <ComponentsPickerPopover
          plugin={
            {
              data: data?.plugin,
              isActive,
              open,
              ...props,
              pluginConfig: {
                ...(props.pluginConfig as any),
              },
              add: () => {},
              close: () => {},
            } as any
          }
          open={open}
          disablePortal={false}
          anchorEl={anchorEl}
          anchorPosition={{ top: 25, left: 0 }}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={() => {
            close();
          }}
          onSelect={(plugin) => {
            add({ data: { plugin } });
            close();
          }}
        />
      </React.Suspense>
    </ErrorBoundary>
  ) : null;
};

export const ComponentPickerPopoverControlAnchor: React.FC<{
  onLoad?: () => void;
}> = ({ onLoad }) => {
  const ref = React.createRef<HTMLElement>();

  const anchorEl = React.useMemo(() => {
    const el = document.getElementById(ANCHOR_ID);
    if (el) {
      return null;
    }

    return (
      <span
        id={ANCHOR_ID}
        ref={ref}
        style={{ width: 10, height: 10, background: "green", display: "block" }}
      />
    );
  }, []);

  React.useEffect(() => {
    if (ref.current) {
      if (ref.current.id) {
        ref.current.click();
        onLoad?.();
      }
    }
  }, []);

  return anchorEl;
};

export const ComponentPickerPopoverRenderer: SlateComponentPluginDefinition<ComponentsPickerPopoverState>["Component"] =
  ({ plugin, readOnly, useSelected, ...props }) => {
    const isSelected = useSelected();
    // console.log("component picker popover rendere props", { ...props, plugin });
    const pluginRenderer = React.useMemo(() => {
      if (plugin?.data) {
        switch (plugin.type) {
          case ACTOR_INLINE: {
            return (
              <ActorInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case GROUP_INLINE: {
            return (
              <GroupInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case KEYWORD_INLINE: {
            return (
              <KeywordInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case EVENT_BLOCK_PLUGIN_ID: {
            return (
              <EventBlockPluginRenderer
                {...props}
                data={plugin.data}
                readOnly={true}
                focused={false}
                isPreviewMode={false}
                isEditMode={false}
                nodeId={uuid()}
                onChange={() => {}}
              />
            );
          }
          case MEDIA_BLOCK_PLUGIN: {
            return (
              <MediaBlockPluginRenderer
                {...props}
                readOnly={true}
                focused={false}
                isPreviewMode={false}
                isEditMode={false}
                nodeId={uuid()}
                onChange={() => {}}
                data={plugin.data}
              />
            );
          }
          default: {
            // eslint-disable-next-line no-console
            console.log({ ...props, plugin });
            return <span>Unknown plugin: {(plugin as any).type}</span>;
          }
        }
      }
      return null;
    }, [plugin]);

    return (
      <span>
        {(!readOnly && !plugin) || !plugin || isSelected ? (
          <ComponentPickerPopoverControlAnchor />
        ) : null}
        <React.Suspense fallback={<CircularProgress />}>
          {pluginRenderer}
        </React.Suspense>
      </span>
    );
  };

const componentPickerPopoverPlugin =
  pluginFactories.createComponentPlugin<ComponentsPickerPopoverState>({
    Component: ComponentPickerPopoverRenderer,
    controls: {
      type: "custom",
      Component: ComponentPickerPopoverControl,
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
