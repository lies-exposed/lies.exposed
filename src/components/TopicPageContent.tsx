import { TopicMarkdownRemark } from "@models/topic"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { Overflow } from "baseui/icon"
import { StyledLink } from "baseui/link"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"

interface TopicPageContentProps extends TopicMarkdownRemark {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  htmlAst,
}) => {
  return (
    <>
      <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
        <StyledLink
          href={`/admin/#/collections/topics/entries/${frontmatter.uuid}`}
          target="_blank"
        >
          <Overflow size={24} />
        </StyledLink>
      </Block>
      <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
      {renderHTMLAST(htmlAst)}
    </>
  )
}
