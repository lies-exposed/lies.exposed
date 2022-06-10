import { Group } from "@liexp/shared/io/http";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps } from "../Common/List";
import { Box, Typography } from "../mui";

export interface Group extends Group.Group {
  selected: boolean;
}

interface GroupListProps {
  className?: string;
  groups: Group[];
  onItemClick: (actor: Group) => void;
  avatarSize?: AvatarSize;
  displayName?: boolean;
  style?: React.CSSProperties
}

export const GroupListItem: React.FC<
  ListItemProps<Group> & {
    avatarSize?: AvatarSize;
    displayName?: boolean;
    style?: React.CSSProperties;
  }
> = ({ item, avatarSize, displayName = false, onClick, style }) => {
  return (
    <Box
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer", ...style }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => (
          <Avatar
            key={item.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5 }}
            fit="contain"
            variant="circular"
          />
        )),
        O.toNullable
      )}
      {displayName ? (
        <Typography variant="caption"> {item.name}</Typography>
      ) : null}
      <Box display="flex">
        <div
          style={{
            width: "100%",
            height: 3,
            backgroundColor: item.selected ? item.color : "white",
          }}
        />
      </Box>
    </Box>
  );
};

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onItemClick: onGroupClick,
  ...props
}) => {
  return (
    <List
      {...props}
      data={groups}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <GroupListItem {...p} {...props} />}
    />
  );
};

export default GroupList;
