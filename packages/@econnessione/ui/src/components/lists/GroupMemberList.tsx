import * as io from "@econnessione/shared/io/http";
import { Box, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps } from "../Common/List";

export interface GroupMember extends io.GroupMember.GroupMember {
  selected: boolean;
}

export const GroupMemberListItem: React.FC<
  ListItemProps<GroupMember> & {
    avatarSize?: AvatarSize;
    displayFullName?: boolean;
  }
> = ({ item, avatarSize, displayFullName = false, onClick }) => {
  return (
    <Box
      key={item.id}
      display="flex"
      alignItems="center"
      margin={1}
      style={{ cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.actor.avatar),
        O.map((src) => (
          <Avatar
            key={item.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5 }}
          />
        )),
        O.toNullable
      )}
      {displayFullName ? (
        <Typography variant="caption"> {item.actor.fullName}</Typography>
      ) : null}
      <Box display="flex">
        <div
          style={{
            width: "100%",
            height: 3,
            backgroundColor: item.selected ? item.actor.color : "white",
          }}
        />
      </Box>
    </Box>
  );
};

interface GroupMemberListProps {
  groupsMembers: GroupMember[];
  onItemClick: (actor: GroupMember) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
}

export const GroupsMembersList: React.FC<GroupMemberListProps> = ({
  groupsMembers,
  onItemClick,
  avatarSize,
  style,
  displayFullName,
}) => {
  return (
    <List
      style={style}
      data={groupsMembers}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onItemClick}
      ListItem={(p) => (
        <GroupMemberListItem
          avatarSize={avatarSize}
          displayFullName={displayFullName}
          {...p}
        />
      )}
    />
  );
};
