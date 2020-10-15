import { ByEitherGroupOrActor } from "@models/Common/By"
import { Impact } from "@models/Common/Impact"
import { ImageFileNode } from "@models/Image"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const ProjectImpact = t.type(
  {
    uuid: t.string,
    projectId: t.string,
    approvedBy: t.array(ByEitherGroupOrActor),
    executedBy: t.array(ByEitherGroupOrActor),
    images: t.array(ImageFileNode),
    impact: Impact,
    date: DateFromISOString,
  },
  "ProjectImpact"
)

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>
