import { ByGroupOrActor } from '@models/Common/ByGroupOrActor'
import { BaseFrontmatter } from '@models/Frontmatter'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'

export const Condamned = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("Condamned"),
    who: ByGroupOrActor,
    by: ByGroupOrActor,
    date: DateFromISOString,
  },
  "Condamned"
)

export type Condamned = t.TypeOf<typeof Condamned>