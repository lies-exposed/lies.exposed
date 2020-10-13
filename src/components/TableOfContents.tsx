import { Link } from "gatsby"
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
    <Link to={i.url} key={i.url}>
      {i.title}
    </Link>
    {i.items !== undefined ? <ul>{i.items.map(renderItem)}</ul> : null}
  </li>
)
