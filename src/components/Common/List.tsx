import { Block } from "baseui/block"
import * as React from "react"

export interface ListItemProps<A> {
  item: A
  index: number
  onClick?: (a: A) => void
}

interface ListProps<A> {
  data: A[]
  getKey: (a: A) => string
  ListItem: React.FC<ListItemProps<A>>
  filter: (a: A) => boolean
  onItemClick?: (a: A) => void
}

export const List = <A extends any>({
  ListItem,
  data,
  getKey,
  onItemClick,
}: ListProps<A>): JSX.Element => {
  return (
    <Block>
      {data.map((d, i) => (
        <ListItem key={getKey(d)} item={d} onClick={onItemClick} index={i} />
      ))}
    </Block>
  )
}
