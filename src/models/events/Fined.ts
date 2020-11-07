import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { MoneyAmount } from "@models/Common/MoneyAmount"
import { BaseFrontmatter } from "@models/Frontmatter"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"

const FINED_FRONTMATTER = t.literal("Fined")

export const Fined = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: FINED_FRONTMATTER,
    amount: MoneyAmount,
    who: ByGroupOrActor,
    from: nonEmptyArray(ByGroupOrActor),
    date: DateFromISOString,
  },
  FINED_FRONTMATTER.value
)

export type Fined = t.TypeOf<typeof Fined>
