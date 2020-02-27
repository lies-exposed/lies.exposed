import Menu from "@components/Common/Menu"
import Layout from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleFileNodeChildMarkdownRemark } from "@models/article"
import renderMarkdownAST from "@utils//renderMarkdownAST"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import { HeadingXXLarge } from "baseui/typography"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface ArticleTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: unknown
    articles: {
      nodes: Array<{ childMarkdownRemark: { frontmatter: unknown } }>
    }
  }
}

const ArticleTemplatePage: React.FC<ArticleTemplatePageProps> = props => {
  return pipe(
    sequenceS(E.either)({
      pageContent: ArticleFileNodeChildMarkdownRemark.decode(
        props.data.pageContent
      ),
      articles: t
        .array(ArticleFileNodeChildMarkdownRemark)
        .decode(props.data.articles.nodes.map(n => n.childMarkdownRemark)),
    }),
    E.map(({ articles, ...props }) => {
      return {
        ...props,
        articles: articles.map(n => ({
          id: n.id,
          path: n.frontmatter.path,
          title: n.frontmatter.title,
          items: [],
        })),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, articles }) => (
      <Layout>
        <SEO title="Home" />
        <FlexGrid flexGridColumnCount={3}>
          <FlexGridItem>
            <Menu sections={[{ items: articles }]} />
          </FlexGridItem>
          <FlexGridItem
            overrides={{
              Block: {
                style: ({ $theme }: { $theme: Theme }) => ({
                  width: `calc((200% - ${$theme.sizing.scale800}) / 3)`,
                }),
              },
            }}
          >
            <HeadingXXLarge>{pageContent.frontmatter.title}</HeadingXXLarge>
            {renderMarkdownAST(pageContent.htmlAst)}
          </FlexGridItem>
          <FlexGridItem display="none" />
        </FlexGrid>
      </Layout>
    ))
  )
}

export const pageQuery = graphql`
  query($filePath: String!) {
    pageContent: markdownRemark(frontmatter: { path: { eq: $filePath } }) {
      id
      htmlAst
      frontmatter {
        path
        title
        date
      }
    }

    articles: allFile(filter: { relativeDirectory: { eq: "articles" } }) {
      nodes {
        childMarkdownRemark {
          id
          frontmatter {
            title
            date
            path
          }
          htmlAst
        }
      }
    }
  }
`

export default ArticleTemplatePage
