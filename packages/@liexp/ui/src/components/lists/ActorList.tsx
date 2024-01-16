import type * as io from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar.js";
import { ExpandableList } from "../Common/ExpandableList.js";
import { List, type ListItemProps } from "../Common/List.js";
import { Box, Typography } from "../mui/index.js";

export interface ActorItem extends io.Actor.Actor {
  selected: boolean;
}

export interface ActorListItemProps extends ListItemProps<ActorItem> {
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
}

export const ActorListItem: React.FC<ActorListItemProps> = ({
  item,
  avatarSize,
  displayFullName = false,
  onClick,
  style,
}) => {
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
        O.fromNullable(item.avatar),
        O.map((src) => (
          <Avatar
            key={item.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5 }}
          />
        )),
        O.toNullable,
      )}
      {displayFullName ? (
        <Typography variant="caption"> {item.fullName}</Typography>
      ) : null}
      <Box style={{ display: "flex" }} component="span">
        <span
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

export interface ActorListProps {
  className?: string;
  actors: ActorItem[];
  onActorClick: (actor: ActorItem, e: any) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const ActorList: React.FC<ActorListProps> = ({
  actors,
  onActorClick,
  avatarSize,
  itemStyle,
  displayFullName,
  ...props
}) => {
  return (
    <List
      {...props}
      style={{
        ...props.style,
        flexWrap: "wrap",
      }}
      data={actors}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onActorClick}
      ListItem={(p) => (
        <ActorListItem
          avatarSize={avatarSize}
          displayFullName={displayFullName}
          style={itemStyle}
          {...p}
        />
      )}
    />
  );
};

export const ExpandableActorList: React.FC<
  ActorListProps & { limit?: number }
> = ({
  actors,
  onActorClick,
  avatarSize,
  itemStyle,
  displayFullName,
  limit = 10,
  style,
  ...props
}) => {
  return (
    <ExpandableList
      {...props}
      limit={limit}
      style={{
        ...style,
        flexWrap: "wrap",
      }}
      data={actors}
      getKey={(a) => a.id}
      filter={(a) => a.selected}
      onItemClick={onActorClick}
      ListItem={(p) => (
        <ActorListItem
          avatarSize={avatarSize}
          displayFullName={displayFullName}
          style={itemStyle}
          {...p}
        />
      )}
    />
  );
};
