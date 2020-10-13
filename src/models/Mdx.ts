import * as t from "io-ts"
import {
  optionFromNullable,
  OptionFromNullableC,
} from "io-ts-types/lib/optionFromNullable"

interface TOCItem {
  url: string
  title: string
  items: TOCItem[] | undefined
}

const TOCItem: t.Type<TOCItem> = t.recursion("TOCItem", () =>
  t.type(
    {
      url: t.string,
      title: t.string,
      items: t.union([t.undefined, t.array(TOCItem)]),
    },
    "TOCItem"
  )
)

type MdxC<F extends t.Mixed> = t.ExactC<
  t.TypeC<{
    frontmatter: F
    tableOfContents: t.TypeC<{ items: t.ArrayC<t.Type<TOCItem, TOCItem, unknown>>; }>
    timeToRead: OptionFromNullableC<t.NumberC>
    body: t.AnyC
  }>
>

export const mdx = <F extends t.Mixed>(f: F, name: string): MdxC<F> =>
  t.strict(
    {
      frontmatter: f,
      tableOfContents: t.type({ items: t.array(TOCItem) }),
      timeToRead: optionFromNullable(t.number),
      body: t.any,
    },
    name
  )
