import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { BaseFrontmatter } from '../Common/BaseFrontmatter'
import { ByGroupOrActor } from '../Common/ByGroupOrActor'
import { For } from '../Common/For'

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