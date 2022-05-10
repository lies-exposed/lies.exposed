import { Group } from "@liexp/shared/io/http";
import { Box, Typography } from "@mui/material";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useGroupsQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import GroupList from "./lists/GroupList";

interface GroupsBoxProps {
  ids: string[];
  onItemClick: (g: Group.Group) => void;
  style?: React.CSSProperties;
}

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
            <QueriesRenderer
              queries={{
                groups: useGroupsQuery({
                  pagination: { page: 1, perPage: 10 },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids,
                  },
                }),
              }}
              render={({ groups: { data: groups } }) => {
                // eslint-disable-next-line react/jsx-key
                return (
                  <GroupList
                    style={style}
                    onItemClick={onItemClick}
                    groups={groups.map((a) => ({ ...a, selected: true }))}
                  />
                );
              }}
            />
          )
        )
      )}
    </Box>
  );
};
