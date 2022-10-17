import { Keyword } from '@liexp/shared/io/http';
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { useKeywordsQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import KeywordList from "./lists/KeywordList";
import { Box, BoxProps, Typography } from "./mui";

interface KeywordsBoxProps extends BoxProps {
  ids: string[];
  onItemClick: (k: Keyword.Keyword) => void;
}

export const KeywordsList: React.FC<KeywordsBoxProps> = ({ ids, onItemClick }) => {
  return (
    <QueriesRenderer
      queries={{
        keywords: useKeywordsQuery({
          pagination: { page: 1, perPage: ids.length },
          filter: {
            ids,
          },
        }, true),
      }}
      render={({ keywords: { data: keywords } }) => {
        // eslint-disable-next-line react/jsx-key
        return (
          <KeywordList
            keywords={keywords.map((a) => ({ ...a, selected: true }))}
            onItemClick={onItemClick}
          />
        );
      }}
    />
  );
};

export const KeywordsBox: React.FC<KeywordsBoxProps> = ({ ids, onItemClick, ...props }) => {
  return (
    <Box {...props}>
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography display="inline">-</Typography>,
          (ids) => <KeywordsList ids={ids} onItemClick={onItemClick} />
        )
      )}
    </Box>
  );
};
