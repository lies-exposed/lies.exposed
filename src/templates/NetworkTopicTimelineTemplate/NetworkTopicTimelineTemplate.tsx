import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import React from "react"
import { Columns } from "react-bulma-components"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import TimelineNavigator from "../../components/TimelineNavigator/TimelineNavigator"
import { EventFileNode } from "../../types/event"
import { ImageFileNode } from "../../types/image"
import "./networkTopicTimelineTemplate.scss"

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
      nodes: EventFileNode[]
    }
    images: {
      nodes: ImageFileNode[]
    }
  }
}

export const NetworkTopicTimelineTemplate: React.FunctionComponent<NetworkTopicTimelineTemplatePageProps> = ({
  data,
}) => {
  const {
    pageContent: {
      childMarkdownRemark: { frontmatter, html },
    },
    events,
    images,
  } = data

  return pipe(
    t.array(EventFileNode).decode(events.nodes),
    E.fold(
      errs => {
        console.log(ThrowReporter.report(E.left(errs)))
        return null
      },
      events => {
        const totalEvents = events.map(n => n.childMarkdownRemark)

        const results = totalEvents.map(n => ({
          id: n.id,
          ...n.frontmatter,
          html: n.html,
          image: pipe(
            n.frontmatter.cover,
            O.chain(c =>
              O.fromNullable(images.nodes.find(i => i.relativePath === c))
            ),
            O.map(i => i.childImageSharp.fixed),
            O.toUndefined
          ),
        }))

        return (
          <Layout>
            <SEO title={frontmatter.title} />
            <Columns>
              <Columns.Column size={3}>
                <TimelineNavigator
                  events={totalEvents}
                  onEventClick={e =>
                    navigate(`${window.location.href}?#${e.id}`)
                  }
                />
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
                    {results.map(event => (
                      <div key={event.id} id={event.id}>
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
    )
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
      sort: { order: DESC, fields: [childMarkdownRemark___frontmatter___date] }
    ) {
      nodes {
        relativeDirectory
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
export default NetworkTopicTimelineTemplate
