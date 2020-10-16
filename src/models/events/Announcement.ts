import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const Announcement = t.strict(
  {
    uuid: t.string,
    type: t.literal('Announcement'),
    createdAt: DateFromISOString,
  },
  "Announcement"
)
