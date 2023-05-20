import { type Keyword } from "@liexp/shared/lib/io/http";
import { KEYWORD_INLINE } from '@liexp/shared/lib/slate/plugins/customSlate';
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
import { Popover } from "../../../Popover";

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

export const KeywordInlineControlContent: React.FC<{
  data: Partial<KeywordInlineState>;
  onAdd: (d: KeywordInlineState) => void;
  onRemove: () => void;
}> = ({ data, onAdd, onRemove }) => {
  const [s, setS] = React.useState<KeywordInlineState>({
    keyword: data.keyword as any,
    colorize: !!data.colorize,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.keyword ? [s.keyword] : []),
    [s.keyword]
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
            disabled={!s.keyword}
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
export const KeywordInlineControl: React.FC<
  SlatePluginControls<KeywordInlineState>
> = ({ isActive, data, close, add, remove, open, ...props }) => {
  if (!open) {
    return <FullSizeLoader />;
  }
  return (
    <Popover
      {...props}
      open={open}
      onClose={() => {
        close();
      }}
    >
      <KeywordInlineControlContent
        {...props}
        data={{
          keyword: undefined,
          colorize: true,
          ...data,
        }}
        onAdd={(data) => {
          add({ data });
        }}
        onRemove={() => {
          if (data) {
            remove();
          }
        }}
      />
    </Popover>
  );
};

export const KeywordInlineRenderer: SlateComponentPluginDefinition<KeywordInlineState>["Component"] =
  ({
    displayFullName,
    displayAvatar,
    keyword,
    colorize,
    useFocused,
    useSelected,
    getTextContents,
    childNodes,
    children,
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
