import DatePicker from "@components/Common/DatePicker"
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventsMap from "@components/EventsMap"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import SearchableInput from "@components/SearchableInput"
import { ActorListItem } from "@components/lists/ActorList"
import EventList from "@components/lists/EventList"
import { GroupListItem } from "@components/lists/GroupList"
import { TopicListItem } from "@components/lists/TopicList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorFrontmatter } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { GroupFrontmatter } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { TopicFrontmatter } from "@models/topic"
import theme from "@theme/CustomeTheme"
import { ordEventData } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { LabelMedium } from "baseui/typography"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import moment from "moment"
import React from "react"

const width = 1000
const height = 400
// const margin = { vertical: 30, horizontal: 30 }

interface EventsPageProps extends PageProps{
  data: {
    pageContent: unknown
    events: { nodes: unknown }
    topics: { nodes: unknown }
    actors: { nodes: unknown }
    groups: { nodes: unknown }
  }
}

const EventsPage: React.FC<EventsPageProps> = ({ data, ...props }) => {
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>([])
  const [selectedActorIds, setSelectedActorIds] = React.useState<string[]>([])
  const [selectedTopicIds, setSelectedTopicIds] = React.useState<string[]>([])
  const [dateRange, setDateRange] = React.useState<Date[]>([
    moment().subtract(10, "years").toDate(),
    new Date(),
  ])

  const onActorClick = (actor: ActorFrontmatter): void => {
    const newSelectedActorIds = A.elem(Eq.eqString)(actor.uuid, selectedActorIds)
    ? A.array.filter(
        selectedActorIds,
        (a) => !Eq.eqString.equals(a, actor.uuid)
      )
    : selectedActorIds.concat(actor.uuid)
    setSelectedActorIds(
      newSelectedActorIds
    )
  }

  const onGroupClick = (g: GroupFrontmatter): void => {
    setSelectedGroupIds(
      A.elem(Eq.eqString)(g.uuid, selectedGroupIds)
        ? A.array.filter(
            selectedGroupIds,
            (a) => !Eq.eqString.equals(a, g.uuid)
          )
        : selectedGroupIds.concat(g.uuid)
    )
  }

  const onTopicClick = (topic: TopicFrontmatter): void => {
    setSelectedTopicIds(
      A.elem(Eq.eqString)(topic.uuid, selectedTopicIds)
        ? A.array.filter(
            selectedTopicIds,
            (a) => !Eq.eqString.equals(a, topic.uuid)
          )
        : selectedTopicIds.concat(topic.uuid)
    )
  }

  const onDatePickerChange = (value: { date: Date | Date[] }): void => {
    if (Array.isArray(value.date)) {
      setDateRange(value.date)
    }
  }

  const minDate = dateRange[0]
  const maxDate = pipe(
    O.fromNullable(dateRange[1]),
    O.getOrElse(() => new Date())
  )

  return pipe(
    sequenceS(E.either)({
      pageContent: PageContentFileNode.decode(data.pageContent),
      topics: t.array(TopicFrontmatter).decode(data.topics.nodes),
      actors: t.array(ActorFrontmatter).decode(data.actors.nodes),
      groups: t.array(GroupFrontmatter).decode(data.groups.nodes),
      events: t.array(EventMarkdownRemark).decode(data.events.nodes),
    }),
    E.fold(
      throwValidationErrors,
      ({ pageContent, events, actors, topics, groups }) => {
        const filteredEvents = A.sort(Ord.getDualOrd(ordEventData))(
          events
        ).filter((e) => {
          const isBetweenDateRange = moment(e.frontmatter.date).isBetween(
            moment(minDate),
            moment(maxDate)
          )
          const hasActor = pipe(
            e.frontmatter.actors,
            O.map((actors) =>
              actors.some((i) => selectedActorIds.includes(i.uuid))
            ),
            O.getOrElse(() => false)
          )

          const hasGroup = pipe(
            e.frontmatter.groups,
            O.map((actors) =>
              actors.some((i) => selectedGroupIds.includes(i.uuid))
            ),
            O.getOrElse(() => false)
          )

          const hasTopic = pipe(
            O.some(e.frontmatter.topics),
            O.map((actors) =>
              actors.some((i) => selectedTopicIds.includes(i.uuid))
            ),
            O.getOrElse(() => false)
          )

          return isBetweenDateRange && (hasActor || hasGroup || hasTopic)
        })

        return (
          <Layout>
            <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
            <FlexGrid
              alignItems="center"
              alignContent="center"
              justifyItems="center"
              flexGridColumnCount={1}
            >
              <FlexGridItem width="100%">
                <PageContent {...pageContent.childMarkdownRemark} />
                <FlexGrid
                  flexGridColumnCount={4}
                  alignItems="start"
                  maxHeight="200"
                >
                  <FlexGridItem>
                    <DatePicker
                      value={dateRange}
                      range={true}
                      quickSelect={true}
                      onChange={onDatePickerChange}
                    />
                  </FlexGridItem>
                  <FlexGridItem>
                    <SearchableInput
                      placeholder="Topics..."
                      items={topics}
                      getValue={(item) => item.label}
                      itemRenderer={(item, itemProps, index) => (
                        <TopicListItem
                          $theme={theme}
                          key={item.uuid}
                          index={index}
                          item={{
                            ...item,
                            selected: selectedTopicIds.includes(item.uuid),
                          }}
                          onClick={(item) => itemProps.onClick(item)}
                        />
                      )}
                      onSelectItem={(item, items) => {
                        onTopicClick(item)
                      }}
                      onUnselectItem={(item) => onTopicClick(item)}
                    />
                  </FlexGridItem>
                  <FlexGridItem
                    display="flex"
                    flexGridColumnCount={1}
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <SearchableInput
                      placeholder="Gruppi..."
                      items={groups}
                      itemRenderer={(item, itemProps, index) => {
                        return (
                          <GroupListItem
                            key={item.uuid}
                            index={index}
                            item={{
                              ...item,
                              selected: selectedGroupIds.includes(item.uuid),
                            }}
                            onClick={(item) => itemProps.onClick(item)}
                            avatarScale="scale1000"
                          />
                        )
                      }}
                      onSelectItem={(item) => {
                        onGroupClick(item)
                      }}
                      onUnselectItem={(item) => {
                        onGroupClick(item)
                      }}
                      getValue={(item) => item.name}
                    />
                  </FlexGridItem>
                  <FlexGridItem>
                    <SearchableInput
                      placeholder="Attori..."
                      items={actors}
                      itemRenderer={(item, itemProps, index) => {
                        return (
                          <ActorListItem
                            key={item.uuid}
                            index={index}
                            item={{
                              ...item,
                              selected: selectedActorIds.includes(item.uuid),
                            }}
                            onClick={(item) => itemProps.onClick(item)}
                            avatarScale="scale1000"
                          />
                        )
                      }}
                      onSelectItem={(item) => onActorClick(item)}
                      onUnselectItem={(item) => onActorClick(item)}
                      getValue={(item) => item.username}
                    />
                  </FlexGridItem>
                </FlexGrid>
                <LabelMedium>Nº Eventi: {filteredEvents.length}</LabelMedium>
              </FlexGridItem>
              <FlexGridItem alignItems="center">
                <EventsMap
                  width={width}
                  height={height}
                  events={filteredEvents}
                />
              </FlexGridItem>
              <FlexGridItem>
                <ContentWithSideNavigation
                  items={eventsDataToNavigatorItems(filteredEvents)}
                >
                  <EventList events={filteredEvents} />
                </ContentWithSideNavigation>
              </FlexGridItem>
            </FlexGrid>
          </Layout>
        )
      }
    )
  )
}

export const pageQuery = graphql`
  query EventsQuery {
    pageContent: file(
      childMarkdownRemark: { fields: { collection: { eq: "pages" } } }
      name: { eq: "actors" }
    ) {
      ...PageFileNode
    }

    topics: allTopicFrontmatter {
      nodes {
        ...Topic
      }
    }

    actors: allActorFrontmatter {
      nodes {
        ...Actor
      }
    }

    groups: allGroupFrontmatter {
      nodes {
        ...Group
      }
    }

    events: allMarkdownRemark(
      filter: { fields: { collection: { eq: "events" } } }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`
export default EventsPage
