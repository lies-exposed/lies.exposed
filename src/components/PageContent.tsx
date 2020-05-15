import { PageContentFileNode } from "@models/page"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import * as React from "react"

type APCFNCMR = PageContentFileNode["childMarkdownRemark"]
export type PageContentProps = APCFNCMR

export const PageContent: React.FC<PageContentProps> = ({
  htmlAst,
}) => {
  return (
    <>
      {renderMarkdownAST(htmlAst)}
    </>
  )
}