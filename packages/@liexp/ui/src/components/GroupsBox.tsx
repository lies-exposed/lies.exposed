import { type Group } from "@liexp/shared/io/http";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { useGroupsQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import GroupList from "./lists/GroupList";
import { Box, Typography } from "./mui";

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
                  pagination: { page: 1, perPage: ids.length },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids,
                  },
                }, true),
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
