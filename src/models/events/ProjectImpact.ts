import { ByEitherGroupOrActor } from "@models/Common/By"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { Impact } from "./Impact"

export const ProjectImpact = t.type(
  {
    uuid: t.string,
    projectId: t.string,
    approvedBy: t.array(ByEitherGroupOrActor),
    executedBy: t.array(ByEitherGroupOrActor),
    impact: Impact,
    date: DateFromISOString,
  },
  "ProjectImpact"
)

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>
