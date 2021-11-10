import * as t from "io-ts";
import { markdownRemark } from "../Common/Markdown";
import * as Arrest from "./Arrest";
import * as Condamned from "./Condamned";
import * as Death from "./Death";
import * as Fined from "./Fined";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as ScientificStudy from "./ScientificStudy";
import * as Uncategorized from "./Uncategorized";
import { ProjectImpact } from "./project/ProjectImpact";
import { ProjectTransaction } from "./project/ProjectTransaction";

export const Event = t.union(
  [
    // Protest.Protest,
    // ProjectImpact,
    // ProjectTransaction,
    // Fined.Fined,
    // Condamned.Condamned,
    // Arrest.Arrest,
    Death.Death,
    // PublicAnnouncement.PublicAnnouncement,
    ScientificStudy.ScientificStudy,
    Uncategorized.Uncategorized,
  ],
  "Event"
);
export type Event = t.TypeOf<typeof Event>;

export const EventMD = markdownRemark(Event, "EventMD");
export type EventMD = t.TypeOf<typeof EventMD>;

export interface EventListMap {
  Protest: Protest.Protest[];
  ProjectImpact: ProjectImpact[];
  ProjectTransaction: ProjectTransaction[];
  Condamned: Condamned.Condamned[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.Uncategorized[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  // StudyPublished: StudyPublished.StudyPublished,
  // Protest: Protest.Protest,
  // Project
  // ProjectImpact: ProjectImpact,
  // ProjectTransaction: ProjectTransaction,
  // Fined: Fined.Fined,
  // Condamned: Condamned.Condamned,
  // Arrest: Arrest.Arrest,
  Death: Death.Death,
  ScientificStudy: ScientificStudy.ScientificStudy,
  // PublicAnnouncement: PublicAnnouncement.PublicAnnouncement,
  Uncategorized: Uncategorized.Uncategorized,
};

export {
  Protest,
  Fined,
  Condamned,
  Arrest,
  Death,
  PublicAnnouncement,
  Uncategorized,
  ScientificStudy,
  ProjectImpact,
  ProjectTransaction,
};
