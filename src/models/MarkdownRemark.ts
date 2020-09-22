import * as t from "io-ts"

type MarkdownRemarkC<F extends t.Mixed> = t.ExactC<t.TypeC<{
  frontmatter: F;
  tableOfContents: t.StringC;
  timeToRead: t.NumberC;
  htmlAst: t.ObjectC;
}>>

export const markdownRemark = <F extends t.Mixed>(f: F, name: string): MarkdownRemarkC<F> =>
  t.strict(
    {
      frontmatter: f,
      tableOfContents: t.string,
      timeToRead: t.number,
      htmlAst: t.object,
    },
    name
  )