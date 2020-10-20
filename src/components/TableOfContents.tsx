import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/function"
import * as React from "react"

interface Item {
  url?: string
  title?: string
  items?: Item[]
}
interface Items {
  items?: Item[]
}

export const TableOfContents: React.FC<Items> = ({ items }) => {
  return pipe(
    O.fromNullable(items),
    O.fold(
      () => null,
      (items) => <ul>{items.map(renderItem)}</ul>
    )
  )
}

const renderItem = (i: Item): JSX.Element => (
  <li key={i.url}>
    {pipe(
      O.fromNullable(i.url),
      O.map((url) => (
        <a href={i.url} key={i.url}>
          {i.title}
        </a>
      )),
      O.toNullable
    )}

    {pipe(
      O.fromNullable(i.items),
      O.map((items) =>
        items.map((items, k) => {
          if (items.url !== undefined) {
            return renderItem(items)
          }
          return pipe(
            O.fromNullable(items.items),
            O.map((items) => <ul key={k}>{items.map(renderItem)}</ul>),
            O.toNullable
          )
        })
      ),
      O.toNullable
    )}
  </li>
)
