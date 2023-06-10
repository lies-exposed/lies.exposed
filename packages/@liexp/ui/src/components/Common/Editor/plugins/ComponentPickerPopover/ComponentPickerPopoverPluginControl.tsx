import { type SlatePluginControls } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { ComponentsPickerPopover } from "./ComponentPickerPopover";
import { ComponentPickerPopoverControlAnchorWrapper } from "./ComponentPickerPopoverPluginControlAnchor";
import { type ComponentPickerPopoverState } from "./types";

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
// let root: ReactDOM.Root | undefined;

export const ComponentPickerPopoverControl: React.FC<
  SlatePluginControls<ComponentPickerPopoverState>
> = ({ data, add, close, open, isActive, ...props }) => {
  return (
    <ComponentPickerPopoverControlAnchorWrapper active={open && isActive}>
      {(anchorEl) => {
        return (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <React.Suspense>
              <ComponentsPickerPopover
                plugin={
                  {
                    ...props,
                    data: data?.plugin,
                    isActive,
                    open,
                    pluginConfig: props.pluginConfig as any,
                    add: () => {},
                    close: () => {},
                  } as any
                }
                open={true}
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
        );
      }}
    </ComponentPickerPopoverControlAnchorWrapper>
  );
};
