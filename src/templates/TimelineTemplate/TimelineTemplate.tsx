import React from "react"
import { graphql } from "gatsby"
import "./timelineTemplate.scss"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import { Columns } from "react-bulma-components"
import Menu from "../../components/Menu"
import {
  Timeline,
  TimelineEvent,
  TimelineEventFrontmatter,
} from "../../components/Common/Timeline"
import FlexView from "react-flexview/lib"

interface ArticleTemplatePage {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: {
      frontmatter: { path: string; title: string; date: string }
      html: string
    }
    events: {
      nodes: [
        {
          id: string
          frontmatter: TimelineEventFrontmatter
          html: string
        }
      ]
    }
  }
}

export default function TimelineTemplate({ data }: ArticleTemplatePage) {
  const {
    pageContent: { frontmatter, html },
    events,
  } = data

  const timelineEvents: TimelineEvent[] = events.nodes.map(n => ({
    id: n.id,
    ...n.frontmatter,
    html: n.html,
  }))

  return (
    <Layout>
      <SEO title="Home" />
      <Columns>
        <Columns.Column size={3}>
          <Menu items={[]} />
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
      <Columns>
        <Columns.Column>
          <div>
            <Timeline events={timelineEvents} />
          </div>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($fileDirGlob: String!, $URLPath: String!) {
    pageContent: markdownRemark(frontmatter: { path: { glob: $URLPath } }) {
      html
      frontmatter {
        title
        icon
        type
        path
      }
    }

    events: allMarkdownRemark(
      filter: { fileAbsolutePath: { glob: $fileDirGlob } }
      sort: { order: DESC, fields: frontmatter___date }
    ) {
      nodes {
        id
        frontmatter {
          title
          icon
          type
          date(formatString: "DD/MM/YYYY")
        }
        html
      }
    }
  }
`
