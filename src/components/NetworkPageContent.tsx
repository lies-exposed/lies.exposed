import { NetworkPageContentFileNode } from "@models/networks"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { Heading } from "baseui/heading"
import * as React from "react"

type NetworkPageContentProps = NetworkPageContentFileNode["childMarkdownRemark"]

export const NetworkPageContent: React.FC<NetworkPageContentProps> = ({
  frontmatter,
  htmlAst,
}) => {
  return (
    <>
      <Heading $style={{ textAlign: "center" }}>
        {frontmatter.title}
      </Heading>
      <div style={{ textAlign: "center" }}>
        {renderMarkdownAST(htmlAst)}
      </div>
    </>
  )
}