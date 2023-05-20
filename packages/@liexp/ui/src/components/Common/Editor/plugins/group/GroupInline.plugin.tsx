import { type Group } from "@liexp/shared/lib/io/http";
import { GROUP_INLINE } from '@liexp/shared/lib/slate/plugins/customSlate';
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
    [s.group]
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
  if (!open) {
    return <FullSizeLoader />;
  }

  return (
    <Popover
      {...popover}
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
