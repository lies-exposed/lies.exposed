import { Box, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { useQueries } from "avenger/lib/react";
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
}

export const GroupsList: React.FC<{ ids: NEA.NonEmptyArray<string> }> = ({
  ids,
}) => {
  const queries = useQueries(
    {
      groups: Queries.Group.getList,
    },
    {
      groups: {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "createdAt", order: "DESC" },
        filter: {
          ids,
        },
      },
    }
  );
  return pipe(
    queries,
    QR.fold(LazyFullSizeLoader, ErrorBox, ({ groups: { data: groups } }) => {
      // eslint-disable-next-line react/jsx-key
      return (
        <GroupList
          groups={groups.map((a) => ({ ...a, selected: true }))}
          onGroupClick={() => {}}
        />
      );
    })
  );
};

export const GroupsBox: React.FC<GroupsBoxProps> = ({ ids }) => {
  return (
    <Box>
      <Typography variant="h5">Groups</Typography>
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>No groups</Typography>,
          (ids) => <GroupsList ids={ids} />
        )
      )}
    </Box>
  );
};
