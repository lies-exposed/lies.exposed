import { ByGroupOrActor } from '@models/Common/ByGroupOrActor'
// import { For } from '@models/Common/For'
import { BaseFrontmatter } from '@models/Frontmatter'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray'

export const PublicAnnouncement = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("PublicAnnouncement"),
    from: nonEmptyArray(ByGroupOrActor),
    publishedBy: nonEmptyArray(ByGroupOrActor),
    // for: For,
    date: DateFromISOString,
  },
  "PublicAnnouncement"
)

export type PublicAnnouncement = t.TypeOf<typeof PublicAnnouncement>

