import { markdownRemark } from "@models/Markdown"
import * as t from "io-ts"
import { Arrest } from "./Arrest"
import { Condamned } from "./Condamned"
import { Death } from "./Death"
import { Fined } from "./Fined"
import { ProjectImpact } from "./ProjectImpact"
import { ProjectTransaction } from "./ProjectTransaction"
import { Protest } from "./Protest"
import { PublicAnnouncement } from "./PublicAnnouncement"
import { StudyPublished } from "./StudyPublished"
import { Uncategorized } from "./Uncategorized"

export const EventFrontmatter = t.union(
  [
    StudyPublished,
    Protest,
    ProjectImpact,
    ProjectTransaction,
    Fined,
    Condamned,
    Arrest,
    Death,
    PublicAnnouncement,
    Uncategorized,
  ],
  "EventFrontmatter"
)
export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export interface EventListMap {
  StudyPublished: StudyPublished[],
  Protest: Protest[],
  ProjectImpact: ProjectImpact[],
  ProjectTransaction: ProjectTransaction[],
  Condamned: Condamned[],
  Arrest: Arrest[],
  Death: Death[],
  PublicAnnouncement: PublicAnnouncement[],
  Uncategorized: Uncategorized[],
}

export const EventMap: { [key in EventFrontmatter['type']] : t.Mixed } = {
  StudyPublished: StudyPublished,
  Protest: Protest,
  // Project
  ProjectImpact: ProjectImpact,
  ProjectTransaction: ProjectTransaction,
  Fined: Fined,
  Condamned: Condamned,
  Arrest: Arrest,
  Death: Death,
  PublicAnnouncement: PublicAnnouncement,
  Uncategorized: Uncategorized,
}

export const EventMD = markdownRemark(EventFrontmatter, "EventMD")
export type EventMD = t.TypeOf<typeof EventMD>