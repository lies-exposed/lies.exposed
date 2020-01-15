import * as React from "react"
import * as t from "io-ts"
import Icon from "react-bulma-components/lib/components/icon"
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component"
import Heading from "react-bulma-components/lib/components/heading"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import * as O from "fp-ts/lib/Option"
import "react-vertical-timeline-component/style.min.css"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const TimelineEventIcon = t.keyof(
  {
    "pencil-alt": null,
  },
  "TimelineEventIcon"
)

export type TimelineEventIcon = t.TypeOf<typeof TimelineEventIcon>

const TimelineEventType = t.keyof(
  {
    EcologicAct: null,
    AntiEcologicAct: null,
  },
  "TimelineEventType"
)

export type TimelineEventType = t.TypeOf<typeof TimelineEventType>

export const TimelineEventFrontmatter = t.interface(
  {
    icon: TimelineEventIcon,
    title: t.string,
    date: DateFromISOString,
    type: optionFromNullable(TimelineEventType),
    cover: optionFromNullable(t.string),
  },

  "TimelinveEventFrontmatter"
)

export type TimelineEventFrontmatter = t.TypeOf<typeof TimelineEventFrontmatter>

export const TimelineEvent = t.exact(
  t.intersection(
    [
      TimelineEventFrontmatter,
      t.interface({
        id: t.string,
        html: t.string,
        image: optionFromNullable(t.interface({ src: t.string })),
      }),
    ],
    "TimelineEvent"
  )
)
export type TimelineEvent = t.TypeOf<typeof TimelineEvent>

interface TimelineProps {
  events: TimelineEvent[]
}

const getColorByType = (t: TimelineEventType): string => {
  switch (t) {
    case "EcologicAct":
      return "green"
    case "AntiEcologicAct":
    default:
      return "red"
  }
}

const TimelineItem = (e: TimelineEvent) => {
  const color = O.toUndefined(O.option.map(e.type, getColorByType))

  return (
    <VerticalTimelineElement
      key={e.id}
      className="vertical-timeline-element--work"
      contentStyle={{
        borderWidth: 1,
        borderColor: color,
        borderStyle: "solid",
      }}
      contentArrowStyle={{
        borderRight: "7px solid",
        borderRightColor: color,
      }}
      date={e.date.toISOString()}
      iconStyle={{}}
      icon={
        <Icon size={"large"} color={"black"} style={{ width: "100%" }}>
          <i className={`fas fa-${e.icon}`} />
        </Icon>
      }
    >
      <Heading size={6}>{e.title}</Heading>
      {O.toNullable(O.option.map(e.image, i => <img src={i.src} />))}
      <div dangerouslySetInnerHTML={{ __html: e.html }} />
    </VerticalTimelineElement>
  )
}

export const Timeline = ({ events }: TimelineProps) => (
  <VerticalTimeline animate={false}>
    {events.map(TimelineItem)}
  </VerticalTimeline>
)
