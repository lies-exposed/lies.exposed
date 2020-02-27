/**
 * @TODO
 * - add related topic to events
 */

import EventList from "@components/EventList/EventList"
import Layout from "@components/Layout"
import SEO from "@components/SEO"
import TimelineNavigator, {
  TimelineEvent,
} from "@components/TimelineNavigator/TimelineNavigator"
import { ActorPageContentFileNode } from "@models/actor"
import { EventFileNode } from "@models/event"
import { ImageFileNode } from "@models/image"
import { ordEventFileNodeDate } from "@utils//event"
import renderMarkdownAST from "@utils//renderMarkdownAST"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import { HeadingXLarge } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import React from "react"

interface ActorTimelineTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: ActorPageContentFileNode
    actors: {
      nodes: ActorPageContentFileNode[]
    }
    events: {
      nodes: EventFileNode[]
    }
    eventsAsActor: {
      nodes: EventFileNode[]
    }
    images: {
      nodes: ImageFileNode[]
    }
  }
}

const byId = Eq.contramap((n: EventFileNode) => n.childMarkdownRemark.id)(
  Eq.eqString
)

const ActorTimelineTemplate: React.FC<ActorTimelineTemplatePageProps> = ({
  data,
  navigate,
}) => {
  const {
    pageContent: {
      childMarkdownRemark: { frontmatter, htmlAst },
    },
    actors,
    events,
    eventsAsActor,
  } = data

  const onEventClick = async (e: TimelineEvent): Promise<void> => {
    await navigate(`${window.location.href}?#${e.id}`)
  }

  return pipe(
    E.right(A.union(byId)(events.nodes, eventsAsActor.nodes)),
    E.chain(t.array(EventFileNode).decode),
    E.map(events =>
      A.sortBy([Ord.getDualOrd(ordEventFileNodeDate)])(events).map(e => ({
        ...e.childMarkdownRemark,
        frontmatter: {
          ...e.childMarkdownRemark.frontmatter,
          type: O.fromNullable(e.childMarkdownRemark.frontmatter.type),
          actors: pipe(
            O.fromNullable(e.childMarkdownRemark.frontmatter.actors),
            O.map(actorIds =>
              actors.nodes.reduce<ActorPageContentFileNode[]>((acc, n) => {
                const actor = actorIds.includes(
                  n.childMarkdownRemark.frontmatter.username
                )
                return actor ? acc.concat(acc) : acc
              }, [])
            )
          ),
          links: O.fromNullable(e.childMarkdownRemark.frontmatter.links),
          cover: e.childMarkdownRemark.frontmatter.cover,
        },
        topicFill: "#fff",
        fill: "#fff",
        topicLabel: "fake",
        topicSlug: "fake",
      }))
    ),
    E.fold(
      errs => {
        // eslint-disable-next-line no-console
        console.log(ThrowReporter.report(E.left(errs)))
        return null
      },
      timelineEvents => {
        return (
          <Layout>
            <SEO title={frontmatter.fullName} />
            <FlexGrid flexGridColumnCount={3}>
              <FlexGridItem>
                <TimelineNavigator
                  events={timelineEvents}
                  onEventClick={onEventClick}
                />
              </FlexGridItem>
              <FlexGridItem
                overrides={{
                  Block: {
                    style: ({ $theme }: { $theme: Theme }) => {
                      return {
                        width: `calc((200% - ${$theme.sizing.scale800}) / 3)`,
                      }
                    },
                  },
                }}
              >
                <HeadingXLarge>{frontmatter.fullName}</HeadingXLarge>
                {pipe(
                  frontmatter.avatar,
                  O.map(src => <img key={`${frontmatter.username}-avatar`} src={src} />),
                  O.toNullable
                )}
                <div className="content">{renderMarkdownAST(htmlAst)}</div>
                <EventList events={timelineEvents} />
              </FlexGridItem>
              <FlexGridItem display="none" />
            </FlexGrid>
          </Layout>
        )
      }
    )
  )
}

export const pageQuery = graphql`
  query ActorTimelineTemplatePage(
    $subject: String!
    $relativeDirectory: String!
    $imagesRelativeDirectoryGlob: String!
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
          avatar
        }
        htmlAst
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
          htmlAst
        }
      }
    }

    eventsAsActor: allFile(
      filter: {
        childMarkdownRemark: { frontmatter: { actors: { eq: $subject } } }
      }
      sort: { order: DESC, fields: childMarkdownRemark___frontmatter___date }
    ) {
      nodes {
        id
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
          htmlAst
        }
      }
    }

    events: allFile(
      filter: {
        relativeDirectory: { eq: $relativeDirectory }
        name: { ne: "index" }
      }
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
          htmlAst
        }
      }
    }
  }
`

export default ActorTimelineTemplate
