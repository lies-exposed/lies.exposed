import * as React from "react"
import { EventFileNode } from "../../types/event"
import * as Map from "fp-ts/lib/Map"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as Ord from "fp-ts/lib/Ord"
import moment from "moment"
import { Menu as BMenu } from "react-bulma-components"
import { Link } from "gatsby"

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
                  return Map.insertAt(Eq.eqNumber)(
                    monthKey,
                    eventsInMonth.concat(e)
                  )(monthMap)
                }
              )
            )
        )
      )

      return Map.insertAt(Eq.eqNumber)(year, value)(acc)
    },
    initial
  )

  return (
    <BMenu>
      {Map.toArray(Ord.getDualOrd(Ord.ordNumber))(eventsByYear).map(
        ([year, eventsByMonth]) => (
          <div key={year}>
            <p className="menu-label">{year}</p>
            {Map.toArray(Ord.getDualOrd(Ord.ordNumber))(eventsByMonth).map(
              ([month, events]) => (
                <BMenu.List key={month}>
                  <p className="menu-label">
                    {moment({ month }).format("MMMM")}
                  </p>
                  {events.map(e => (
                    <BMenu.List.Item key={e.frontmatter.title}>
                      <Link to={`${window.location.pathname}?#${e.id}`}>{e.frontmatter.title}</Link>
                    </BMenu.List.Item>
                  ))}
                </BMenu.List>
              )
            )}
          </div>
        )
      )}
    </BMenu>
  )
}
