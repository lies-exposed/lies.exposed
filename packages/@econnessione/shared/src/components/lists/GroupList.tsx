import { List, ListItemProps } from "@components/Common/List";
import { Group } from "@io/http";
import { Avatar } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { AvatarScale } from "./ActorList";

export interface Group extends Group.Group {
  selected: boolean;
}

interface GroupListProps {
  groups: Group[];
  onGroupClick: (actor: Group) => void;
  avatarScale: AvatarScale;
}

export const GroupListItem: React.FC<
  ListItemProps<Group> & { avatarScale: AvatarScale }
> = ({ item, avatarScale, onClick }) => {
  return (
    <div
      key={item.id}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => (
          <Avatar key={item.id} src={src} />
        )),
        O.toNullable
      )}
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
  avatarScale,
}) => {
  return (
    <List
      data={groups}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <GroupListItem avatarScale={avatarScale} {...p} />}
    />
  );
};

export default GroupList;
