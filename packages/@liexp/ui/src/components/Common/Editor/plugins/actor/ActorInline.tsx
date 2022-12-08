import { Actor } from "@liexp/shared/io/http";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput";
import { ActorChip } from "../../../../actors/ActorChip";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "../../../../mui";

export interface ActorInlineState extends DataTType {
  actor: Actor.Actor;
  displayFullName: boolean;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <MediaIcon />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ActorInlineState> & {}
>;

const actorInlinePlugin: any =
  pluginFactories.createComponentPlugin<ActorInlineState>({
    Component: ({ displayFullName, actor, style, className, ...props }) => {
      // console.log({ ...props, actor, style, className, displayFullName });
      if (actor) {
        return (
          <ActorChip
            className={className}
            style={{ ...style, display: "inline-block" }}
            displayFullName={displayFullName}
            actor={actor}
            avatarStyle={{
              display: "inline-block",
              verticalAlign: "middle",
            }}
            onClick={() => {}}
          />
        );
      }
      return <span>Select an actor...</span>;
    },
    controls: {
      type: "custom",
      Component: ({ add, remove, ...props }) => {
        const [s, setS] = React.useState<ActorInlineState>({
          actor: undefined as any,
          displayFullName: false,
        });

        const selectedItems = ([] as any[])
          .concat(s.actor ? [s.actor] : [])
          .concat(props.data?.actor ? [props.data.actor] : []);

        return (
          <Box style={{ height: 200 }}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <AutocompleteActorInput
                  selectedItems={selectedItems}
                  onChange={(items) => {
                    const newActor = items[items.length - 1];

                    setS({
                      displayFullName: !!props.data?.displayFullName,
                      actor: newActor as any,
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
                      value={props.data?.displayFullName ?? s.displayFullName}
                      onChange={(v, c) => {
                        setS({
                          ...s,
                          actor: selectedItems[0],
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
    type: "ActorInline",
    object: "inline",
    isVoid: true,
    icon: <RecentActorsIcon />,
    label: "Actor",
  });

export { actorInlinePlugin };
