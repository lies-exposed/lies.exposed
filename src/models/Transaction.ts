import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const TransactionFrontmatter = t.strict(
  {
    uuid: t.string,
    amount: t.number,
    by: ByGroupOrActor,
    to: ByGroupOrActor,
    sources: t.array(t.string),
    date: DateFromISOString,
    createdAt: DateFromISOString
  },
  "TransactionFrontmatter"
)

export type TransactionFrontmatter = t.TypeOf<typeof TransactionFrontmatter>