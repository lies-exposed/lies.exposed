import { EventMetadata } from "@models/EventMetadata"
import { EventMD } from "@models/event"
import { subWeeks } from "date-fns"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

export const ordEventDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMD) => e.frontmatter.date
)

const colorMap: Record<EventMetadata['type'], string> = {
  Protest: "red",
  ProjectFund: 'blue',
  ProjectImpact: 'orange'
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
