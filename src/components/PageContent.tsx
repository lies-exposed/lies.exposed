import { PageContentFileNode } from "@models/page"
import renderHTMLAST from "@utils/renderHTMLAST"
import * as React from "react"

type APCFNCMR = PageContentFileNode["childMarkdownRemark"]
export type PageContentProps = APCFNCMR

export const PageContent: React.FC<PageContentProps> = ({
  htmlAst,
}) => {
  return (
    <>
      {renderHTMLAST(htmlAst)}
    </>
  )
}