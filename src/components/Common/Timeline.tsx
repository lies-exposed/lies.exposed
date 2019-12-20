import * as React from "react"
import "react-vertical-timeline-component/style.min.css"
import * as t from "io-ts"
import Icon from "react-bulma-components/lib/components/icon"
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component"
import Heading from "react-bulma-components/lib/components/heading"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import * as O from "fp-ts/lib/Option"
import * as E from "fp-ts/lib/Either"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"

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
    date: t.string,
    type: optionFromNullable(TimelineEventType),
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

export const Timeline = (props: TimelineProps) => {
  const results = t.array(TimelineEvent).decode(props.events)

  if (E.isLeft(results)) {
    console.log(ThrowReporter.report(results))
    return null
  }

  const events = results.right

  return (
    <VerticalTimeline animate={false}>
      {events.map(e => {
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
            date={e.date}
            iconStyle={{}}
            icon={
              <Icon size={"large"} color={"black"} style={{ width: "100%" }}>
                <i className={`fas fa-${e.icon}`} />
              </Icon>
            }
          >
            <Heading size={6}>{e.title}</Heading>
            <div dangerouslySetInnerHTML={{ __html: e.html }} />
          </VerticalTimelineElement>
        )
      })}
    </VerticalTimeline>
  )
}
