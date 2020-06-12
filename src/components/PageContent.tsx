import { PageContentMarkdownRemark } from "@models/page"
import renderHTMLAST from "@utils/renderHTMLAST"
import * as React from "react"

export type PageContentProps = PageContentMarkdownRemark

export const PageContent: React.FC<PageContentProps> = ({ htmlAst }) => {
  return <div className="page-content">{renderHTMLAST(htmlAst)}</div>
}
