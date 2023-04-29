import { type Keyword } from "@liexp/shared/lib/io/http";
import RecentKeywordsIcon from "@mui/icons-material/TagOutlined";
import type { CellPluginComponentProps, DataTType } from "@react-page/editor";
import { pluginFactories } from "@react-page/plugins-slate";
import React from "react";
import { AutocompleteKeywordInput } from "../../../../Input/AutocompleteKeywordInput";
import { KeywordChip } from "../../../../keywords/KeywordChip";
import { Box, Button, Grid } from "../../../../mui";

export interface KeywordInlineState extends DataTType {
  keyword: Keyword.Keyword;
  displayAvatar: boolean;
  displayFullName: boolean;
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

const keywordInlinePlugin =
  pluginFactories.createComponentPlugin<KeywordInlineState>({
    Component: ({
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
    },
    controls: {
      type: "custom",
      Component: ({ add, remove, close, ...props }) => {
        // console.log(props);

        const [s, setS] = React.useState<KeywordInlineState>({
          keyword: undefined as any,
          displayAvatar: props.data?.displayAvatar ?? false,
          displayFullName: false,
        });

        const selectedItems = ([] as any[])
          .concat(s.keyword ? [s.keyword] : [])
          .concat(props.data?.keyword ? [props.data.keyword] : []);

        return (
          <Box style={{ height: 200, background: "white" }}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <AutocompleteKeywordInput
                  discrete={false}
                  selectedItems={selectedItems}
                  onChange={(items) => {
                    const newKeyword = items[items.length - 1];

                    setS({
                      ...s,
                      displayFullName: !!props.data?.displayFullName,
                      keyword: newKeyword,
                    });
                  }}
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
                  Insert Keyword
                </Button>
                <Button
                  onClick={() => {
                    remove();
                  }}
                >
                  Remove Keyword
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      },
    },
    addHoverButton: true,
    addToolbarButton: true,
    type: KEYWORD_INLINE,
    object: "inline",
    isVoid: true,
    icon: <RecentKeywordsIcon />,
    label: "Keyword",
  });

export { keywordInlinePlugin };
