import { ActorPageContent } from "@components/ActorPageContent"
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorPageContentFileNode } from "@models/actor"
import { EventFileNode } from "@models/event"
import { ImageFileNode } from "@models/image"
import { ordEventFileNodeDate } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
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
  const { pageContent, actors, events, eventsAsActor } = data

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
    E.fold(throwValidationErrors, timelineEvents => {
      const coverImage = pipe(
        pageContent.childMarkdownRemark.frontmatter.cover,
        O.toUndefined
      )

      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.fullName} />
          <ContentWithSideNavigation
            items={eventsDataToNavigatorItems(timelineEvents)}
          >
            <ActorPageContent
              {...pageContent.childMarkdownRemark}
              coverImage={coverImage}
            />
            <EventList events={timelineEvents} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
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
      ...ActorPageContentFileNode
    }

    actors: allFile(
      filter: {
        relativeDirectory: { glob: "events/actors/*" }
        name: { eq: "index" }
      }
    ) {
      nodes {
        ...ActorFileNode
      }
    }

    eventsAsActor: allFile(
      filter: {
        childMarkdownRemark: { frontmatter: { actors: { eq: $subject } } }
      }
      sort: { order: DESC, fields: childMarkdownRemark___frontmatter___date }
    ) {
      nodes {
        ...EventFileNode
      }
    }

    events: allFile(
      filter: {
        relativeDirectory: { eq: $relativeDirectory }
        name: { ne: "index" }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`

export default ActorTimelineTemplate
