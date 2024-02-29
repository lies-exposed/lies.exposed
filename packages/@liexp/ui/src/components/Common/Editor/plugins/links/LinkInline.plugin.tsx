import { pluginFactories } from "@liexp/react-page/lib/index.js";
import type {
  CellPluginComponentProps,
  DataTType,
} from "@liexp/react-page/lib/react-page.types.js";
import { LINK_INLINE } from "@liexp/react-page/lib/slate/plugins/customSlate.js";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@liexp/react-page/lib/slate/types.js";
import { type Link } from "@liexp/shared/lib/io/http/index.js";
import React from "react";
import { AutocompleteLinkInput } from "../../../../Input/AutocompleteLinkInput.js";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Icons,
} from "../../../../mui/index.js";
import { FullSizeLoader } from "../../../FullSizeLoader.js";
import { Popover, type PopoverProps } from "../../../Popover.js";

export interface LinkInlineState extends DataTType {
  actor: Link.Link;
  displayAvatar: boolean;
  displayFullName: boolean;
}

export interface LinkInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: LinkInlineSettings = {
  icon: <Icons.LinkIcon />,
};

export type LinkInlineControlType = React.ComponentType<
  CellPluginComponentProps<LinkInlineState>
>;

export const LinkInlineControlContent: React.FC<{
  data: Partial<LinkInlineState>;
  onAdd: (d: LinkInlineState) => void;
  onRemove: () => void;
}> = ({ data, onAdd, onRemove }) => {
  const [s, setS] = React.useState<LinkInlineState>({
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
          <AutocompleteLinkInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              const newLink = items[items.length - 1];

              setS({
                ...s,
                actor: newLink,
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

export const LinkInlineControl: React.FC<
  SlatePluginControls<LinkInlineState> & { popover?: PopoverProps }
> = ({ isActive, add, remove, close, data, open, popover, ...props }) => {
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
      <LinkInlineControlContent
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
  );
};

export const LinkInlineRenderer: SlateComponentPluginDefinition<LinkInlineState>["Component"] =
  ({
    displayFullName,
    displayAvatar,
    actor,
    style,
    className,
    useSelected,
    useFocused,
    getTextContents,
    children,
    ...props
  }) => {
    // console.log({ ...props, displayAvatar, className });
    if (actor) {
      return (
        <a
          className={className}
          style={{ ...style, display: "inline-block" }}
          onClick={() => {}}
        >
          {children}
        </a>
      );
    }
    return <span>Select an actor...</span>;
  };

const linkInlinePlugin = pluginFactories.createComponentPlugin<LinkInlineState>(
  {
    Component: LinkInlineRenderer,
    controls: {
      type: "custom",
      Component: LinkInlineControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: LINK_INLINE,
    object: "inline",
    isVoid: true,
    icon: <Icons.LinkIcon />,
    label: "Link",
  },
);

export const LinkInlinePluginIcon = Icons.LinkIcon;
export { linkInlinePlugin };
