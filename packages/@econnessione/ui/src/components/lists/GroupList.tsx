import { Group } from "@econnessione/shared/io/http";
import { Box, ListProps, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps } from "../Common/List";

export interface Group extends Group.Group {
  selected: boolean;
}

interface GroupListProps extends ListProps {
  groups: Group[];
  onGroupClick: (actor: Group) => void;
  avatarSize?: AvatarSize;
  displayName?: boolean;
}

export const GroupListItem: React.FC<
  ListItemProps<Group> & { avatarSize?: AvatarSize; displayName?: boolean }
> = ({ item, avatarSize, displayName = false, onClick }) => {
  return (
    <Box
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer" }}
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
            variant="square"
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
  onGroupClick,
  onClick,
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
