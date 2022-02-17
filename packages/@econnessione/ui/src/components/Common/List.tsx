import { List as MUIList } from "@material-ui/core";
import * as React from "react";

export interface ListItemProps<A> {
  item: A;
  index?: number;
  onClick?: (a: A) => void;
}

interface ListProps<A> {
  data: A[];
  getKey: (a: A) => string;
  ListItem: React.FC<ListItemProps<A>>;
  filter: (a: A) => boolean;
  onItemClick?: (a: A) => void;
  style?: React.CSSProperties;
}

export const List = <A extends any>({
  ListItem,
  data,
  style = {},
  getKey,
  onItemClick,
}: ListProps<A>): JSX.Element => {
  return (
    <MUIList style={style}>
      {data.map((d, i) => (
        <ListItem key={getKey(d)} item={d} onClick={onItemClick} index={i} />
      ))}
    </MUIList>
  );
};
