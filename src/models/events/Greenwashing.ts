import { ByEitherGroupOrActor } from "@models/Common/By"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

/**
 * Greenwashing
 */
export const GreenWashing = t.type(
  {
    uuid: t.string,
    madeBy: ByEitherGroupOrActor,
    presentedBy: ByEitherGroupOrActor,
    date: DateFromISOString

  },
  "GreenWashing"
)

export type GreenWashing = t.TypeOf<typeof GreenWashing>
