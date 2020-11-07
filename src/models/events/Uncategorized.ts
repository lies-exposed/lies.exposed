import { JSONFromString } from '@models/Common/JSONFromString'
import { Point } from '@models/Common/Point'
import { BaseFrontmatter } from '@models/Frontmatter'
import { ImageSource } from '@models/Image'
import { markdownRemark } from '@models/Markdown'
import { ActorFrontmatter } from '@models/actor'
import { GroupFrontmatter } from '@models/group'
import { TopicFrontmatter } from '@models/topic'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'

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

export const UncategorizedMD = markdownRemark(Uncategorized, 'UncategorizedMD')
export type UncategorizedMD = t.TypeOf<typeof UncategorizedMD>