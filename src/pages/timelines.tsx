import * as A from "fp-ts/lib/Array"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import { Columns } from "react-bulma-components"
import Menu from "../components/Common/Menu"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import { ActorFileNode } from "../types/actor"
import { TopicFileNode } from "../types/topic"

interface PageContentNode {
  title: string
  html: string
}

interface Results {
  actors: { nodes: ActorFileNode[] }
  topics: { nodes: TopicFileNode[] }
  pageContent: { nodes: PageContentNode[] }
}

const TimelinesPage = (): React.ReactElement => {
  const { actors, topics, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      actors: allFile(
        filter: {
          relativeDirectory: { glob: "events/actors/*" }
          name: { eq: "index" }
        }
      ) {
        nodes {
          relativeDirectory
          name
          childMarkdownRemark {
            frontmatter {
              title
              username
            }
          }
        }
      }

      topics: allFile(
        filter: { relativePath: { glob: "events/networks/*/*/index.md" } }
      ) {
        nodes {
          relativeDirectory
          childMarkdownRemark {
            frontmatter {
              title
              slug
            }
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

  const actorItems = actors.nodes.map(n => ({
    id: n.id,
    path: `/timelines/${n.childMarkdownRemark.frontmatter.username}`,
    title: n.childMarkdownRemark.frontmatter.title,
    items: [],
  }))

  const topicItems = topics.nodes.map(t => {
    const networkName = A.takeRight(2)(t.relativeDirectory.split("/"))[0]
    const id = `${networkName}/${t.childMarkdownRemark.frontmatter.slug}`
    return {
      id,
      path: `/timelines/${id}`,
      title: `${networkName} - ${t.childMarkdownRemark.frontmatter.title}`,
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
