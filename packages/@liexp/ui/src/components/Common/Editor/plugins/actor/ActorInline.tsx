import { Actor } from "@liexp/shared/io/http";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import ActorsBox from "../../../../../containers/ActorsBox";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput";
import { Box, Checkbox, FormControlLabel, Grid } from "../../../../mui";

export interface ActorInlineState extends DataTType {
  actor?: Actor.Actor;
  displayFullName?: boolean;
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
        const ids = [actor.id];
        return (
          <ActorsBox
            className={className}
            style={{ ...style, display: "inline-block" }}
            itemStyle={{ display: "inline" }}
            displayFullName={displayFullName}
            params={{
              filter: { ids },
              pagination: { perPage: 1, page: 1 },
              sort: { field: "createdAt", order: "DESC" },
            }}
            onItemClick={() => {}}
          />
        );
      }
      return <span>Select an actor...</span>;
    },
    controls: {
      type: "custom",
      Component: ({ add, remove, ...props }) => {
        return (
          <Box style={{ height: 200 }}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <AutocompleteActorInput
                  {...props}
                  selectedItems={props.data?.actor ? [props.data.actor] : []}
                  onChange={(items) => {
                    const newActor = items[items.length - 1];
                    add({
                      data: {
                        displayFullName: props.data?.displayFullName,
                        actor: newActor,
                      },
                      text: `Actor updated ${newActor.fullName}`,
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
                      onChange={(v, c) => {
                        add({
                          data: {
                            actor: props.data?.actor,
                            displayFullName: c,
                          },
                        });
                      }}
                    />
                  }
                  label="Display full name?"
                />
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
    isVoid: true, // <--- makes it a void plugin
    icon: <RecentActorsIcon />,
    label: "Actor",
  });

export { actorInlinePlugin };
