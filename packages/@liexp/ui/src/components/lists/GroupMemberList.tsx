import type * as io from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar.js";
import { List, type ListItemProps } from "../Common/List.js";
import { Box, Typography } from "../mui/index.js";

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
      key={`group-member-list-item-${item.group.id}-${item.actor.id}`}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer" }}
      onClick={(e) => onClick?.(item, e)}
    >
      {pipe(
        O.fromNullable(item.actor.avatar),
        O.map((src) => (
          <Avatar
            key={`group-member-actor-${item.actor.id}`}
            src={src}
            size={avatarSize}
            style={{ margin: 5 }}
          />
        )),
        O.toNullable,
      )}
      {pipe(
        O.fromNullable(item.group.avatar),
        O.map((src) => (
          <Avatar
            key={`group-member-group-${item.group.id}`}
            src={src}
            size={avatarSize}
            style={{
              marginLeft: -20,
              marginBottom: -20,
              width: 20,
              height: 20,
            }}
          />
        )),
        O.toNullable,
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
  className?: string;
  groupsMembers: GroupMember[];
  onItemClick: (actor: GroupMember) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
}

export const GroupsMembersList: React.FC<GroupMemberListProps> = ({
  className,
  groupsMembers,
  onItemClick,
  avatarSize,
  style,
  displayFullName,
}) => {
  return (
    <List
      className={className}
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
