import { Actor, Events, Project } from "@econnessione/io"
import { eventMetadataMapEmpty } from "@mock-data/events/events-metadata"
import { Item } from "baseui/side-navigation"
import { format, subWeeks } from "date-fns"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { isByActor } from "./actor"

type EventsByYearMap = Map<number, Map<number, Events.EventMD[]>>

export const eventsDataToNavigatorItems = (
  events: Events.EventMD[]
): Item[] => {
  const initial: EventsByYearMap = Map.empty

  const yearItems = events.reduce<EventsByYearMap>((acc, e) => {
    const frontmatter = e.frontmatter
    const year = frontmatter.date.getFullYear()
    const month = frontmatter.date.getUTCMonth()

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
            itemId: `#${e.frontmatter.id}`,
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

export const filterMetadataForActor = (actor: Actor.ActorFrontmatter) => (
  metadata: Events.EventFrontmatter
): boolean => {
  const byActor = isByActor(actor)

  switch (metadata.type) {
    case Events.ProjectTransaction.PROJECT_TRANSACTION: {
      return (
        metadata.transaction.by.type === "Actor" &&
        byActor(metadata.transaction.by)
      )
    }
    case Events.ProjectImpact.PROJECT_IMPACT: {
      return (
        metadata.approvedBy.some(byActor) ?? metadata.executedBy.some(byActor)
      )
    }
    case "Condamned":
    case "Death":
    case "Arrest": {
      return byActor(metadata.who)
    }
    case Events.Protest.PROTEST.value: {
      return metadata.organizers.some(byActor)
    }
    default:
      return false
  }
}

export const filterMetadataFroProject = (
  project: Project.ProjectFrontmatter
) => (metadata: Events.EventFrontmatter): boolean => {
  switch (metadata.type) {
    case "ProjectTransaction":
      return metadata.project.id === project.id
    case "ProjectImpact":
      return metadata.project.id === project.id
    case Events.Protest.PROTEST.value: {
      return (
        metadata.for.type === "Project" &&
        metadata.for.project.id === project.id
      )
    }
    case "Arrest": {
      return metadata.for.some(
        (f) => f.type === "Project" && f.project.id === project.id
      )
    }
    default:
      return false
  }
}

export const ordEventDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: Events.EventMD) => e.frontmatter.date
)

const colorMap: Record<Events.EventFrontmatter["type"], string> = {
  Protest: "red",
  ProjectTransaction: "blue",
  ProjectImpact: "orange",
  StudyPublished: "green",
  Fined: "yellow",
  Death: "black",
  Arrest: "lightred",
  Condamned: "lightred",
  PublicAnnouncement: "lightgreen",
  Uncategorized: "grey",
}
export const getColorByEventType = ({
  type,
}: {
  type: Events.EventFrontmatter["type"]
}): string => {
  return colorMap[type]
}
interface EventsInDateRangeProps {
  minDate: O.Option<Date>
  maxDate: O.Option<Date>
}

export const eventsInDateRange = (props: EventsInDateRangeProps) => (
  events: Events.EventMD[]
): Events.EventMD[] => {
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
    | { type: "Project"; elem: Project.ProjectFrontmatter }
    | { type: "Actor"; elem: Actor.ActorFrontmatter }
) => (events: Events.EventFrontmatter[]): Events.EventListMap => {
  const init: Map<string, Events.EventFrontmatter[]> = Map.empty
  const results = pipe(
    events,
    A.filter((e) => {
      switch (opts.type) {
        case "Actor": {
          return filterMetadataForActor(opts.elem)(e)
        }
        case "Project":
        default: {
          return filterMetadataFroProject(opts.elem)(e)
        }
      }
    }),
    A.reduce(init, (acc, m) => {
      return pipe(
        Map.lookup(Eq.eqString)(m.type, acc),
        O.getOrElse((): Events.EventFrontmatter[] => []),
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
