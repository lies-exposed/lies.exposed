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
import { ActorList } from "./lists/ActorList";

interface ActorsBoxProps {
  ids: string[];
}

const withQueries = declareQueries({ actors: Queries.Actor.getList });
export const ActorsList = withQueries(({ queries }) => {
  return pipe(
    queries,
    QR.fold(LazyFullSizeLoader, ErrorBox, ({ actors: { data: actors } }) => {
      // eslint-disable-next-line react/jsx-key
      return (
        <ActorList
          actors={actors.map((a) => ({ ...a, selected: true }))}
          onActorClick={() => {}}
        />
      );
    })
  );
});

export const ActorsBox: React.FC<ActorsBoxProps> = ({ ids }) => {
  return (
    <Box>
      {/* <Typography variant="subtitle1">Actors</Typography> */}
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>-</Typography>,
          (ids) => (
            <ActorsList
              queries={{
                actors: {
                  pagination: { page: 1, perPage: 10 },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids: ids,
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
