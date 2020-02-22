import {
  Unstable_TreeView as TreeView,
  TreeNode,
} from "baseui/tree-view"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import moment from "moment"
import * as React from "react"

export interface TimelineEvent {
  id: string
  frontmatter: {
    date: Date
    title: string
  }
}

interface TimelineNavigatorProps {
  events: TimelineEvent[]
  onEventClick: (event: TimelineEvent) => void
}

type TimelineNavigatorEventsMap = Map<number, Map<number, TimelineEvent[]>>

const TimelineNavigator: React.FC<TimelineNavigatorProps> = ({
  events,
  onEventClick,
}) => {
  const initial: TimelineNavigatorEventsMap = Map.empty

  const tree = events.reduce<TimelineNavigatorEventsMap>((acc, e) => {
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

  const initialData: TreeNode[] = []
  const data = Map.toArray(Ord.ordNumber)(tree).reduce<TreeNode[]>(
    (acc, [year, monthMap]) => {
      const months = Map.toArray(Ord.ordNumber)(monthMap).reduce<TreeNode[]>(
        (monthAcc, [month, events]) => {
          return monthAcc.concat({
            id: month,
            label: moment({ month }).format('MMMM'),
            isExpanded: true,
            children: events.map(e => ({ label: e.frontmatter.title })),
          })
        },
        []
      )

      return acc.concat({
        id: year,
        label: year.toString(),
        isExpanded: true,
        children: months,
      })
    },
    initialData
  )

  return <TreeView singleExpanded={true} data={data} />
}

export default TimelineNavigator
