import * as t from "io-ts";
import { markdownRemark } from "../Common/Markdown";
import * as Arrest from "./Arrest";
import * as Condamned from "./Condamned";
import * as Death from "./Death";
import * as Fined from "./Fined";
import * as ProjectEvent from "./ProjectEvent";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as StudyPublished from "./StudyPublished";
import * as Uncategorized from "./Uncategorized";

export const Event = t.union(
  [
    Protest.Protest,
    ProjectEvent.ProjectImpact,
    ProjectEvent.ProjectTransaction,
    Fined.Fined,
    Condamned.Condamned,
    Arrest.Arrest,
    Death.Death,
    PublicAnnouncement.PublicAnnouncement,
    Uncategorized.Uncategorized,
  ],
  "Event"
);
export type Event = t.TypeOf<typeof Event>;

export const EventMD = markdownRemark(Event, "EventMD");
export type EventMD = t.TypeOf<typeof EventMD>;

export interface EventListMap {
  StudyPublished: StudyPublished.StudyPublished[];
  Protest: Protest.Protest[];
  ProjectImpact: ProjectEvent.ProjectImpact[];
  ProjectTransaction: ProjectEvent.ProjectTransaction[];
  Condamned: Condamned.Condamned[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.Uncategorized[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  // StudyPublished: StudyPublished.StudyPublished,
  Protest: Protest.Protest,
  // Project
  ProjectImpact: ProjectEvent.ProjectImpact,
  ProjectTransaction: ProjectEvent.ProjectTransaction,
  Fined: Fined.Fined,
  Condamned: Condamned.Condamned,
  Arrest: Arrest.Arrest,
  Death: Death.Death,
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement,
  Uncategorized: Uncategorized.Uncategorized,
};

const ProjectImpact = ProjectEvent.ProjectImpact;
type ProjectImpact = ProjectEvent.ProjectImpact;
const ProjectTransaction = ProjectEvent.ProjectTransaction;
type ProjectTransaction = ProjectEvent.ProjectTransaction;

export {
  StudyPublished,
  Protest,
  Fined,
  Condamned,
  Arrest,
  Death,
  PublicAnnouncement,
  Uncategorized,
  ProjectImpact,
  ProjectTransaction,
};
