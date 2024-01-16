import { type Actor } from "@liexp/shared/lib/io/http/index.js";
import { ACTOR_INLINE } from "@liexp/shared/lib/slate/plugins/customSlate.js";
import type {
  CellPluginComponentProps,
  DataTType,
} from "@react-page/editor/lib-es/index.js";
import { pluginFactories } from "@react-page/plugins-slate/lib-es/index.js";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib-es/types/slatePluginDefinitions.js";
import React from "react";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput.js";
import { ActorChip } from "../../../../actors/ActorChip.js";
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

export interface ActorInlineState extends DataTType {
  actor: Actor.Actor;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface ActorInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: ActorInlineSettings = {
  icon: <Icons.RecentActors />,
};

export type ActorInlineControlType = React.ComponentType<
  CellPluginComponentProps<ActorInlineState>
>;

export const ActorInlineControlContent: React.FC<{
  data: Partial<ActorInlineState>;
  onAdd: (d: ActorInlineState) => void;
  onRemove: () => void;
}> = ({ data, onAdd, onRemove }) => {
  const [s, setS] = React.useState<ActorInlineState>({
    actor: data.actor as any,
    displayAvatar: !!data?.displayAvatar,
    displayFullName: !!data?.displayFullName,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.actor ? [s.actor] : []),
    [s.actor],
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

        <Grid item sm={12}>
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
            variant="contained"
            disabled={!s.actor}
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

export const ActorInlineControl: React.FC<
  SlatePluginControls<ActorInlineState> & { popover?: PopoverProps }
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
          <ActorInlineControlContent
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
    readOnly,
    ...props
  }) => {
    const isSelected = useSelected();

    return (
      <ComponentPickerPopoverRendererAnchorWrapper
        name={`actor-${actor?.id}`}
        hasData={!!actor}
        isSelected={isSelected}
        readOnly={readOnly as boolean}
      >
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
      </ComponentPickerPopoverRendererAnchorWrapper>
    );
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
    icon: <Icons.RecentActors />,
    label: "Actor",
  });

export const ActorInlinePluginIcon = Icons.RecentActors;

export { actorInlinePlugin };
