import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "./QueriesRenderer.js";
import KeywordList from "./lists/KeywordList.js";
import { Box, type BoxProps } from "./mui/index.js";

interface KeywordsBoxWrapperProps {
  params: Partial<GetListParams>;
  children: (data: Keyword.ListKeywordOutput) => JSX.Element;
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
        // eslint-disable-next-line react/jsx-key
        return children(keywords);
      }}
    />
  );
};

interface KeywordsBoxProps extends BoxProps {
  ids: string[];
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
        ids,
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
                // eslint-disable-next-line react/jsx-key
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
