import { KEYWORD_INLINE } from "@liexp/react-page/lib/customSlate.js";
import { pluginFactories } from "@liexp/react-page/lib/index.js";
import type {
  CellPluginComponentProps,
  DataTType,
} from "@liexp/react-page/lib/react-page.types.js";
import {
  type SlateComponentPluginDefinition,
  type SlatePluginControls,
} from "@liexp/react-page/lib/react-page.types.js";
import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import React from "react";
import { AutocompleteKeywordInput } from "../../../../Input/AutocompleteKeywordInput.js";
import { KeywordChip } from "../../../../keywords/KeywordChip.js";
import { Box, Button, Grid, Icons } from "../../../../mui/index.js";
import { FullSizeLoader } from "../../../FullSizeLoader.js";
import { Popover } from "../../../Popover.js";
import {
  ComponentPickerPopoverControlAnchorWrapper,
  ComponentPickerPopoverRendererAnchorWrapper,
} from "../ComponentPickerPopover/ComponentPickerPopoverPluginControlAnchor.js";

export interface KeywordInlineState extends DataTType {
  keyword: Keyword.Keyword;
  colorize: boolean;
}

export interface KeywordInlineSettings {
  icon?: React.ReactNode;
}

export const defaultSettings: KeywordInlineSettings = {
  icon: <Icons.RecentKeywordsIcon />,
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
    [s.keyword],
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
> = ({
  isActive,
  data,
  close,
  add,
  remove,
  open,
  shouldInsertWithText,
  pluginConfig,
  ...props
}) => {
  if (!open) {
    return <FullSizeLoader />;
  }
  return (
    <ComponentPickerPopoverControlAnchorWrapper active={isActive}>
      {(anchorEl) => (
        <Popover
          {...props}
          anchorEl={anchorEl}
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
      )}
    </ComponentPickerPopoverControlAnchorWrapper>
  );
};

export const KeywordInlineRenderer: SlateComponentPluginDefinition<KeywordInlineState>["Component"] =
  (props) => {
    const {
      displayFullName,
      displayAvatar,
      keyword,
      colorize,
      useFocused,
      useSelected,
      getTextContents,
      childNodes,
      children,
      readOnly,
      pluginConfig,
      shouldInsertWithText,
      ...otherProps
    } = props;

    return (
      <ComponentPickerPopoverRendererAnchorWrapper
        name={`keywords-${keyword?.id}`}
        readOnly={readOnly as boolean}
        isSelected={useSelected()}
        hasData={!!keyword}
      >
        <KeywordChip {...otherProps} keyword={keyword} />
      </ComponentPickerPopoverRendererAnchorWrapper>
    );
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
    icon: <Icons.RecentKeywordsIcon />,
    label: "Keyword",
  });

export const KeywordInlinePluginIcon = Icons.RecentKeywordsIcon;

export { keywordInlinePlugin };
