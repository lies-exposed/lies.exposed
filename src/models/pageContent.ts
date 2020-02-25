import * as t from "io-ts"

export const PageContentNode = t.interface({
    htmlAst: t.object,
    frontmatter: t.interface({
      title: t.string,
    }),
  }, 'PageContentNode')
  
  export type PageContentNode = t.TypeOf<typeof PageContentNode>
  

export const PageContent = t.interface({
  title: t.string,
  htmlAst: t.object,
}, 'PageContent')

export type PageContent = t.TypeOf<typeof PageContent>
