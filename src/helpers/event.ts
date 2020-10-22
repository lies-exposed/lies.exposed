import { EventMetadata } from "@models/EventMetadata"
import { ProjectFrontmatter } from "@models/Project"
import { EventMD } from "@models/event"
import { Item } from "baseui/side-navigation"
import { format } from "date-fns"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

type EventsByYearMap = Map<number, Map<number, EventMD[]>>

export const eventsDataToNavigatorItems = (events: EventMD[]): Item[] => {
  const initial: EventsByYearMap = Map.empty

  const yearItems = events.reduce<EventsByYearMap>((acc, e) => {
    const year = e.frontmatter.date.getFullYear()
    const month = e.frontmatter.date.getUTCMonth()

    const value = pipe(
      Map.lookup(Eq.eqNumber)(year, acc),
      O.fold(
        () => Map.singleton(month, [e]),
        (monthMap) =>
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
  return Map.toArray(Ord.getDualOrd(Ord.ordNumber))(yearItems).reduce<Item[]>(
    (acc, [year, monthMap]) => {
      const months = Map.toArray(Ord.getDualOrd(Ord.ordNumber))(
        monthMap
      ).reduce<Item[]>((monthAcc, [month, events]) => {
        return monthAcc.concat({
          itemId: `#m-${month.toString()}`,
          title: format(new Date().setMonth(month), "MMMM"),
          subNav: events.map((e) => ({
            title: e.frontmatter.title,
            itemId: `#${e.frontmatter.uuid}`,
          })),
        })
      }, [])

      return acc.concat({
        itemId: `#y-${year.toString()}`,
        title: year.toString(),
        subNav: months,
      })
    },
    initialData
  )
}

export const filterMetadataFroProject = (project: ProjectFrontmatter) => (
  metadata: EventMetadata
) => {
  switch (metadata.type) {
    case "ProjectFund":
      return metadata.project.uuid === project.uuid
    case "ProjectImpact":
      return metadata.project.uuid === project.uuid
    case "Protest": {
      if (metadata.for.__type === "ForProject") {
        return metadata.for.uuid === project.uuid
      }
      return false
    }
    default:
      return false
  }
}