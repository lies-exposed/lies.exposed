import { ByEitherGroupOrActor } from "@models/Common/By"
import { For } from "@models/Common/For"
import { Impact } from "@models/Common/Impact"
import { ImageFileNode } from "@models/Image"
import { ProjectFrontmatter } from "@models/Project"
import * as t from "io-ts"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const Protest = t.strict(
  {
    type: t.literal("Protest"),
    for: For,
    images: optionFromNullable(nonEmptyArray(ImageFileNode)),
    by: t.array(ByEitherGroupOrActor),
  },
  "Protest"
)

export type Protest = t.TypeOf<typeof Protest>

export const ProjectFund = t.strict({
  type: t.literal('ProjectFund'),
  project: ProjectFrontmatter,
  by: ByEitherGroupOrActor
}, 'ProjectFund')

export type ProjectFund = t.TypeOf<typeof ProjectFund>

export const ProjectImpact = t.strict(
  {
    type: t.literal('ProjectImpact'),
    project: ProjectFrontmatter,
    approvedBy: t.array(ByEitherGroupOrActor),
    executedBy: t.array(ByEitherGroupOrActor),
    images: t.array(ImageFileNode),
    impact: Impact,
  },
  "ProjectImpact"
)

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>


export const EventMetadata = t.union([Protest, ProjectImpact, ProjectFund], "EventMetadata")
export type EventMetadata = t.TypeOf<typeof EventMetadata>
