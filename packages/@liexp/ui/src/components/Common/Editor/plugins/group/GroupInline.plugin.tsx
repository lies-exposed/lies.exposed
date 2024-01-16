import { type Group } from "@liexp/shared/lib/io/http/index.js";
import { GROUP_INLINE } from "@liexp/shared/lib/slate/plugins/customSlate.js";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor/lib-es/index.js";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib/types/slatePluginDefinitions.js";
import { pluginFactories } from "@react-page/plugins-slate/lib-es/index.js";
import React from "react";
import { AutocompleteGroupInput } from "../../../../Input/AutocompleteGroupInput.js";
import { GroupChip } from "../../../../groups/GroupChip.js";
import { Box, Button, Checkbox, FormControlLabel, Grid, Icons } from "../../../../mui/index.js";
import { Popover, type PopoverProps } from "../../../Popover.js";
import {
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
} from "../ComponentPickerPopover/ComponentPickerPopoverPluginControlAnchor.js";

export interface GroupInlineState extends DataTType {
  group: Group.Group;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface GroupInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: GroupInlineSettings = {
  icon: <Icons.GroupIcon />,
};

export type GroupInlineControlType = React.ComponentType<
  CellPluginComponentProps<GroupInlineState>
>;

export const GroupInlineControlContent: React.FC<{
  data: Partial<GroupInlineState>;
  onAdd: (d: GroupInlineState) => void;
  onRemove: () => void;
}> = ({ data, onAdd, onRemove }) => {
  const [s, setS] = React.useState<GroupInlineState>({
    group: data.group as any,
    displayAvatar: !!data.displayAvatar,
    displayFullName: !!data.displayFullName,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s?.group ? [s.group] : []),
    [s.group],
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
        <Grid item sm={12}>
          <AutocompleteGroupInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              const newGroup = items[items.length - 1];

              setS((s) => ({
                ...s,
                group: newGroup,
              }));
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
                checked={s.displayAvatar}
                onChange={(v, c) => {
                  setS({
                    ...s,
                    displayAvatar: c,
                  });
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
                checked={s.displayFullName}
                onChange={(v, c) => {
                  setS({
                    ...s,
                    displayFullName: c,
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
            disabled={!s.group}
            onClick={() => {
              onAdd(s);
            }}
          >
            Add
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

export const GroupInlineControl: React.FC<
  SlatePluginControls<GroupInlineState> & { popover?: PopoverProps }
> = ({ add, remove, close, isActive, data, open, popover, ...props }) => {
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
          <GroupInlineControlContent
            {...props}
            data={{ ...data }}
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

export const GroupInlineRenderer: SlateComponentPluginDefinition<GroupInlineState>["Component"] =
  ({
    displayFullName,
    displayAvatar,
    group,
    style,
    className,
    getTextContents,
    useSelected,
    readOnly,
    ...props
  }) => {
    // console.log("group inline", {
    //   ...props,
    //   group,
    //   displayAvatar,
    //   className,
    // });

    return (
      <ComponentPickerPopoverRendererAnchorWrapper
        name={`group-${group?.id}`}
        readOnly={readOnly as any}
        hasData={!!group}
        isSelected={useSelected()}
      >
        <GroupChip
          className={className}
          style={{ ...style, display: "inline-block" }}
          displayName={displayFullName}
          // displayAvatar={displayAvatar}
          group={group}
          avatarStyle={{
            display: "inline-block",
            verticalAlign: "middle",
          }}
          onClick={() => {}}
        />
      </ComponentPickerPopoverRendererAnchorWrapper>
    );
  };

const groupInlinePlugin =
  pluginFactories.createComponentPlugin<GroupInlineState>({
    Component: GroupInlineRenderer,
    controls: {
      type: "custom",
      Component: GroupInlineControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: GROUP_INLINE,
    object: "inline",
    isVoid: true,
    icon: <Icons.GroupIcon />,
    label: "Group",
  });

export const GroupInlinePluginIcon = Icons.GroupIcon;
export { groupInlinePlugin };
