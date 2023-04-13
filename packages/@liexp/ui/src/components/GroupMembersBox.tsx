import { type GroupMember } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useGroupMembersQuery } from "../state/queries/DiscreteQueries";
import QueriesRenderer from "./QueriesRenderer";
import { GroupsMembersList } from "./lists/GroupMemberList";
import { Box } from "./mui";

interface GroupMembersBoxProps {
  ids: string[];
  onItemClick: (g: GroupMember.GroupMember) => void;
  style?: React.CSSProperties;
}

export const GroupMembersList: React.FC<{
  groupsMembers: GroupMember.GroupMember[];
  onItemClick: (g: GroupMember.GroupMember) => void;
  style?: React.CSSProperties;
}> = ({ groupsMembers, ...props }) => {
  return (
    <GroupsMembersList
      {...props}
      groupsMembers={groupsMembers.map((a) => ({
        ...a,
        selected: true,
      }))}
    />
  );
};

export const GroupMembersBox: React.FC<GroupMembersBoxProps> = ({
  ids,
  ...props
}) => {
  if (ids.length === 0) {
    return null;
  }

  return (
    <Box>
      <QueriesRenderer
        loader="default"
        queries={{
          groupsMembers: useGroupMembersQuery(
            {
              pagination: { page: 1, perPage: 10 },
              sort: { field: "createdAt", order: "DESC" },
              filter: {
                ids,
              },
            },
            false
          ),
        }}
        render={({ groupsMembers: { data: groupsMembers } }) => {
          return <GroupMembersList {...props} groupsMembers={groupsMembers} />;
        }}
      />
    </Box>
  );
};
