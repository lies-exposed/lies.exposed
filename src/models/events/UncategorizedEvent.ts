import { Point } from '@models/Common/Point'
import { Frontmatter } from '@models/Frontmatter'
import { ImageAndDescription } from '@models/Image'
import { JSONFromString } from '@models/JSONFromString'
import { markdownRemark } from '@models/Markdown'
import { ActorFrontmatter } from '@models/actor'
import { GroupFrontmatter } from '@models/group'
import { TopicFrontmatter } from '@models/topic'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'

export const Uncategorized = t.strict(
  {
    ...Frontmatter.props,
    // type: t.literal("Uncategorized"),
    title: t.string,
    date: DateFromISOString,
    location: optionFromNullable(JSONFromString.pipe(Point)),
    images: optionFromNullable(nonEmptyArray(ImageAndDescription)),
    links: optionFromNullable(t.array(t.string)),
    // todo: remove
    actors: optionFromNullable(t.array(ActorFrontmatter)),
    groups: optionFromNullable(t.array(GroupFrontmatter)),
    topics: nonEmptyArray(TopicFrontmatter),
  },
  "Uncategorized"
)

export type Uncategorized = t.TypeOf<typeof Uncategorized>

export const UncategorizedMD = markdownRemark(Uncategorized, 'Uncategorized')
export type UncategorizedMD = t.TypeOf<typeof UncategorizedMD>