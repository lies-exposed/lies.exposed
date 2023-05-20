import { type Actor } from "@liexp/shared/lib/io/http";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput";
import { ActorChip } from "../../../../actors/ActorChip";
import { Box, Button, Checkbox, FormControlLabel, Grid } from "../../../../mui";
import { FullSizeLoader } from "../../../FullSizeLoader";
import { Popover, type PopoverProps } from "../../../Popover";

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

const ActorInlineControlPopover: React.FC<{
  open: boolean;
  data: Partial<ActorInlineState>;
  onAdd: (d: ActorInlineState) => void;
  onRemove: () => void;
  onClose: () => void;
  popover?: PopoverProps;
}> = ({ data, open, onAdd, onRemove, onClose, popover }) => {
  const [s, setS] = React.useState<ActorInlineState>({
    actor: data.actor as any,
    displayAvatar: !!data?.displayAvatar,
    displayFullName: !!data?.displayFullName,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.actor ? [s.actor] : []),
    [s.actor]
  );

  return (
    <Popover {...popover} open={open} onClose={onClose}>
      <Box style={{ height: "100%", background: "white" }}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <AutocompleteActorInput
              discrete={false}
              selectedItems={selectedItems}
              onChange={(items) => {
                const newActor = items[items.length - 1];

                setS({
                  ...s,
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
              onClick={() => {
                onAdd(s);
                onClose();
              }}
            >
              Insert
            </Button>
            <Button
              onClick={() => {
                onRemove();
                onClose();
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

export const ActorInlineControl: React.FC<
  SlatePluginControls<ActorInlineState> & { popover?: PopoverProps }
> = ({ isActive, add, remove, close, data, open, popover, ...props }) => {
  if (!open) {
    return <FullSizeLoader />;
  }

  return (
    <ActorInlineControlPopover
      {...props}
      open={open}
      data={{
        actor: undefined,
        displayAvatar: true,
        displayFullName: true,
        ...data,
      }}
      popover={popover}
      onAdd={(d) => {
        add({ data: d });
        close();
      }}
      onClose={close}
      onRemove={() => {
        if (data) {
          remove();
        }
        close();
      }}
    />
  );
};

export const ActorInlineRenderer: SlateComponentPluginDefinition<ActorInlineState>["Component"] =
  ({
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
  };

const actorInlinePlugin =
  pluginFactories.createComponentPlugin<ActorInlineState>({
    Component: ActorInlineRenderer,
    controls: {
      type: "custom",
      Component: ActorInlineControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: ACTOR_INLINE,
    object: "inline",
    isVoid: true,
    icon: <RecentActorsIcon />,
    label: "Actor",
  });

export const ActorInlinePluginIcon = RecentActorsIcon;
export { actorInlinePlugin };
