import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import moment from "moment"
import * as React from "react"
import { Menu as BMenu } from "react-bulma-components"

export interface TimelineEvent {
  id: string;
  frontmatter: {
    date: Date;
    title: string;
  }
}

interface TimelineNavigatorProps {
  events: TimelineEvent[]
  onEventClick: (event: TimelineEvent) => void
}

type TimelineNavigatorEventsMap = Map<
  number,
  Map<number, TimelineEvent[]>
>

const TimelineNavigator: React.FC<TimelineNavigatorProps> = ({
  events,
  onEventClick,
}) => {
  const initial: TimelineNavigatorEventsMap = Map.empty
  const eventsByYear = events.reduce<TimelineNavigatorEventsMap>((acc, e) => {
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
                    <BMenu.List.Item
                      key={e.frontmatter.title}
                      onClick={() => onEventClick(e)}
                    >
                      {e.frontmatter.title}
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

export default TimelineNavigator
