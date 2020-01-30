import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import React from "react"
import { Columns } from "react-bulma-components"
import EventList from "../../components/EventList/EventList"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import TimelineNavigator from "../../components/TimelineNavigator/TimelineNavigator"
import { ActorFileNode } from "../../types/actor"
import { EventFileNode, EventData } from "../../types/event"
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
          slug: string
          cover: string
          type: string
        }
        html: string
      }
    }
    actors: {
      nodes: ActorFileNode[]
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
    actors,
    events,
    images,
  } = data

  return pipe(
    t.array(EventFileNode).decode(events.nodes),
    E.map(nodes =>
      t.array(EventData).encode(
        nodes.map(n => ({
          id: n.childMarkdownRemark.id,
          frontmatter: {
            ...n.childMarkdownRemark.frontmatter,
            links: O.fromNullable(n.childMarkdownRemark.frontmatter.links),
            cover: O.fromNullable(n.childMarkdownRemark.frontmatter.cover),
            actors: pipe(
              O.fromNullable(n.childMarkdownRemark.frontmatter.actors),
              O.map(actorIds =>
                actors.nodes.reduce<ActorFileNode[]>((acc, n) => {
                  const actor = actorIds.includes(
                    n.childMarkdownRemark.frontmatter.username
                  )
                  return actor ? acc.concat(acc) : acc
                }, [])
              )
            ),
            type: O.fromNullable(n.childMarkdownRemark.frontmatter.type),
          },
          fill: "",
          topicLabel: "",
          topicSlug: "",
          topicFill: "",
          html: n.childMarkdownRemark.html,
          image: pipe(
            O.fromNullable(n.childMarkdownRemark.frontmatter.cover),
            O.chain(c =>
              O.fromNullable(images.nodes.find(i => i.relativePath === c))
            ),
            O.map(i => i.childImageSharp.fixed),
            O.toUndefined
          ),
        }))
      )
    ),
    E.fold(
      errs => {
        // eslint-disable-next-line no-console
        console.log(ThrowReporter.report(E.left(errs)))
        return null
      },
      events => {
        return (
          <Layout>
            <SEO title={frontmatter.title} />
            <Columns>
              <Columns.Column size={3}>
                <TimelineNavigator
                  events={events}
                  onEventClick={async e => {
                    await navigate(`${window.location.href}?#${e.id}`)
                  }}
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
                  <EventList events={events} />
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
    actors: allFile(
      filter: {
        relativeDirectory: { glob: "events/actors/*" }
        name: { eq: "index" }
      }
    ) {
      nodes {
        id
        relativeDirectory
        childMarkdownRemark {
          frontmatter {
            title
            cover
            avatar
            username
          }
          html
        }
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
            links
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
