import { EventFrontmatter, EventMarkdownRemark, EventType } from "@models/event"
import { subWeeks } from "date-fns"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
export const ordEventDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMarkdownRemark) => e.frontmatter.date
)

const colorMap: Record<EventType, string> = {
  AnthropicDisaster: "red",
  NaturalDisaster: "yellow",
  Act: "blue",
  War: "black",
  Migration: "orange",
  CivilConflict: "grey",
  Declaration: "lightgreen",
}
export const getColorByEventType = ({
  type,
}: {
  type: EventFrontmatter["type"]
}): string => {
  return pipe(
    type,
    O.map((t) => colorMap[t]),
    O.getOrElse(() => "white")
  )
}
interface EventsInDateRangeProps {
  minDate: O.Option<Date>
  maxDate: O.Option<Date>
}

export const eventsInDateRange = (props: EventsInDateRangeProps) => (
  events: EventMarkdownRemark[]
): EventMarkdownRemark[] => {
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
