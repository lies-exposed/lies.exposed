import { EventMarkdownRemark, EventPoint } from "@models/event"
import * as Ord from "fp-ts/lib/Ord"

export const ordEventFileNodeDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMarkdownRemark) => e.frontmatter.date
)

export const ordEventPointDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventPoint) => e.data.frontmatter.date
)

export const ordEventData = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventMarkdownRemark) => e.frontmatter.date
)
