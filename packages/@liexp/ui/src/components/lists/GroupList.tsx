import { type Group } from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar.js";
import { ExpandableList } from "../Common/ExpandableList.js";
import { List, type ListItemProps } from "../Common/List.js";
import { Box, Typography } from "../mui/index.js";

export interface GroupItem extends Group.Group {
  selected: boolean;
}

interface GroupListProps {
  className?: string;
  groups: GroupItem[];
  onItemClick: (group: GroupItem, e: any) => void;
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
          onClick(item, e);
        }
      }}
    >
      {pipe(
        O.fromNullable(item.avatar?.thumbnail),
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
        O.toNullable,
      )}
      {displayName ? (
        <Typography variant="caption"> {item.name}</Typography>
      ) : null}
      <Box
        display="flex"
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.color : "white",
        }}
      />
    </Box>
  );
};

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onItemClick: onGroupClick,
  style,
  avatarSize,
  displayName,
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
      ListItem={(p) => (
        <GroupListItem {...{ ...p, ...props, avatarSize, displayName }} />
      )}
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
  displayName,
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
      ListItem={(p) => (
        <GroupListItem {...{ ...p, ...props, avatarSize, displayName }} />
      )}
    />
  );
};
