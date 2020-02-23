import { EventData } from "@models/event"
import { Item } from "baseui/side-navigation"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import moment from "moment"

type EventsByYearMap = Map<number, Map<number, EventData[]>>

export const eventsDataToNavigatorItems = (events: EventData[]): Item[] => {
  const initial: EventsByYearMap = Map.empty

  const yearItems = events.reduce<EventsByYearMap>((acc, e) => {
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

  const initialData: Item[] = []
  return Map.toArray(Ord.ordNumber)(yearItems).reduce<Item[]>(
    (acc, [year, monthMap]) => {
      const months = Map.toArray(Ord.ordNumber)(monthMap).reduce<Item[]>(
        (monthAcc, [month, events]) => {
          return monthAcc.concat({
            itemId: `#m-${month.toString()}`,
            title: moment({ month }).format("MMMM"),
            subNav: events.map(e => ({
              title: e.frontmatter.title,
              itemId: `#${e.frontmatter.title}`,
            })),
          })
        },
        []
      )

      return acc.concat({
        itemId: `#y-${year.toString()}`,
        title: year.toString(),
        subNav: months,
      })
    },
    initialData
  )
}
