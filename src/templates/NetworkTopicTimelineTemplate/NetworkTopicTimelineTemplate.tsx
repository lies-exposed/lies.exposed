import * as t from "io-ts"
import React from "react"
import { graphql } from "gatsby"
import "./networkTopicTimelineTemplate.scss"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import { Columns } from "react-bulma-components"
import {
  TimelineEvent,
  TimelineEventType,
  TimelineEventIcon,
} from "../../components/Common/Tree/Timeline/Timeline"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import * as E from "fp-ts/lib/Either"
import { formatDate } from "../../utils/date"

interface EventNode {
  id: string
  frontmatter: {
    icon: TimelineEventIcon
    title: string
    date: string
    type: TimelineEventType | null
    cover: string | null
  }
  html: string
}

interface ImageNode {
  childImageSharp: {
    fixed: {
      src: string
    }
  }
  relativeDirectory: string
  relativePath: string
}

interface NetworkTopicTimelineTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: {
      childMarkdownRemark: {
        frontmatter: {
          title: string
          path: string
          date: string
          icon: string
          cover: string
          type: string
        }
        html: string
      }
    }
    events: {
      nodes: {
        childMarkdownRemark: EventNode
      }[]
    }
    images: {
      nodes: ImageNode[]
    }
  }
}

export default function NetworkTopicTimelineTemplate({
  data,
}: NetworkTopicTimelineTemplatePageProps) {
  const {
    pageContent: {
      childMarkdownRemark: { frontmatter, html },
    },
    events,
    images,
  } = data

  const totalEvents = events.nodes.map(n => n.childMarkdownRemark)

  console.log(totalEvents)

  const results = totalEvents.map(n => ({
    id: n.id,
    ...n.frontmatter,
    html: n.html,
    image: pipe(
      O.fromNullable(n.frontmatter.cover),
      O.chain(c =>
        O.fromNullable(images.nodes.find(i => i.relativePath === c))
      ),
      O.map(i => i.childImageSharp.fixed),
      O.toUndefined
    ),
  }))

  const timelineEvents = t.array(TimelineEvent).decode(results)
  if (E.isLeft(timelineEvents)) {
    console.log(ThrowReporter.report(timelineEvents))
    return null
  }

  return (
    <Layout>
      <SEO title={frontmatter.title} />
      <Columns>
        <Columns.Column size={3}>
          <ul>
            {timelineEvents.right.map(e => (
              <li>
                {formatDate(e.date)} - {e.title}
              </li>
            ))}
          </ul>
        </Columns.Column>
        <Columns.Column size={9}>
          <div className="content">
            <div></div>
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
          <Columns.Column>
            <div>
              {timelineEvents.right.map(event => (
                <div>
                  <div className="subtitle">{event.title}</div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{ __html: event.html }}
                  />
                </div>
              ))}
              {/* <Timeline events={timelineEvents.right} /> */}
            </div>
          </Columns.Column>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export const pageQuery = graphql`
  query NetworkTopicTimelineTemplatePage(
    $relativeDirectory: String!
    $imagesRelativeDirectoryPath: String!
  ) {
    pageContent: file(
      relativeDirectory: { eq: $relativeDirectory }
      name: { eq: "index" }
    ) {
      childMarkdownRemark {
        frontmatter {
          title
          path
          date
          icon
          cover
          type
        }
        html
      }
    }
    events: allFile(
      filter: {
        relativeDirectory: { eq: $relativeDirectory }
        name: { ne: "index" }
      }
    ) {
      nodes {
        childMarkdownRemark {
          id
          frontmatter {
            title
            icon
            type
            date
            cover
            actors
          }
          html
        }
      }
    }
    images: allFile(
      filter: { relativeDirectory: { eq: $imagesRelativeDirectoryPath } }
    ) {
      nodes {
        childImageSharp {
          fixed {
            src
          }
        }
        relativeDirectory
        relativePath
      }
    }
  }
`
