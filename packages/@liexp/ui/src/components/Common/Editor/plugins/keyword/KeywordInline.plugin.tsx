import { type Keyword } from "@liexp/shared/lib/io/http";
import RecentKeywordsIcon from "@mui/icons-material/TagOutlined";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { AutocompleteKeywordInput } from "../../../../Input/AutocompleteKeywordInput";
import { KeywordChip } from "../../../../keywords/KeywordChip";
import { Box, Button, Grid } from "../../../../mui";
import { FullSizeLoader } from "../../../FullSizeLoader";
import { Popover, type PopoverProps } from "../../../Popover";

export interface KeywordInlineState extends DataTType {
  keyword: Keyword.Keyword;
  colorize: boolean;
}

export interface KeywordInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: KeywordInlineSettings = {
  icon: <RecentKeywordsIcon />,
};

export type KeywordInlineControlType = React.ComponentType<
  CellPluginComponentProps<KeywordInlineState>
>;

export const KEYWORD_INLINE = "liexp/keyword/inline";

const KeywordInlineControlPopover: React.FC<{
  open: boolean;
  data: Partial<KeywordInlineState>;
  onAdd: (d: KeywordInlineState) => void;
  onRemove: () => void;
  onClose: () => void;
  popover?: PopoverProps;
}> = ({ open, data, onAdd, onRemove, onClose, popover }) => {
  const [s, setS] = React.useState<KeywordInlineState>({
    keyword: data.keyword as any,
    colorize: !!data.colorize,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.keyword ? [s.keyword] : []),
    [s.keyword]
  );

  return (
    <Popover {...popover} open={open} onClose={onClose}>
      <Box style={{ height: "100%", background: "white" }}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <AutocompleteKeywordInput
              discrete={false}
              selectedItems={selectedItems}
              onChange={(items) => {
                const newKeyword = items[items.length - 1];

                setS({
                  ...s,
                  keyword: newKeyword,
                });
              }}
            />
          </Grid>

          <Grid item sm={12}>
            <Button
              variant="contained"
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
export const KeywordInlineControl: React.FC<
  SlatePluginControls<KeywordInlineState>
> = ({ isActive, data, close, add, remove, open, ...props }) => {
  if (!open) {
    return <FullSizeLoader />;
  }
  return (
    <KeywordInlineControlPopover
      {...props}
      open={open}
      data={{
        keyword: undefined,
        colorize: true,
        ...data,
      }}
      onAdd={(data) => {
        add({ data });
      }}
      onClose={close}
      onRemove={() => {
        if (data) {
          remove();
        }
      }}
    />
  );
};

export const KeywordInlineRenderer: SlateComponentPluginDefinition<KeywordInlineState>["Component"] =
  ({
    displayFullName,
    displayAvatar,
    keyword,
    useFocused,
    useSelected,
    getTextContents,
    ...props
  }) => {
    // console.log({ ...props, displayAvatar, className });
    if (keyword) {
      return <KeywordChip {...props} keyword={keyword} onClick={() => {}} />;
    }
    return <span>Select a keyword...</span>;
  };

const keywordInlinePlugin =
  pluginFactories.createComponentPlugin<KeywordInlineState>({
    Component: KeywordInlineRenderer,
    controls: {
      type: "custom",
      Component: KeywordInlineControl,
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: KEYWORD_INLINE,
    object: "inline",
    isVoid: true,
    icon: <RecentKeywordsIcon />,
    label: "Keyword",
  });

export const KeywordInlinePluginIcon = RecentKeywordsIcon;

export { keywordInlinePlugin };
