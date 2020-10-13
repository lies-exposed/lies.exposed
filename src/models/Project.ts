import * as Show from "fp-ts/lib/Show"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Polygon } from "./Common/Polygon"

export const Project = t.type(
  {
    uuid: t.string,
    name: t.string,
    areas: t.array(Polygon),
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    date: DateFromISOString,
  },
  "Project"
)

export type Project = t.TypeOf<typeof Project>

export const ProjectShow = Show.getStructShow({ name: Show.showString })
