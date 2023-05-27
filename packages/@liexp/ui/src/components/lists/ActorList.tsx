import type * as io from "@liexp/shared/lib/io/http";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar";
import { ExpandableList } from "../Common/ExpandableList";
import { List, type ListItemProps, type ListProps } from "../Common/List";
import { Box, Typography } from "../mui";

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
  ListProps<ActorItem, D>,
  "data" | "getKey" | "ListItem" | "filter"
> & {
  className?: string;
  actors: ActorItem[];
  onActorClick: (actor: ActorItem, e: any) => void;
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

export const ExpandableActorList = <D extends React.ElementType<any> = "ul">({
  actors,
  onActorClick,
  avatarSize,
  itemStyle,
  displayFullName,
  limit = 10,
  style,
  ...props
}: ActorListProps<D> & { limit?: number }): JSX.Element => {
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
