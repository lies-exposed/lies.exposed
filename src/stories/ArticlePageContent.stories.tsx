import { ArticlePageContent, ArticlePageContentProps } from "@components/ArticlePageContent"
import { firstArticle } from "@mock-data/articles"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/ArticlePageContent",
  component: ArticlePageContent,
}

export default meta

const Template: Story<ArticlePageContentProps> = (props) => {
  return <ArticlePageContent {...props} />
}

const ArticlePageContentExample = Template.bind({})

const args: ArticlePageContentProps = {
  frontmatter: firstArticle,
  body: null,
  tableOfContents: O.none,
  timeToRead: O.none,
}

ArticlePageContentExample.args = args

export { ArticlePageContentExample }
