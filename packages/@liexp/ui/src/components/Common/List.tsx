import * as React from "react";
import { List as MUIList, ListProps as MUIListProps } from "../mui";
export interface ListItemProps<A> {
  item: A;
  index?: number;
  onClick?: (a: A) => void;
}

export type ListProps<
  A,
  D extends React.ElementType<any> = "ul"
> = MUIListProps<
  D,
  {
    data: A[];
    getKey: (a: A) => string;
    ListItem: React.FC<ListItemProps<A>>;
    filter: (a: A) => boolean;
    onItemClick?: (a: A) => void;
    style?: React.CSSProperties;
  }
>;

export const List = <A extends any, D extends React.ElementType<any> = "ul">({
  className,
  ListItem,
  data,
  style = {},
  getKey,
  onItemClick,
  filter,
  ...props
}: ListProps<A, D>): JSX.Element => {
  return (
    <MUIList className={className} style={style} {...props}>
      {data.map((d, i) => (
        <ListItem key={getKey(d)} item={d} onClick={onItemClick} index={i} />
      ))}
    </MUIList>
  );
};
