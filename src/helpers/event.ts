import { eventMetadataMapEmpty } from "@mock-data/events-metadata"
import { EventMetadata, EventMetadataMap } from "@models/EventMetadata"
import { ProjectFrontmatter } from "@models/Project"
import { ActorFrontmatter } from "@models/actor"
import { EventFrontmatter, EventMD } from "@models/event"
import { Item } from "baseui/side-navigation"
import { format, subWeeks } from "date-fns"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { isByActor } from "./actor"

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

export const filterMetadataForActor = (actor: ActorFrontmatter) => (
  metadata: EventMetadata
): boolean => {
  const byActor = isByActor(actor)
  switch (metadata.type) {
    case "ProjectFund": {
      return metadata.by.__type === "Actor" && byActor(metadata.by)
    }
    case "ProjectImpact": {
      return (
        metadata.approvedBy.some(byActor) ?? metadata.executedBy.some(byActor)
      )
    }
    case "Condamned":
    case "Death":
    case "Arrest": {
      return byActor(metadata.who)
    }
    case 'Protest': {
      return metadata.by.some(byActor)
    }
    default:
      return false
  }
}

export const filterMetadataFroProject = (project: ProjectFrontmatter) => (
  metadata: EventMetadata
): boolean => {
  switch (metadata.type) {
    case "ProjectFund":
      return metadata.project.uuid === project.uuid
    case "ProjectImpact":
      return metadata.project.uuid === project.uuid
    case "Protest": {
      return (
        metadata.for.__type === "ForProject" &&
        metadata.for.uuid === project.uuid
      )
    }
    case "Arrest": {
      return metadata.for.some(
        (f) => f.__type === "ForProject" && f.uuid === project.uuid
      )
    }
    default:
      return false
  }
}

export const ordEventDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMD) => e.frontmatter.date
)

const colorMap: Record<EventMetadata["type"], string> = {
  Protest: "red",
  ProjectFund: "blue",
  ProjectImpact: "orange",
  StudyPublished: "green",
  Death: "black",
  Arrest: "lightred",
  Condamned: "lightred",
  PublicAnnouncement: "lightgreen",
  Uncategorized: "grey",
}
export const getColorByEventType = ({
  type,
}: {
  type: EventMetadata["type"]
}): string => {
  return colorMap[type]
}
interface EventsInDateRangeProps {
  minDate: O.Option<Date>
  maxDate: O.Option<Date>
}

export const eventsInDateRange = (props: EventsInDateRangeProps) => (
  events: EventMD[]
): EventMD[] => {
  return pipe(
    events,
    A.sort(Ord.getDualOrd(ordEventDate)),
    (orderedEvents) => {
      const minDate = pipe(
        props.minDate,
        O.alt(() =>
          pipe(
            A.last(orderedEvents),
            O.map((e) => e.frontmatter.date)
          )
        ),
        O.getOrElse(() => subWeeks(new Date(), 1))
      )

      const maxDate = pipe(
        props.maxDate,
        O.alt(() =>
          pipe(
            A.head(orderedEvents),
            O.map((e) => e.frontmatter.date)
          )
        ),
        O.getOrElse(() => new Date())
      )

      return { events: orderedEvents, minDate, maxDate }
    },
    ({ events, minDate, maxDate }) => {
      return A.array.filter(events, (e) =>
        Ord.between(Ord.ordDate)(minDate, maxDate)(e.frontmatter.date)
      )
    }
  )
}

export const extractEventsMetadata = (
  opts:
    | { type: "Project"; elem: ProjectFrontmatter }
    | { type: "Actor"; elem: ActorFrontmatter }
) => (events: EventFrontmatter[]): EventMetadataMap => {
  const init: Map<string, EventMetadata[]> = Map.empty
  const results = pipe(
    events,
    A.map((e) => {
      return pipe(
        e.metadata,
        O.map((metadata) => {
          switch (opts.type) {
            case "Actor": {
              return metadata.filter(filterMetadataForActor(opts.elem))
            }
            case "Project":
            default: {
              return metadata.filter(filterMetadataFroProject(opts.elem))
            }
          }
        }),
        O.getOrElse((): EventMetadata[] => [])
      )
    }),
    A.flatten,
    A.reduce(init, (acc, m) => {
      return pipe(
        Map.lookup(Eq.eqString)(m.type, acc),
        O.getOrElse((): EventMetadata[] => []),
        (storedMeta) =>
          Map.insertAt(Eq.eqString)(m.type, storedMeta.concat(m))(acc)
      )
    }),
    Map.toArray(Ord.ordString),
    A.reduce(eventMetadataMapEmpty, (acc, [index, m]) => ({
      ...acc,
      [index]: m,
    }))
  )

  return results
}
