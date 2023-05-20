import { type Group } from "@liexp/shared/lib/io/http";
import GroupIcon from "@mui/icons-material/GroupOutlined";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { AutocompleteGroupInput } from "../../../../Input/AutocompleteGroupInput";
import { GroupChip } from "../../../../groups/GroupChip";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "../../../../mui";
import { FullSizeLoader } from "../../../FullSizeLoader";
import { Popover, type PopoverProps } from "../../../Popover";

export interface GroupInlineState extends DataTType {
  group: Group.Group;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface GroupInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: GroupInlineSettings = {
  icon: <GroupIcon />,
};

export type GroupInlineControlType = React.ComponentType<
  CellPluginComponentProps<GroupInlineState>
>;

export const GROUP_INLINE = "liexp/group/inline";

const GroupInlinePopover: React.FC<{
  open: boolean;
  data: Omit<GroupInlineState, "group"> & { group?: Group.Group };
  onAdd: (d: GroupInlineState) => void;
  onRemove: () => void;
  onClose: () => void;
  popover?: PopoverProps;
}> = ({ open, data, onAdd, onRemove, onClose, popover, ...props }) => {
  const [s, setS] = React.useState<GroupInlineState>(data as any);
  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s?.group ? [s.group] : []),
    [s.group]
  );

  return (
    <Popover {...popover} open={open} onClose={onClose}>
      <Box style={{ height: "100%", background: "white" }}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
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

          <Grid item sm={6}>
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
    </Popover>
  );
};

export const GroupInlineControl: React.FC<
  SlatePluginControls<GroupInlineState> & { popover?: PopoverProps }
> = ({ add, remove, close, isActive, data, open, popover, ...props }) => {
  if (!open) {
    return <FullSizeLoader />;
  }

  return (
    <GroupInlinePopover
      {...props}
      data={{
        group: undefined,
        displayAvatar: true,
        displayFullName: true,
        ...data,
      }}
      popover={popover}
      open={open}
      onAdd={(d) => {
        add({ data: d });
        close();
      }}
      onRemove={() => {
        if (data) {
          remove();
        }
        close()
      }}
      onClose={close}
    />
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
    ...props
  }) => {
    // console.log("group inline", {
    //   ...props,
    //   group,
    //   displayAvatar,
    //   className,
    // });
    if (group) {
      return (
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
      );
    }
    return <span>Select a group...</span>;
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
    icon: <GroupIcon />,
    label: "Group",
  });

  export const GroupInlinePluginIcon = GroupIcon;
export { groupInlinePlugin };
