import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import * as NEA from "fp-ts/lib/NonEmptyArray.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "./QueriesRenderer.js";
import KeywordList from "./lists/KeywordList.js";
import { Box, type BoxProps } from "./mui/index.js";

interface KeywordsBoxWrapperProps {
  params: Partial<GetListParams>;
  children: (data: Keyword.ListKeywordOutput) => React.ReactElement;
}

export const KeywordsBoxWrapper: React.FC<KeywordsBoxWrapperProps> = ({
  params,
  children,
}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        keywords: Q.Keyword.list.useQuery(
          {
            ...(params as any),
          },
          undefined,
          true,
        ),
      })}
      render={({ keywords }) => {
        return children(keywords);
      }}
    />
  );
};

interface KeywordsBoxProps extends BoxProps {
  ids: readonly string[];
  onItemClick: (k: Keyword.Keyword, e: React.SyntheticEvent) => void;
  listStyle?: React.CSSProperties;
}

export const KeywordsBox: React.FC<KeywordsBoxProps> = ({
  ids,
  onItemClick,
  listStyle,
  ...props
}) => {
  return (
    <Box {...props}>
      {pipe(
        [...ids],
        NEA.fromArray,
        O.fold(
          () => null,
          (ids) => (
            <KeywordsBoxWrapper
              params={{
                pagination: { page: 1, perPage: ids.length },
                filter: {
                  ids,
                },
              }}
            >
              {({ data: keywords }) => {
                return (
                  <KeywordList
                    keywords={keywords.map((a) => ({ ...a, selected: true }))}
                    onItemClick={onItemClick}
                    style={listStyle}
                  />
                );
              }}
            </KeywordsBoxWrapper>
          ),
        ),
      )}
    </Box>
  );
};
