import EventList from "@components/EventList"
import { ActorFrontmatter } from "@models/actor"
import { EventData } from "@models/event"
import { TopicData } from "@models/topic"
import { HTMLtoAST, MDtoHTML } from "@utils/markdownHTML"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const EventPreview: React.FC<any> = (props) => {
  const { entry } = props
  const { body, ...frontmatter } = entry.getIn(["data"]).toJS()

  const cover = O.none
  const links = O.fromNullable(frontmatter.links)
  const topic: TopicData =
    frontmatter.topic !== undefined
      ? frontmatter.topic.map((t: string) => ({
          label: t,
          slug: t,
          color: "#FFF",
        }))
      : [{ label: "not-a-real-topic", slug: "not-a-real-topic", color: "#FFF" }]

  const actors = pipe(
    O.fromNullable<ActorFrontmatter[]>(frontmatter.actors),
    O.map((aa) =>
      aa.map((a) => ({
        ...a,
        avatar: O.none,
        color: O.none,
      }))
    )
  )

  const events: EventData[] = [
    {
      id: "event-preview",
      frontmatter: {
        ...frontmatter,
        date: new Date(frontmatter.date),
        cover,
        links,
        actors,
        topic,
      },
      htmlAst: HTMLtoAST(MDtoHTML(body)),
    },
  ]

  return <EventList events={events} />
}
