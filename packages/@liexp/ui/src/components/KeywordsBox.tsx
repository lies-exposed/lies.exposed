import { Keyword } from '@liexp/shared/io/http';
import { Box, Typography } from "@material-ui/core";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useKeywordsQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import KeywordList from "./lists/KeywordList";

interface KeywordsBoxProps {
  ids: string[];
  onItemClick: (k: Keyword.Keyword) => void;
}

export const KeywordsList: React.FC<KeywordsBoxProps> = ({ ids, onItemClick }) => {
  return (
    <QueriesRenderer
      queries={{
        keywords: useKeywordsQuery({
          pagination: { page: 1, perPage: 10 },
          sort: { field: "createdAt", order: "DESC" },
          filter: {
            ids,
          },
        }),
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

export const KeywordsBox: React.FC<KeywordsBoxProps> = ({ ids, onItemClick }) => {
  return (
    <Box>
      {/* <Typography variant="subtitle1" display="inline">
        Keywords:{" "}
      </Typography> */}
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
