import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { MoneyAmount } from "@models/Common/MoneyAmount"
import { BaseFrontmatter } from "@models/Frontmatter"
import * as t from 'io-ts'
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const Fined = t.strict({
  ...BaseFrontmatter.type.props,
  title: t.string,
  type: t.literal('Fined'),
  amount: MoneyAmount,
  who: ByGroupOrActor,
  by: ByGroupOrActor,
  date: DateFromISOString,
}, 'Fined')

export type Fined = t.TypeOf<typeof Fined>