import { type Actor } from "@liexp/shared/lib/io/http";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput";
import { ActorChip } from "../../../../actors/ActorChip";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "../../../../mui";

export interface ActorInlineState extends DataTType {
  actor: Actor.Actor;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <RecentActorsIcon />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ActorInlineState>
>;

export const ACTOR_INLINE = "liexp/actor/inline";

const actorInlinePlugin =
  pluginFactories.createComponentPlugin<ActorInlineState>({
    Component: ({
      displayFullName,
      displayAvatar,
      actor,
      style,
      className,
      useSelected,
      useFocused,
      getTextContents,
      ...props
    }) => {
      // console.log({ ...props, displayAvatar, className });
      if (actor) {
        return (
          <ActorChip
            className={className}
            style={{ ...style, display: "inline-block" }}
            displayFullName={displayFullName}
            displayAvatar={displayAvatar}
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
      Component: ({ add, remove, close, ...props }) => {
        // console.log(props);

        const [s, setS] = React.useState<ActorInlineState>({
          actor: undefined as any,
          displayAvatar: props.data?.displayAvatar ?? false,
          displayFullName: false,
        });

        const selectedItems = ([] as any[])
          .concat(s.actor ? [s.actor] : [])
          .concat(props.data?.actor ? [props.data.actor] : []);

        return (
          <Box style={{ height: 200, background: "white" }}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <AutocompleteActorInput
                  discrete={false}
                  selectedItems={selectedItems}
                  onChange={(items) => {
                    const newActor = items[items.length - 1];

                    setS({
                      ...s,
                      displayFullName: !!props.data?.displayFullName,
                      actor: newActor,
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
    type: ACTOR_INLINE,
    object: "inline",
    isVoid: true,
    icon: <RecentActorsIcon />,
    label: "Actor",
  });

export { actorInlinePlugin };
