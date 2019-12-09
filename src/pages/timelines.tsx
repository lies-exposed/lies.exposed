import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Columns } from "react-bulma-components"
import Menu from "../components/Menu"
import { useStaticQuery, graphql } from "gatsby"

interface TimelinesPageProps {}

interface Node {
  id: string
  frontmatter: {
    path: string
    title: string
  }
}

interface PageContentNode {
  title: string
  html: string
}

interface Results {
  timelines: { nodes: Node[] }
  pageContent: { nodes: PageContentNode[] }
}

const TimelinesPage = ({}: TimelinesPageProps) => {
  const { timelines, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      timelines: allMarkdownRemark(
        filter: { fileAbsolutePath: { glob: "**/timelines/**/index.md" } }
      ) {
        nodes {
          id
          frontmatter {
            title
            path
          }
        }
      }

      pageContent: allMarkdownRemark(
        filter: { frontmatter: { path: { eq: "/timelines" } } }
      ) {
        nodes {
          frontmatter {
            title
          }
          html
        }
      }
    }
  `)

  const items = timelines.nodes.map(n => ({
    id: n.id,
    path: n.frontmatter.path,
    title: n.frontmatter.title,
    items: [],
  }))

  console.log(items)

  const { title, html } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title={title} />
      <Columns>
        <Columns.Column size={3}>
          <Menu items={items} />
        </Columns.Column>
        <Columns.Column size={9}>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: html }}
          ></div>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export default TimelinesPage
