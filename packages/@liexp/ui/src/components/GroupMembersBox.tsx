import { GroupMember } from "@liexp/shared/io/http";
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
    <WithQueries
      queries={{ groupsMembers: Queries.GroupMember.getList }}
      params={{
        groupsMembers: {
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
        ({ groupsMembers: { data: groupsMembers } }) => {
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
        }
      )}
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
