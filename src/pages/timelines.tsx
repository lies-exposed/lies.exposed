import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Columns } from "react-bulma-components"
import Menu from "../components/Menu"
import { useStaticQuery, graphql } from "gatsby"
import * as A from "fp-ts/lib/Array"

interface TimelinesPageProps {}

interface PageContentNode {
  title: string
  html: string
}

interface Results {
  actors: { distinct: string[] }
  topics: { nodes: { relativeDirectory: string; base: string }[] }
  pageContent: { nodes: PageContentNode[] }
}

const TimelinesPage = ({}: TimelinesPageProps) => {
  const { actors, topics, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      actors: allFile {
        distinct(field: childMarkdownRemark___frontmatter___actors)
      }

      topics: allDirectory(
        filter: { relativeDirectory: { glob: "events/networks/**" } }
      ) {
        nodes {
          relativeDirectory
          base
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

  const actorItems = actors.distinct.map(n => ({
    id: n,
    path: `/timelines/${n}`,
    title: n,
    items: [],
  }))

  const topicItems = topics.nodes.map(t => {
    const networkName = A.takeRight(1)(t.relativeDirectory.split("/"))[0]
    const id = `${networkName}/${t.base}`
    return {
      id,
      path: `/timelines/${id}`,
      title: `${networkName} - ${t.base}`,
      items: [],
    }
  })

  const { title, html } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title={title} />
      <Columns>
        <Columns.Column size={3}>
          <Menu
            sections={[
              {
                label: "Attori",
                items: actorItems,
              },
              {
                label: "Topic",
                items: topicItems,
              },
            ]}
          />
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
