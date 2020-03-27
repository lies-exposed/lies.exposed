import { EventFileNode, EventPoint, EventData } from "@models/event"
import * as Ord from "fp-ts/lib/Ord"

export const ordEventFileNodeDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventFileNode) => e.childMarkdownRemark.frontmatter.date
)

export const ordEventPointDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventPoint) => e.data.frontmatter.date
)

export const ordEventData = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventData) => e.frontmatter.date
)
