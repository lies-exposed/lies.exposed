import * as React from "react"

interface Item {
  url: string
  title: string
  items?: Item[]
}
interface TableOfContentsProps {
  items: Item[]
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  return <ul>{items.map(renderItem)}</ul>
}

const renderItem = (i: Item): JSX.Element => (
  <li key={i.url}>
    <a href={i.url} key={i.url}>
      {i.title}
    </a>
    {i.items !== undefined ? <ul>{i.items.map(renderItem)}</ul> : null}
  </li>
)
