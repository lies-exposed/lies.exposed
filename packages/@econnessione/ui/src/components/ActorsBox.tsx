import { Actor } from "@econnessione/shared/io/http/Actor";
import { Box, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
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
  onItemClick: (item: Actor) => void;
  style?: React.CSSProperties;
}

export const ActorsList: React.FC<{
  ids: string[];
  onItemClick: (item: Actor) => void;
}> = ({ ids, onItemClick }) => {
  return (
    <WithQueries
      queries={{ actors: Queries.Actor.getList }}
      params={{
        actors: {
          sort: { field: "updatedAt", order: "DESC" },
          pagination: { page: 1, perPage: ids.length },
          filter: {
            ids,
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ actors: { data: actors } }) => {
          // eslint-disable-next-line react/jsx-key
          return (
            <ActorList
              actors={actors.map((a) => ({ ...a, selected: true }))}
              onActorClick={onItemClick}
            />
          );
        }
      )}
    />
  );
};

export const ActorsBox: React.FC<ActorsBoxProps> = ({
  ids,
  style,
  onItemClick,
}) => {
  return (
    <Box style={style}>
      {/* <Typography variant="subtitle1">Actors</Typography> */}
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>-</Typography>,
          (ids) => <ActorsList ids={ids} onItemClick={onItemClick} />
        )
      )}
    </Box>
  );
};
