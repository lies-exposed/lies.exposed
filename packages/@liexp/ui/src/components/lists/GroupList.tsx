import { type Group } from "@liexp/shared/lib/io/http";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar";
import { ExpandableList } from '../Common/ExpandableList';
import { List, type ListItemProps } from "../Common/List";
import { Box, Typography } from "../mui";

export interface GroupItem extends Group.Group {
  selected: boolean;
}

interface GroupListProps {
  className?: string;
  groups: GroupItem[];
  onItemClick: (actor: GroupItem) => void;
  avatarSize?: AvatarSize;
  displayName?: boolean;
  style?: React.CSSProperties;
}

export const GroupListItem: React.FC<
  ListItemProps<GroupItem> & {
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
      style={{ cursor: "pointer", ...style, opacity: item.selected ? 1 : 0.2 }}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick(item);
        }
      }}
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
  style,
  avatarSize,
  ...props
}) => {
  return (
    <List
      {...props}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
      data={groups}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <GroupListItem {...{ ...p, ...props, avatarSize }} />}
    />
  );
};

export default GroupList;

export const ExpandableGroupList: React.FC<
  GroupListProps & { limit?: number }
> = ({
  groups,
  onItemClick: onGroupClick,
  style,
  avatarSize,
  limit = 10,
  ...props
}) => {
  return (
    <ExpandableList
      {...props}
      limit={limit}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
      data={groups}
      filter={(g) => g.selected}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <GroupListItem {...{ ...p, ...props, avatarSize }} />}
    />
  );
};
