import { Box, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { declareQueries } from "avenger/lib/react";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Queries } from "../providers/DataProvider";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import KeywordList from "./lists/KeywordList";

interface KeywordsBoxProps {
  ids: string[];
}

const withQueries = declareQueries({ keywords: Queries.Keyword.getList });

export const KeywordsList = withQueries(({ queries }): React.ReactElement => {
  return pipe(
    queries,
    QR.fold(
      LazyFullSizeLoader,
      ErrorBox,
      ({ keywords: { data: keywords } }) => {
        // eslint-disable-next-line react/jsx-key
        return (
          <KeywordList
            keywords={keywords.map((a) => ({ ...a, selected: true }))}
            onItemClick={() => undefined}
          />
        );
      }
    )
  );
});

export const KeywordsBox: React.FC<KeywordsBoxProps> = ({ ids }) => {
  return (
    <Box>
      <Typography variant="h5">Keywords</Typography>
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>No keywords</Typography>,
          (ids) => (
            <KeywordsList
              queries={{
                keywords: {
                  pagination: { page: 1, perPage: 10 },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids,
                  },
                },
              }}
            />
          )
        )
      )}
    </Box>
  );
};
