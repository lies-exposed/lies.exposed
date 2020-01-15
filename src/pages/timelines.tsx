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
    actors: string[] | null
  }
}

interface PageContentNode {
  title: string
  html: string
}

interface Results {
  timelineActors: { nodes: Node[] }
  pageContent: { nodes: PageContentNode[] }
}

const TimelinesPage = ({}: TimelinesPageProps) => {
  const { timelineActors, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      timelineActors: allMarkdownRemark(
        filter: { fileAbsolutePath: { glob: "**/events/**/*.md" } }
      ) {
        nodes {
          id
          frontmatter {
            actors
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


  const actors = timelineActors.nodes.reduce<string[]>((acc, n) => {
    if (n.frontmatter.actors) {
      return acc.concat(...n.frontmatter.actors.filter(a => !acc.includes(a)))
    }
    return acc
  }, [])

  const items = actors.map(n => ({
    id: n,
    path: `/timelines/${n}`,
    title: n,
    items: [],
  }))

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
