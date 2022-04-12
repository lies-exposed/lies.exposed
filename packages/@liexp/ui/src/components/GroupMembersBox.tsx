import { GroupMember } from "@liexp/shared/io/http";
import { Box } from "@material-ui/core";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as React from "react";
import { useGroupsMembersDiscreteQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import { GroupsMembersList } from "./lists/GroupMemberList";

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
      loader="default"
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
  if (ids.length === 0) {
    return null;
  }

  return (
    <Box>
      <GroupMembersList
        key="non-empty"
        ids={ids as NEA.NonEmptyArray<string>}
        style={style}
        onItemClick={onItemClick}
      />
    </Box>
  );
};
