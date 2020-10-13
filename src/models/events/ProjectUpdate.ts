import { ByEitherGroupOrActor } from "@models/Common/By"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { Impact } from "./Impact"

export const ProjectUpdate = t.type(
  {
    uuid: t.string,
    projectId: t.string,
    approvedBy: t.array(ByEitherGroupOrActor),
    executedBy: t.array(ByEitherGroupOrActor),
    impacts: t.array(Impact),
    date: DateFromISOString,
  },
  "ProjectUpdate"
)

export type ProjectUpdate = t.TypeOf<typeof ProjectUpdate>
