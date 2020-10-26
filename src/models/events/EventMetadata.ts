import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { For } from "@models/Common/For"
import { Impact } from "@models/Common/Impact"
import { ImageFileNode } from "@models/Image"
import { markdownRemark } from "@models/Markdown"
import { ProjectFrontmatter } from "@models/Project"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Uncategorized } from "./UncategorizedEvent"

const StudyPublished = t.strict(
  {
    type: t.literal("StudyPublished"),
    by: t.array(ByGroupOrActor),
    source: t.string,
    date: DateFromISOString,
  },
  "StudyPublished"
)

type StudyPublished = t.TypeOf<typeof StudyPublished>

const Protest = t.strict(
  {
    type: t.literal("Protest"),
    for: For,
    by: t.array(ByGroupOrActor),
    images: optionFromNullable(nonEmptyArray(ImageFileNode)),
    date: DateFromISOString,
  },
  "Protest"
)
type Protest = t.TypeOf<typeof Protest>

export const ProjectFund = t.strict(
  {
    type: t.literal("ProjectFund"),
    project: ProjectFrontmatter,
    amount: t.number,
    by: ByGroupOrActor,
    date: DateFromISOString,
  },
  "ProjectFund"
)

export type ProjectFund = t.TypeOf<typeof ProjectFund>

const ProjectImpact = t.strict(
  {
    type: t.literal("ProjectImpact"),
    project: ProjectFrontmatter,
    approvedBy: t.array(ByGroupOrActor),
    executedBy: t.array(ByGroupOrActor),
    images: t.array(ImageFileNode),
    impact: Impact,
  },
  "ProjectImpact"
)

type ProjectImpact = t.TypeOf<typeof ProjectImpact>

const Condamned = t.strict(
  {
    type: t.literal("Condamned"),
    who: ByGroupOrActor,
    by: ByGroupOrActor,
    date: DateFromISOString,
  },
  "Condamned"
)

type Condamned = t.TypeOf<typeof Condamned>

const Arrest = t.strict(
  {
    type: t.literal("Arrest"),
    who: ByGroupOrActor,
    for: t.array(For),
    date: DateFromISOString,
  },
  "Arrest"
)

type Arrest = t.TypeOf<typeof Arrest>

const Death = t.strict(
  {
    type: t.literal("Death"),
    who: ByGroupOrActor,
    killer: optionFromNullable(ByGroupOrActor),
    date: DateFromISOString,
  },
  "Death"
)

type Death = t.TypeOf<typeof Death>

const PublicAnnouncement = t.strict(
  {
    type: t.literal("PublicAnnouncement"),
    by: t.array(ByGroupOrActor),
    publishedBy: t.array(ByGroupOrActor),
    // opposedTo: optionFromNullable(PublicAnnouncement),
    date: DateFromISOString,
  },
  "PublicAnnouncement"
)

type PublicAnnouncement = t.TypeOf<typeof PublicAnnouncement>



export const EventFrontmatter = t.union(
  [
    StudyPublished,
    Protest,
    ProjectImpact,
    ProjectFund,
    Condamned,
    Arrest,
    Death,
    PublicAnnouncement,
    // Uncategorized,
  ],
  "EventMetadata"
)
export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export interface EventListMap {
  StudyPublished: StudyPublished[],
  Protest: Protest[],
  ProjectImpact:   ProjectImpact[],
  ProjectFund: ProjectFund[],
  Condamned: Condamned[],
  Arrest: Arrest[],
  Death: Death[],
  PublicAnnouncement: PublicAnnouncement[],
  Uncategorized: Uncategorized[],
}

export const EventMap = {
  StudyPublished: StudyPublished,
  Protest: Protest,
  ProjectImpact:   ProjectImpact,
  ProjectFund: ProjectFund,
  Condamned: Condamned,
  Arrest: Arrest,
  Death: Death,
  PublicAnnouncement: PublicAnnouncement,
  Uncategorized: Uncategorized,
}

export const EventMD = markdownRemark(Uncategorized, "EventMD")

export type EventMD = t.TypeOf<typeof EventMD>