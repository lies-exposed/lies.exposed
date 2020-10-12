import * as t from "io-ts"
import { optionFromNullable, OptionFromNullableC } from "io-ts-types/lib/optionFromNullable"

type MdxC<F extends t.Mixed> = t.ExactC<
  t.TypeC<{
    frontmatter: F
    tableOfContents: t.RecordC<t.StringC, t.AnyC>
    timeToRead: OptionFromNullableC<t.NumberC>
    body: t.AnyC
  }>
>

export const mdx = <F extends t.Mixed>(f: F, name: string): MdxC<F> =>
  t.strict(
    {
      frontmatter: f,
      tableOfContents: t.record(t.string, t.any),
      timeToRead: optionFromNullable(t.number),
      body: t.any,
    },
    name
  )
