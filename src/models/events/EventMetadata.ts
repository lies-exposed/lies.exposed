import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { Impact } from "@models/Common/Impact"
import { Frontmatter } from "@models/Frontmatter"
import { ImageSource,ImageFileNode } from "@models/Image"
import { markdownRemark } from "@models/Markdown"
import { ProjectFrontmatter } from "@models/Project"
import { TransactionFrontmatter } from "@models/Transaction"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Uncategorized } from "./UncategorizedEvent"

export const ForProject = t.strict({
  __type: t.literal('ForProject'),
  project: ProjectFrontmatter
}, 'ForProject')

export const ForAny = t.strict({
  __type: t.literal('ForAny'),
}, 'ForProject')


export const For = t.union([ForProject, ForAny], 'For')
export type For = t.TypeOf<typeof For>

const StudyPublished = t.strict(
  {
    title: t.string,
    type: t.literal("StudyPublished"),
    by: t.array(ByGroupOrActor),
    source: t.string,
    date: DateFromISOString,
  },
  "StudyPublished"
)

type StudyPublished = t.TypeOf<typeof StudyPublished>

export const Protest = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    type: t.literal("Protest"),
    for: For,
    by: t.array(ByGroupOrActor),
    images: optionFromNullable(nonEmptyArray(ImageSource)),
    date: DateFromISOString,
  },
  "Protest"
)
export type Protest = t.TypeOf<typeof Protest>

export const ProtestMD = markdownRemark(Protest, 'ProtestMD')
export type ProtestMD = t.TypeOf<typeof ProtestMD>

export const ProjectTransaction = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    type: t.literal("ProjectTransaction"),
    project: ProjectFrontmatter,
    transaction: TransactionFrontmatter,
    date: DateFromISOString,
  },
  "ProjectTransaction"
)


export type ProjectTransaction = t.TypeOf<typeof ProjectTransaction>

export const ProjectTransactionMD = markdownRemark(ProjectTransaction, 'ProjectTransactionMD');
export type ProjectTransactionMD = t.TypeOf<typeof ProjectTransactionMD>

const ProjectImpact = t.strict(
  {
    title: t.string,
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
    title: t.string,
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
    title: t.string,
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
    title: t.string,
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
    title: t.string,
    type: t.literal("PublicAnnouncement"),
    by: t.array(ByGroupOrActor),
    publishedBy: t.array(ByGroupOrActor),
    for: For,
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
    ProjectTransaction,
    Condamned,
    Arrest,
    Death,
    PublicAnnouncement,
    Uncategorized,
  ],
  "EventMetadata"
)
export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export interface EventListMap {
  StudyPublished: StudyPublished[],
  Protest: Protest[],
  ProjectImpact:   ProjectImpact[],
  ProjectTransaction: ProjectTransaction[],
  Condamned: Condamned[],
  Arrest: Arrest[],
  Death: Death[],
  PublicAnnouncement: PublicAnnouncement[],
  Uncategorized: Uncategorized[],
}

export const EventMap = {
  StudyPublished: StudyPublished,
  Protest: Protest,
  ProjectImpact: ProjectImpact,
  ProjectFund: ProjectTransaction,
  Condamned: Condamned,
  Arrest: Arrest,
  Death: Death,
  PublicAnnouncement: PublicAnnouncement,
  Uncategorized: Uncategorized,
}

export const EventMD = markdownRemark(EventFrontmatter, "EventMD")

export type EventMD = t.TypeOf<typeof EventMD>