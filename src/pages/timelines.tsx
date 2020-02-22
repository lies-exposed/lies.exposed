import { FlexGridItem, FlexGrid } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import * as A from "fp-ts/lib/Array"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import Menu from "../components/Common/Menu"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import { ActorFileNode } from "../types/actor"
import { TopicFileNode } from "../types/topic"
import renderMarkdownAST from "../utils/renderMarkdownAST"

interface PageContentNode {
  title: string
  htmlAst: object
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
          htmlAst
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

  const { title, htmlAst } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title={title} />
      <FlexGrid flexGridColumnCount={4}>
        <FlexGridItem display="flex">
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
        </FlexGridItem>
        <FlexGridItem
          display="flex"
          overrides={{
            Block: {
              style: ({ $theme }: { $theme: Theme }) => {
                return { width: `calc((200% - ${$theme.sizing.scale800}) / 4)` }
              },
            },
          }}
        >
          <div className="content">{renderMarkdownAST(htmlAst)}</div>
        </FlexGridItem>
        <FlexGridItem display="none" />
        <FlexGridItem display="none" />
      </FlexGrid>
    </Layout>
  )
}

export default TimelinesPage
