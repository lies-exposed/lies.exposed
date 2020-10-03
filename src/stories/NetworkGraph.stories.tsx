import Network, { NetworkProps } from "@components/graph/Network/Network"
import { Story, Meta } from "@storybook/react/types-6-0"
import {
  createNetworkTemplateProps,
  NetworkTemplateProps,
} from "@templates/NetworkTemplate/createNetworkTemplateProps"
import { generateRandomColor } from "@utils/colors"
import ordinalScale from "@vx/scale/lib/scales/ordinal"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import moment from "moment"
import * as React from "react"
import { v1 as uuid } from "uuid"

const meta: Meta = {
  title: "Example/NetworkGraph",
  component: Network,
}

export default meta

// topics
const firstTopic = {
  uuid: uuid(),
  label: "First Topic",
  slug: "first-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const secondTopic = {
  uuid: uuid(),
  label: "Second Topic",
  slug: "second-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const thirdTopic = {
  uuid: uuid(),
  label: "Third Topic",
  slug: "third-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const topics = [firstTopic, secondTopic, thirdTopic]

const firstActor = {
  uuid: uuid(),
  fullName: "First Actor",
  username: "first-actor",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const secondActor = {
  uuid: uuid(),
  fullName: "Second Actor",
  username: "second-actor",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const actors = [firstActor, secondActor]

const firstGroup = {
  uuid: uuid(),
  name: "First Group",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const secondGroup = {
  uuid: uuid(),
  name: "Second Group",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const groups = [firstGroup, secondGroup]

// events

const events = [
  {
    uuid: uuid(),
    title: "First Event",
    topics: [firstTopic],
    actors: [firstActor, secondActor],
    groups: [firstGroup],
    links: [],
    images: null,
    date: moment().subtract(2, "month").toISOString(),
  },
  {
    uuid: uuid(),
    title: "Second Event",
    topics: [secondTopic],
    actors: [secondActor],
    links: [],
    images: null,
    date: moment().subtract(2, "month").toISOString(),
  },
  {
    uuid: uuid(),
    title: "Third Event",
    topics: [secondTopic, thirdTopic],
    actors: [secondActor],
    groups: [firstGroup],
    links: [],
    images: null,
    date: moment().subtract(3, "week").toISOString(),
  },
  {
    uuid: uuid(),
    title: "Fourth Event",
    type: "NaturalDisaster",
    topics: [firstTopic, secondTopic],
    actors: [secondActor],
    groups: [secondGroup],
    links: [],
    images: null,
    date: new Date().toISOString(),
  },
].map((e) => ({
  frontmatter: e,
  htmlAst: {},
  tableOfContents: "",
  timeToRead: 1,
}))

const Template: Story<NetworkProps> = (args) => {
  return <Network {...args} />
}

const NetworkGraphExample = Template.bind({})

const minDate = new Date(2020, 6)
const maxDate = new Date()

const args: NetworkTemplateProps = pipe(
  createNetworkTemplateProps({
    minDate: O.some(minDate),
    maxDate: O.some(maxDate),
    width: 600,
    height: 300,
    scale: "all",
    scalePoint: O.none,
    margin: { horizontal: 20, vertical: 30 },
    data: { events: { nodes: events } },
    selectedActorIds: actors.map((t) => t.uuid),
    selectedGroupIds: groups.map((g) => g.uuid),
    selectedTopicIds: topics.map((t) => t.uuid),
  }),
  E.getOrElse(
    (): NetworkTemplateProps => ({
      width: 600,
      height: 300,
      scale: "all",
      graph: { nodes: [], links: [] },
      minDate,
      maxDate,
      selectedEvents: [],
      topicsScale: ordinalScale({
        domain: topics.map((t) => t.label),
        range: topics.map((t) => t.color),
      }),
      groupsScale: ordinalScale({
        domain: groups.map((t) => t.name),
        range: groups.map((t) => t.color),
      }),
      actorsScale: ordinalScale({
        domain: actors.map((t) => t.username),
        range: actors.map((t) => t.color),
      }),
    })
  )
)

NetworkGraphExample.args = {
  ...args,
  width: args.width,
  height: args.height,
}

NetworkGraphExample.argTypes = {
  minDate: { control: "date" },
  maxDate: { control: "date" },
  graph: { control: "object" },
  selectedEvents: { control: "object" },
}

export { NetworkGraphExample }
