import {
  EventFrontmatter,
  EventMarkdownRemark,
  EventPoint,
  EventType,
} from "@models/event"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

export const ordEventPointDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventPoint) => e.data.frontmatter.date
)

export const ordEventData = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMarkdownRemark) => e.frontmatter.date
)

const colorMap: Record<EventType, string> = {
  AntiEcologicAct: "brown",
  AnthropicDisaster: "red",
  NaturalDisaster: "yellow",
  Fact: "blue",
  EcologicAct: "green",
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
