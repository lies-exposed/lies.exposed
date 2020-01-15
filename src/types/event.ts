import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { date } from "io-ts-types/lib/date"

export const Group = t.interface({
  username: t.string,
  name: t.string,
})

export const Subject = t.interface({
  tag: t.string,
})

export interface TreeEvent {
  name: string
  date: Date
  children: TreeEvent[]
}

export const TreeEvent: t.Type<TreeEvent> = t.recursion("TreeEvent", () =>
  t.type({
    name: t.string,
    date: date,
    // abstract: t.string,
    // group: Group,
    // subject: Subject,
    children: t.array(TreeEvent),
  })
)

export const EventFrontmatter = t.interface(
  {
    icon: t.string,
    title: t.string,
    date: DateFromISOString,
    actors: optionFromNullable(t.array(t.string)),
    type: optionFromNullable(t.string),
    cover: optionFromNullable(t.string),
    path: optionFromNullable(t.string),
  },
  "EventFrontmatter"
)

export const EventNode = t.interface(
  {
    id: t.string,
    frontmatter: EventFrontmatter,
  },
  "EventNode"
)

export type EventNode = t.TypeOf<typeof EventNode>

export const EventPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: t.interface(
      {
        id: t.string,
        frontmatter: EventFrontmatter,
        event: t.string,
      },
      "EventPointData"
    ),
  },
  "EventPoint"
)
export type EventPoint = t.TypeOf<typeof EventPoint>

export const EventImageNode = t.interface(
  {
    childImageSharp: t.interface({
      fixed: t.interface({
        src: t.string,
      }),
    }),
    relativeDirectory: t.string,
    relativePath: t.string,
  },
  "EventImageNode"
)

export type EventImageNode = t.TypeOf<typeof EventImageNode>
