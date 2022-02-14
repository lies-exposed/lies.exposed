import { Group } from "@econnessione/shared/io/http";
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
import GroupList from "./lists/GroupList";

interface GroupsBoxProps {
  ids: string[];
  onItemClick: (g: Group.Group) => void;
  style?: React.CSSProperties;
}

export const GroupsList: React.FC<{
  ids: NEA.NonEmptyArray<string>;
  onItemClick: (g: Group.Group) => void;
  style?: React.CSSProperties;
}> = ({ ids, ...props }) => {
  return (
    <WithQueries
      queries={{ groups: Queries.Group.getList }}
      params={{
        groups: {
          pagination: { page: 1, perPage: 10 },
          sort: { field: "createdAt", order: "DESC" },
          filter: {
            ids,
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ groups: { data: groups } }) => {
          // eslint-disable-next-line react/jsx-key
          return (
            <GroupList
              {...props}
              groups={groups.map((a) => ({ ...a, selected: true }))}
            />
          );
        }
      )}
    />
  );
};

export const GroupsBox: React.FC<GroupsBoxProps> = ({
  ids,
  style,
  onItemClick,
}) => {
  return (
    <Box>
      {/* <Typography variant="subtitle1">Groups</Typography> */}
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>-</Typography>,
          (ids) => (
            <GroupsList ids={ids} style={style} onItemClick={onItemClick} />
          )
        )
      )}
    </Box>
  );
};
