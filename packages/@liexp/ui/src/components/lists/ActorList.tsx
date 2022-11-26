import * as io from "@liexp/shared/io/http";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps, ListProps } from "../Common/List";
import { Box, Typography } from "../mui";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export const ActorListItem: React.FC<
  ListItemProps<Actor> & {
    avatarSize?: AvatarSize;
    displayFullName?: boolean;
    style?: React.CSSProperties;
  }
> = ({ item, avatarSize, displayFullName = false, onClick, style }) => {
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
          />
        )),
        O.toNullable
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

export type ActorListProps<D extends React.ElementType<any> = "ul"> = Omit<
  ListProps<Actor, D>,
  "data" | "getKey" | "ListItem" | "filter"
> & {
  className?: string;
  actors: Actor[];
  onActorClick: (actor: Actor) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
};

export const ActorList = <D extends React.ElementType<any> = "ul">({
  actors,
  onActorClick,
  avatarSize,
  itemStyle,
  displayFullName,
  ...props
}: ActorListProps<D>): JSX.Element => {
  return (
    <List
      {...props}
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
