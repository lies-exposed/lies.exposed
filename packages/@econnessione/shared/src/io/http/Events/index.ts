import * as t from "io-ts";
import { markdownRemark } from "../Common/Markdown";
import * as Arrest from "./Arrest";
import * as Condamned from "./Condamned";
import * as Death from "./Death";
import * as Fined from "./Fined";
import * as ProjectImpact from "./ProjectImpact";
import * as ProjectTransaction from "./ProjectTransaction";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as StudyPublished from "./StudyPublished";
import * as Uncategorized from "./Uncategorized";

export const Event = t.union(
  [
    StudyPublished.StudyPublished,
    Protest.Protest,
    ProjectImpact.ProjectImpact,
    ProjectTransaction.ProjectTransaction,
    Fined.Fined,
    Condamned.Condamned,
    Arrest.Arrest,
    Death.Death,
    PublicAnnouncement.PublicAnnouncement,
    Uncategorized.Uncategorized,
  ],
  "EventFrontmatter"
);
export type Event = t.TypeOf<typeof Event>;

export const EventMD = markdownRemark(Event, "EventMD");
export type EventMD = t.TypeOf<typeof EventMD>;

export interface EventListMap {
  StudyPublished: StudyPublished.StudyPublished[];
  Protest: Protest.Protest[];
  ProjectImpact: ProjectImpact.ProjectImpact[];
  ProjectTransaction: ProjectTransaction.ProjectTransaction[];
  Condamned: Condamned.Condamned[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.UncategorizedFrontmatter[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  StudyPublished: StudyPublished.StudyPublished,
  Protest: Protest.Protest,
  // Project
  ProjectImpact: ProjectImpact.ProjectImpact,
  ProjectTransaction: ProjectTransaction.ProjectTransaction,
  Fined: Fined.Fined,
  Condamned: Condamned.Condamned,
  Arrest: Arrest.Arrest,
  Death: Death.Death,
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement,
  Uncategorized: Uncategorized.UncategorizedFrontmatter,
};

export {
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
};
