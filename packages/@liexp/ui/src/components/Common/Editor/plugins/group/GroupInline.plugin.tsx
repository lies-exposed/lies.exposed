import { type Group } from "@liexp/shared/lib/io/http";
import RecentGroupsIcon from "@mui/icons-material/RecentActors";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import { AutocompleteGroupInput } from "../../../../Input/AutocompleteGroupInput";
import { GroupChip } from "../../../../groups/GroupChip";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "../../../../mui";

export interface GroupInlineState extends DataTType {
  group: Group.Group;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface GroupInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: GroupInlineSettings = {
  icon: <RecentGroupsIcon />,
};

export type GroupInlineControlType = React.ComponentType<
  CellPluginComponentProps<GroupInlineState>
>;

export const GROUP_INLINE = "liexp/group/inline";

const groupInlinePlugin =
  pluginFactories.createComponentPlugin<GroupInlineState>({
    Component: ({
      displayFullName,
      displayAvatar,
      group,
      style,
      className,
      getTextContents,
      ...props
    }) => {
      // console.log({ ...props, displayAvatar, className });
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
    },
    controls: {
      type: "custom",
      Component: ({ add, remove, close, ...props }) => {
        // console.log(props);

        const [s, setS] = React.useState<GroupInlineState>({
          group: undefined as any,
          displayAvatar: props.data?.displayAvatar ?? false,
          displayFullName: false,
        });

        const selectedItems = ([] as any[])
          .concat(s.group ? [s.group] : [])
          .concat(props.data?.group ? [props.data.group] : []);

        return (
          <Box style={{ height: 200, background: "white" }}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <AutocompleteGroupInput
                  discrete={false}
                  selectedItems={selectedItems}
                  onChange={(items) => {
                    const newGroup = items[items.length - 1];

                    setS({
                      ...s,
                      displayFullName: !!props.data?.displayFullName,
                      group: newGroup,
                    });
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
                      value={s.displayAvatar}
                      onChange={(v, c) => {
                        setS((s) => ({
                          ...s,
                          displayAvatar: c,
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
                      value={props.data?.displayFullName ?? s.displayFullName}
                      onChange={(v, c) => {
                        setS({
                          ...s,
                          group: selectedItems[0],
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
                  onClick={() => {
                    add({
                      data: s,
                    });
                  }}
                >
                  Insert actor
                </Button>
                <Button
                  onClick={() => {
                    remove();
                  }}
                >
                  Remove actor
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      },
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: GROUP_INLINE,
    object: "inline",
    isVoid: true,
    icon: <RecentGroupsIcon />,
    label: "Group",
  });

export { groupInlinePlugin  };
