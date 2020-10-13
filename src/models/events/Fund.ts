import { ByEitherGroupOrActor } from "@models/Common/By"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const Fund = t.type(
  {
    uuid: t.string,
    amount: t.number,
    by: ByEitherGroupOrActor,
    date: DateFromISOString,
    createdAt: DateFromISOString
  },
  "Fund"
)

export type Fund = t.TypeOf<typeof Fund>