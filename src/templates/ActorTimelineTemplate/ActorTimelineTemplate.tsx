import { ActorPageContent } from "@components/ActorPageContent"
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { BubbleGraph } from "@components/graph/BubbleGraph"
import { getActors } from "@helpers/actor"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { getTopics } from "@helpers/topic"
import { ActorPageContentFileNode } from "@models/actor"
import { EventFileNode } from "@models/event"
import { TopicPageContentFileNode } from "@models/topic"
import { ordEventFileNodeDate } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
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
    topics: {
      nodes: TopicPageContentFileNode[]
    }
    events: {
      nodes: EventFileNode[]
    }
  }
}

const ActorTimelineTemplate: React.FC<ActorTimelineTemplatePageProps> = ({
  data,
}) => {
  return pipe(
    sequenceS(E.either)({
      pageContent: ActorPageContentFileNode.decode(data.pageContent),
      actors: t.array(ActorPageContentFileNode).decode(data.actors.nodes),
      topics: t.array(TopicPageContentFileNode).decode(data.topics.nodes),
      events: t.array(EventFileNode).decode(data.events.nodes),
    }),
    E.map(({ pageContent, actors, topics, events }) => {
      const actorsGetter = getActors(
        actors.map(a => a.childMarkdownRemark.frontmatter)
      )
      return {
        pageContent,
        events: A.sortBy([Ord.getDualOrd(ordEventFileNodeDate)])(events).map(
          e => ({
            ...e.childMarkdownRemark,
            frontmatter: {
              ...e.childMarkdownRemark.frontmatter,
              type: O.fromNullable(e.childMarkdownRemark.frontmatter.type),
              actors: pipe(
                e.childMarkdownRemark.frontmatter.actors,
                O.map(actorsGetter)
              ),
              topic: getTopics(
                e.childMarkdownRemark.frontmatter.topic,
                topics.map(t => t.childMarkdownRemark.frontmatter)
              ),
              links: O.fromNullable(e.childMarkdownRemark.frontmatter.links),
              cover: e.childMarkdownRemark.frontmatter.cover,
            },
          })
        ),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      const declarationMap = Map.singleton("Declaration", {
        label: "Declaration",
        count: events.filter(e =>
          O.exists(s => s === "Declaration")(e.frontmatter.type)
        ).length,
        color: "red",
      })

      const factMap = Map.insertAt(Eq.eqString)("Fact", {
        label: "Fact",
        count: events.filter(e =>
          pipe(
            e.frontmatter.type,
            O.exists(s => s === "Fact")
          )
        ).length,
        color: "blue",
      })(declarationMap)

      const eventsBubbles = Map.insertAt(Eq.eqString)("AntiEcological", {
        label: "AntiEcological",
        count: events.filter(e =>
          O.exists(s => s === "AntiEcological")(e.frontmatter.type)
        ).length,
        color: "blue",
      })(factMap)
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.fullName} />
          {/* <FlexGridItem>
            <CalendarHeatmap
              width={1000}
              height={300}
              events={events}
              onCircleClick={async event => {
                await navigate(`#${event.id}`)
              }}
            />
            </FlexGridItem> */}
          <ContentWithSideNavigation items={eventsDataToNavigatorItems(events)}>
            <ActorPageContent {...pageContent.childMarkdownRemark} />
            <BubbleGraph width={600} height={400} data={eventsBubbles} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query ActorTimelineTemplatePage($actor: String!) {
    pageContent: file(
      sourceInstanceName: { eq: "content" }
      relativeDirectory: { eq: "actors" }
      name: { eq: $actor }
    ) {
      ...ActorPageContentFileNode
    }

    actors: allFile(
      filter: {
        sourceInstanceName: { eq: "content" }
        relativeDirectory: { eq: "actors" }
      }
    ) {
      nodes {
        ...ActorPageContentFileNode
      }
    }

    topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
      nodes {
        ...TopicPageContentFileNode
      }
    }

    events: allFile(
      filter: {
        relativeDirectory: { eq: "events" }
        childMarkdownRemark: { frontmatter: { actors: { in: [$actor] } } }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`

export default ActorTimelineTemplate
