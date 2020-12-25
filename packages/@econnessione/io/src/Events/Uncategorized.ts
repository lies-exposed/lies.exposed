import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ActorFrontmatter } from "../Actor"
import { BaseFrontmatter, JSONFromString, Point } from "../Common"
import { markdownRemark } from "../Common/Markdown"
import { GroupFrontmatter } from "../Group"
import { ImageSource } from "../Image"
import { TopicFrontmatter } from "../Topic"

export const UNCATEGORIZED = t.literal("Uncategorized")
export const Uncategorized = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: UNCATEGORIZED,
    title: t.string,
    date: DateFromISOString,
    location: optionFromNullable(JSONFromString.pipe(Point)),
    images: optionFromNullable(t.array(ImageSource)),
    links: optionFromNullable(t.array(t.string)),
    // todo: remove
    actors: optionFromNullable(t.array(ActorFrontmatter)),
    groups: optionFromNullable(t.array(GroupFrontmatter)),
    topics: t.array(TopicFrontmatter),
  },
  UNCATEGORIZED.value
)

export type Uncategorized = t.TypeOf<typeof Uncategorized>

export const UncategorizedMD = markdownRemark(Uncategorized, "UncategorizedMD")
export type UncategorizedMD = t.TypeOf<typeof UncategorizedMD>
