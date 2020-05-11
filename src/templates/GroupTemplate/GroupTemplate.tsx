import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorPageContentFileNode } from "@models/actor"
import { EventFileNode } from "@models/event"
import { GroupFileNode } from "@models/group"
import { TopicPageContentFileNode } from "@models/topic"
import { ordEventFileNodeDate } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import { eqString } from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface GroupTimelineTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: GroupFileNode
    groups: {
      nodes: GroupFileNode[]
    }
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

const GroupTimelineTemplate: React.FC<GroupTimelineTemplatePageProps> = ({
  data,
  navigate,
}) => {
  return pipe(
    sequenceS(E.either)({
      pageContent: GroupFileNode.decode(data.pageContent),
      actors: t.array(ActorPageContentFileNode).decode(data.actors.nodes),
      topics: t.array(TopicPageContentFileNode).decode(data.topics.nodes),
      events: t.array(EventFileNode).decode(data.events.nodes),
    }),
    E.map(({ pageContent, actors, topics, events }) => ({
      pageContent,
      events: A.sortBy([Ord.getDualOrd(ordEventFileNodeDate)])(events).map(
        e => ({
          ...e.childMarkdownRemark,
          frontmatter: {
            ...e.childMarkdownRemark.frontmatter,
            type: O.fromNullable(e.childMarkdownRemark.frontmatter.type),
            actors: pipe(
              e.childMarkdownRemark.frontmatter.actors,
              O.map(usernames =>
                actors.reduce<ActorPageContentFileNode[]>((acc, actorNode) => {
                  const actor = usernames.includes(
                    actorNode.childMarkdownRemark.frontmatter.username
                  )
                  return actor ? acc.concat(actorNode) : acc
                }, [])
              )
            ),
            topic: pipe(
              O.fromNullable(
                topics.find(t =>
                  eqString.equals(
                    e.childMarkdownRemark.frontmatter.topic,
                    t.name
                  )
                )
              ),
              O.map(t => t.childMarkdownRemark.frontmatter)
            ),
            links: O.fromNullable(e.childMarkdownRemark.frontmatter.links),
            cover: e.childMarkdownRemark.frontmatter.cover,
          },
        })
      ),
    })),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.name} />
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
            <GroupPageContent {...pageContent.childMarkdownRemark} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query GroupTimelineTemplatePage($group: String!) {
    pageContent: file(
      relativeDirectory: { eq: "groups" }
      name: { eq: $group }
    ) {
      ...GroupPageContentFileNode
    }

    actors: allFile(filter: { relativeDirectory: { eq: "actors" } }) {
      nodes {
        ...ActorPageContentFileNode
      }
    }

    groups: allFile(filter: { relativeDirectory: { eq: "groups" } }) {
      nodes {
        ...GroupPageContentFileNode
      }
    }

    topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
      nodes {
        ...TopicPageContentFileNode
      }
    }

    events: allFile(
      filter: {
        childMarkdownRemark: { frontmatter: { actors: { in: [$group] } } }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`

export default GroupTimelineTemplate
