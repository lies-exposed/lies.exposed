import { GroupMember } from "@liexp/shared/io/http";
import { Box, Typography } from "@material-ui/core";
import { pipe } from "fp-ts/lib/function";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useGroupsMembersDiscreteQuery } from "../state/queries/DiscreteQueries";
import { GroupsMembersList } from "./lists/GroupMemberList";
import QueriesRenderer from "./QueriesRenderer";

interface GroupMembersBoxProps {
  ids: string[];
  onItemClick: (g: GroupMember.GroupMember) => void;
  style?: React.CSSProperties;
}

const GroupMembersList: React.FC<{
  ids: NEA.NonEmptyArray<string>;
  onItemClick: (g: GroupMember.GroupMember) => void;
  style?: React.CSSProperties;
}> = ({ ids, ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        groupsMembers: useGroupsMembersDiscreteQuery({
          pagination: { page: 1, perPage: 10 },
          sort: { field: "createdAt", order: "DESC" },
          filter: {
            ids,
          },
        }),
      }}
      render={({ groupsMembers: { data: groupsMembers } }) => {
        // eslint-disable-next-line react/jsx-key
        return (
          <GroupsMembersList
            {...props}
            groupsMembers={groupsMembers.map((a) => ({
              ...a,
              selected: true,
            }))}
          />
        );
      }}
    />
  );
};

export const GroupMembersBox: React.FC<GroupMembersBoxProps> = ({
  ids,
  style,
  onItemClick,
}) => {
  return (
    <Box>
      {pipe(
        ids,
        NEA.fromArray,
        O.fold(
          () => <Typography>-</Typography>,
          (ids) => (
            <GroupMembersList
              ids={ids}
              style={style}
              onItemClick={onItemClick}
            />
          )
        )
      )}
    </Box>
  );
};
