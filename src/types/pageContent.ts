import * as t from "io-ts"

export const PageContentNode = t.interface({
    html: t.string,
    frontmatter: t.interface({
      title: t.string,
    }),
  }, 'PageContentNode')
  
  export type PageContentNode = t.TypeOf<typeof PageContentNode>
  

export const PageContent = t.interface({
  title: t.string,
  html: t.string,
}, 'PageContent')

export type PageContent = t.TypeOf<typeof PageContent>
