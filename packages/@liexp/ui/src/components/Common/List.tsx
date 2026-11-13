import * as React from "react";
import {
  List as MUIList,
  type ListProps as MUIListProps,
} from "../mui/index.js";

export interface ListItemProps<A> {
  item: A;
  index?: number;
  onClick?: (a: A, e: React.MouseEvent<Element>) => void;
}

export type ListProps<
  A,
  D extends React.ElementType<any> = "ul",
> = MUIListProps<
  D,
  {
    data: A[];
    getKey: (a: A) => string;
    ListItem: React.FC<ListItemProps<A>>;
    filter: (a: A) => boolean;
    onItemClick?: (a: A, e: React.MouseEvent<Element>) => void;
    style?: React.CSSProperties;
  }
>;

export const List = <A, D extends React.ElementType<object> = "ul">({
  className,
  ListItem,
  data,
  style = {},
  getKey,
  onItemClick,
  filter: _filter,
  ...props
}: ListProps<A, D>): React.ReactElement => {
  return (
    <MUIList className={className} style={style} {...props}>
      {data.map((d, i) => (
        <ListItem key={getKey(d)} item={d} onClick={onItemClick} index={i} />
      ))}
    </MUIList>
  );
};
