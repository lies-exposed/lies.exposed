import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { Link } from "gatsby"
import * as t from "io-ts"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import moment from "moment"
import * as React from "react"
import { Menu as BMenu } from "react-bulma-components"
import { EventFileNode } from "../../types/event"

interface TimelineNavigatorProps {
  events: Array<EventFileNode["childMarkdownRemark"]>
}

type TimelineNavigatorEventsMap = Map<
  number,
  Map<number, Array<EventFileNode["childMarkdownRemark"]>>
>

const TimelineNavigator: React.FC<TimelineNavigatorProps> = props => {
  const initial: TimelineNavigatorEventsMap = Map.empty
  return pipe(
    t.array(EventFileNode.props.childMarkdownRemark).decode(props.events),
    E.map(events =>
      events.reduce<TimelineNavigatorEventsMap>((acc, e) => {
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
      }, initial)
    ),
    E.fold(
      errs => {
        console.log(ThrowReporter.report(E.left(errs)))
        return null
      },
      eventsByYear => (
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
                          <Link to={`${window.location.pathname}?#${e.id}`}>
                            {e.frontmatter.title}
                          </Link>
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
    )
  )
}

export default TimelineNavigator
