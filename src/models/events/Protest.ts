import { ByGroupOrActor } from '@models/Common/ByGroupOrActor'
import { For } from '@models/Common/For'
import { BaseFrontmatter } from '@models/Frontmatter'
import { ImageSource } from '@models/Image'
import { markdownRemark } from '@models/Markdown'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'

export const PROTEST =t.literal("Protest");
export const Protest = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: PROTEST,
    for: For,
    organizers: t.array(ByGroupOrActor),
    images: optionFromNullable(nonEmptyArray(ImageSource)),
    date: DateFromISOString,
  },
  PROTEST.value
)
export type Protest = t.TypeOf<typeof Protest>

export const ProtestMD = markdownRemark(Protest, 'ProtestMD')
export type ProtestMD = t.TypeOf<typeof ProtestMD>