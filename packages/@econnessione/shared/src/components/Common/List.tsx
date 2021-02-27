import { Grid } from "@material-ui/core";
import * as React from "react";
import { StyleObject } from "styletron-react";

export interface ListItemProps<A> {
  item: A;
  index: number;
  onClick?: (a: A) => void;
}

interface ListProps<A> {
  data: A[];
  getKey: (a: A) => string;
  ListItem: React.FC<ListItemProps<A>>;
  filter: (a: A) => boolean;
  onItemClick?: (a: A) => void;
  style?: StyleObject;
}

export const List = <A extends any>({
  ListItem,
  data,
  style = {},
  getKey,
  onItemClick,
}: ListProps<A>): JSX.Element => {
  return (
    <Grid container style={style}>
      {data.map((d, i) => (
        <ListItem key={getKey(d)} item={d} onClick={onItemClick} index={i} />
      ))}
    </Grid>
  );
};
