import { Avatar, AvatarSize } from "@components/Common/Avatar";
import { List, ListItemProps } from "@components/Common/List";
import { Group } from "@io/http";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export interface Group extends Group.Group {
  selected: boolean;
}

interface GroupListProps {
  groups: Group[];
  onGroupClick: (actor: Group) => void;
  avatarSize?: AvatarSize;
}

export const GroupListItem: React.FC<
  ListItemProps<Group> & { avatarSize?: AvatarSize }
> = ({ item, avatarSize, onClick }) => {
  return (
    <div
      key={item.id}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => <Avatar key={item.id} src={src} size={avatarSize} />),
        O.toNullable
      )}
      {item.name}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.color : "white",
        }}
      />
    </div>
  );
};

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onGroupClick,
  avatarSize,
}) => {
  return (
    <List
      data={groups}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <GroupListItem avatarSize={avatarSize} {...p} />}
    />
  );
};

export default GroupList;
