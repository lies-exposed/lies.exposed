import * as React from "react"
import { EventFileNode } from "../../types/event"
import * as Map from "fp-ts/lib/Map"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as Ord from "fp-ts/lib/Ord"
import moment from "moment"

interface TimelineNavigatorProps {
  events: EventFileNode["childMarkdownRemark"][]
}

type TimelineNavigatorEventsMap = Map<
  number,
  Map<number, EventFileNode["childMarkdownRemark"][]>
>

export default function TimelineNavigator(props: TimelineNavigatorProps) {
  const initial: TimelineNavigatorEventsMap = Map.empty
  const eventsByYear = props.events.reduce<TimelineNavigatorEventsMap>(
    (acc, e) => {
      const year = e.frontmatter.date.getFullYear()
      const month = e.frontmatter.date.getUTCMonth()

      console.log({ year, month })
      console.log("acc", acc)
      const value = pipe(
        Map.lookup(Eq.eqNumber)(year, acc),
        O.fold(
          () => Map.singleton(month, [e]),
          monthMap =>
            pipe(
              Map.lookupWithKey(Eq.eqNumber)(month, monthMap),
              O.fold(
                () => Map.insertAt(Eq.eqNumber)(month, [e])(monthMap),
                ([monthKey, eventsInMonth]) => {
                  console.log(`found entry per month: ${month}`, eventsInMonth)
                  return Map.insertAt(Eq.eqNumber)(
                    monthKey,
                    eventsInMonth.concat(e)
                  )(monthMap)
                }
              )
            )
        )
      )

      console.log("value", Map.toArray(Ord.ordNumber)(value))

      return Map.insertAt(Eq.eqNumber)(year, value)(acc)
    },
    initial
  )

  console.log(eventsByYear)

  return (
    <div>
      {Map.toArray(Ord.getDualOrd(Ord.ordNumber))(eventsByYear).map(
        ([key, eventsByMonth]) => (
          <div key={key}>
            <div>{key}</div>
            {Map.toArray(Ord.getDualOrd(Ord.ordNumber))(eventsByMonth).map(
              ([month, events]) => (
                <div key={month}>
                  <div>{moment({ month }).format("MMMM")}</div>
                  {events.map(e => (
                    <div key={e.frontmatter.title}>{e.frontmatter.title}</div>
                  ))}
                </div>
              )
            )}
          </div>
        )
      )}
    </div>
  )
}
