import EventList from "@components/lists/EventList"
import { EventMarkdownRemark } from "@models/event"
import { TopicFrontmatter } from "@models/topic"
import { HTMLtoAST, MDtoHTML } from "@utils/markdownHTML"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

interface TopicEntry extends Omit<TopicFrontmatter, 'date' | 'cover'> {
  date: string;
  cover: string | null
}

export const EventPreview: React.FC<any> = (props) => {
  const { entry } = props
  const { body, topics: topicUUIDs, ...frontmatter } = entry.getIn(["data"]).toJS()

  const topics: NEA.NonEmptyArray<TopicEntry> = Array.isArray(topicUUIDs)
    ? NEA.nonEmptyArray.of({
        uuid: topicUUIDs[0],
        label: topicUUIDs[0],
        slug: topicUUIDs[0],
        date: new Date().toISOString(),
        color: "FFF",
        cover: null,
        selected: false,
      })
    : NEA.nonEmptyArray.of({
        uuid: 'not-a-real-topic',
        label: "not-a-real-topic",
        slug: "not-a-real-topic",
        date: new Date().toISOString(),
        color: "FFF",
        cover: null,
        selected: false,
      })

  const event = {
    frontmatter: {
      ...frontmatter,
      topics,
      actors: [],
      groups: [],
    },
    htmlAst: HTMLtoAST(MDtoHTML(body)),
  }

  return pipe(
    EventMarkdownRemark.decode(event),
    E.fold(renderValidationErrors, (event) => <EventList events={[event]} />)
  )
}
