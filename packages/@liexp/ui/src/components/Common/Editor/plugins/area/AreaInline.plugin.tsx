import { AREA_INLINE } from "@liexp/react-page/lib/customSlate.js";
import { pluginFactories } from "@liexp/react-page/lib/index.js";
import type {
  CellPluginComponentProps,
  DataTType,
  SlateComponentPluginDefinition,
  SlatePluginControls,
} from "@liexp/react-page/lib/react-page.types.js";
import { type Area } from "@liexp/shared/lib/io/http/index.js";
import React from "react";
import { AutocompleteAreaInput } from "../../../../Input/AutocompleteAreaInput.js";
import { AreaChip } from "../../../../area/AreaChip.js";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Icons,
} from "../../../../mui/index.js";
import { Popover, type PopoverProps } from "../../../Popover.js";
import {
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
} from "../ComponentPickerPopover/ComponentPickerPopoverPluginControlAnchor.js";

export interface AreaInlineState extends DataTType {
  area: Area.Area;
  displayFeaturedMedia: boolean;
  displayLabel: boolean;
}

export interface AreaInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: AreaInlineSettings = {
  icon: <Icons.PinDrop />,
};

export type AreaInlineControlType = React.ComponentType<
  CellPluginComponentProps<AreaInlineState>
>;

export const AreaInlineControlContent: React.FC<{
  data: Partial<AreaInlineState>;
  onAdd: (d: AreaInlineState) => void;
  onRemove: () => void;
}> = ({ data, onAdd, onRemove }) => {
  const [s, setS] = React.useState<AreaInlineState>({
    area: data.area as any,
    displayFeaturedMedia: !!data?.displayFeaturedMedia,
    displayLabel: !!data?.displayLabel,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.area ? [s.area] : []),
    [s.area],
  );

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <Grid container spacing={2}>
        <Grid item sm={12} style={{ width: "100%" }}>
          <AutocompleteAreaInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              const newArea = items[items.length - 1];

              setS({
                ...s,
                area: newArea,
              });
            }}
          />
        </Grid>

        <Grid item sm={12}>
          <FormControlLabel
            control={
              <Checkbox
                color="info"
                disabled={false}
                size="small"
                value={s.displayFeaturedMedia}
                onChange={(v, c) => {
                  setS((s) => ({
                    ...s,
                    displayFeaturedMedia: c,
                  }));
                }}
              />
            }
            label="Display Avatar?"
          />
          <FormControlLabel
            control={
              <Checkbox
                color="info"
                disabled={false}
                size="small"
                checked={s.displayLabel}
                onChange={(v, c) => {
                  setS({
                    ...s,
                    displayLabel: c,
                  });
                }}
              />
            }
            label="Display full name?"
          />
        </Grid>
        <Grid item sm={12}>
          <Button
            variant="contained"
            disabled={!s.area}
            onClick={() => {
              onAdd(s);
            }}
          >
            Insert
          </Button>
          <Button
            onClick={() => {
              onRemove();
            }}
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export const AreaInlineControl: React.FC<
  SlatePluginControls<AreaInlineState> & { popover?: PopoverProps }
> = ({ isActive, add, remove, close, data, open, popover, ...props }) => {
  return (
    <ComponentPickerPopoverControlAnchorWrapper active={isActive && open}>
      {(anchorEl) => (
        <Popover
          {...popover}
          anchorEl={anchorEl}
          open={open}
          onClose={() => {
            close();
          }}
        >
          <AreaInlineControlContent
            {...props}
            data={{
              ...data,
            }}
            onAdd={(d) => {
              add({ data: d });
              close();
            }}
            onRemove={() => {
              if (data) {
                remove();
              }
              close();
            }}
          />
        </Popover>
      )}
    </ComponentPickerPopoverControlAnchorWrapper>
  );
};

export const AreaInlineRenderer: SlateComponentPluginDefinition<AreaInlineState>["Component"] =
  ({
    displayLabel,
    displayFeaturedMedia,
    area,
    style,
    className,
    useSelected,
    useFocused,
    getTextContents,
    readOnly,
    ...props
  }) => {
    const isSelected = useSelected();

    return (
      <ComponentPickerPopoverRendererAnchorWrapper
        name={`Area-${area?.id}`}
        hasData={!!area}
        isSelected={isSelected}
        readOnly={readOnly as boolean}
      >
        <AreaChip
          className={className}
          style={{ ...style, display: "inline-block" }}
          displayLabel={displayLabel}
          displayFeaturedMedia={displayFeaturedMedia}
          area={area}
          avatarStyle={{
            display: "inline-block",
            verticalAlign: "middle",
          }}
          onClick={() => {}}
        />
      </ComponentPickerPopoverRendererAnchorWrapper>
    );
  };

const areaInlinePlugin = pluginFactories.createComponentPlugin<AreaInlineState>(
  {
    Component: AreaInlineRenderer,
    controls: {
      type: "custom",
      Component: AreaInlineControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: AREA_INLINE,
    object: "inline",
    isVoid: true,
    icon: <Icons.PinDrop />,
    label: "Area",
  },
);

export const AreaInlinePluginIcon = Icons.PinDrop;

export { areaInlinePlugin };
