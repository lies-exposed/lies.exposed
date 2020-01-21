import * as Ord from "fp-ts/lib/Ord"
import { EventFileNode, EventPoint } from "../types/event"

export const ordEventFileNodeDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventFileNode) => e.childMarkdownRemark.frontmatter.date
)

export const ordEventPointDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventPoint) => e.data.frontmatter.date
)
