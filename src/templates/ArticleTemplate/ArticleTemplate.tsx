import React from "react"
import { graphql } from "gatsby"
import "./articleTemplate.scss"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import { Columns } from "react-bulma-components"
import Menu from "../../components/Menu"

interface ArticleTemplatePage {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    markdownRemark: {
      frontmatter: { path: string; title: string; date: string }
      html: string
    }
    allMarkdownRemark: {
      nodes: [
        {
          id: string
          frontmatter: { path: string; title: string }
        }
      ]
    }
  }
}

export default function ArticleTemplatePage(props: ArticleTemplatePage) {
  const { markdownRemark, allMarkdownRemark } = props.data // data.markdownRemark holds your post data
  console.log(allMarkdownRemark)
  const { frontmatter, html } = markdownRemark
  console.log(allMarkdownRemark)
  const articleItems = allMarkdownRemark.nodes.map(n => ({
    id: n.id,
    path: n.frontmatter.path,
    title: n.frontmatter.title,
    items: [],
  }))

  return (
    <Layout>
      <SEO title="Home" />
      <Columns>
        <Columns.Column size={3}>
          <Menu items={articleItems} />
        </Columns.Column>
        <Columns.Column size={9}>
          <div className="content">
            <div className="blog-post-container">
              <div className="blog-post">
                <h1>{frontmatter.title}</h1>
                <div
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($filePath: String!) {
    markdownRemark(frontmatter: { path: { eq: $filePath } }) {
      html
      frontmatter {
        path
        title
      }
    }

    allMarkdownRemark(
      filter: { fileAbsolutePath: { glob: "**/articles/**" } }
    ) {
      nodes {
        id
        frontmatter {
          path
          type
          title
          date(formatString: "DD/MM/YYYY")
        }
        fileAbsolutePath
      }
    }
  }
`
