import { type GroupMember } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import QueriesRenderer from "./QueriesRenderer.js";
import { GroupsMembersList } from "./lists/GroupMemberList.js";
import { Box } from "./mui/index.js";

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
        queries={(Q) => ({
          groupsMembers: Q.GroupMember.list.useQuery(
            {
              pagination: { page: 1, perPage: 10 },
              sort: { field: "createdAt", order: "DESC" },
              filter: {
                ids,
              },
            },
            undefined,
            false,
          ),
        })}
        render={({ groupsMembers: { data: groupsMembers } }) => {
          return <GroupMembersList {...props} groupsMembers={groupsMembers} />;
        }}
      />
    </Box>
  );
};
