import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
import { TopicMarkdownRemark } from "@models/topic"
import { ordEventFileNodeDate } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface GroupTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: GroupMarkdownRemark
    actors: {
      nodes: ActorMarkdownRemark[]
    }
    groups: {
      nodes: GroupMarkdownRemark[]
    }
    topics: {
      nodes: TopicMarkdownRemark[]
    }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    sequenceS(E.either)({
      pageContent: GroupMarkdownRemark.decode(data.pageContent),
      actors: t.array(ActorMarkdownRemark).decode(data.actors.nodes),
      groups: t.array(GroupMarkdownRemark).decode(data.groups.nodes),
      topics: t.array(TopicMarkdownRemark).decode(data.topics.nodes),
      events: t.array(EventMarkdownRemark).decode(data.events.nodes),
    }),
    E.map(({ pageContent, actors, groups, topics, events }) => {
      const actorsFrontmatter = actors.map((a) => a.frontmatter)

      return {
        pageContent,
        members: actorsFrontmatter,
        events: A.sortBy([Ord.getDualOrd(ordEventFileNodeDate)])(events),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, events, members }) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.name} />
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
            <GroupPageContent {...pageContent} members={members} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query GroupTemplateQuery($group: String!, $members: [String]!) {
    pageContent: markdownRemark(frontmatter: { uuid: { eq: $group } }) {
      ...GroupMarkdownRemark
    }

    actors: allMarkdownRemark(
      filter: { frontmatter: { uuid: { in: $members } } }
    ) {
      nodes {
        ...ActorMarkdownRemark
      }
    }

    groups: allMarkdownRemark(
      filter: { fields: { collection: { eq: "groups" } } }
    ) {
      nodes {
        ...GroupMarkdownRemark
      }
    }

    topics: allMarkdownRemark(
      filter: { fields: { collection: { eq: "topics" } } }
    ) {
      nodes {
        ...TopicMarkdownRemark
      }
    }

    events: allMarkdownRemark(
      filter: {
        fields: {
          collection: { eq: "events" }
          groups: { elemMatch: { uuid: { in: [$group] } } }
        }
      }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`

export default GroupTemplate
