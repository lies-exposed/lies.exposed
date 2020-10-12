import EventList from "@components/lists/EventList"
import { EventMD } from "@models/event"
import { GroupFrontmatter } from "@models/group"
import { TopicFrontmatter } from "@models/topic"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const EventPreview: React.FC<any> = (props) => {
  const { entry } = props
  const { body, uuid, title, location, ...frontmatter } = entry
    .getIn(["data"])
    .toJS()

  const cover = O.none
  const links = O.fromNullable(frontmatter.links)
  const topics: NEA.NonEmptyArray<TopicFrontmatter> =
    frontmatter.topic !== undefined
      ? frontmatter.topic.map((t: string) => ({
          uuid: t,
          label: t,
          slug: t,
          date: new Date().toISOString(),
          color: "FFF",
          selected: false,
        }))
      : [{ label: "not-a-real-topic", slug: "not-a-real-topic", color: "FFF" }]

  const groups: GroupFrontmatter = [] as any
  const type = O.none

  const event= 
    {
      frontmatter: {
        uuid,
        title,
        date: new Date(frontmatter.date),
        cover,
        links,
        location: O.fromNullable(location),
        actors: O.none,
        topics,
        groups,
        type,
      },
      body,
    }

  return pipe(
    EventMD.decode(event),
    E.fold(renderValidationErrors, (event) => <EventList events={[event]} />)
  )
}
