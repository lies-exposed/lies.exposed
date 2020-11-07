import { ByGroupOrActor } from '@models/Common/ByGroupOrActor'
import { For } from '@models/Common/For'
import { BaseFrontmatter } from '@models/Frontmatter'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'

export const Arrest = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("Arrest"),
    who: ByGroupOrActor,
    for: t.array(For),
    date: DateFromISOString,
  },
  "Arrest"
)

export type Arrest = t.TypeOf<typeof Arrest>