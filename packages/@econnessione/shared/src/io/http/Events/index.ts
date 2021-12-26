import * as t from "io-ts";
import * as Arrest from "./Arrest";
import * as Condemned from "./Condemned";
import * as Death from "./Death";
import * as Fined from "./Fined";
import { ProjectImpact } from "./project/ProjectImpact";
import { ProjectTransaction } from "./project/ProjectTransaction";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as ScientificStudy from "./ScientificStudy";
import * as Uncategorized from "./Uncategorized";

// export const Event = t.union(
//   [Death.Death, ScientificStudy.ScientificStudy, Uncategorized.Uncategorized],
//   "Event"
// );
// export type Event = t.TypeOf<typeof Event>;

// export const SearchEvent = t.union(
//   [
//     Uncategorized.UncategorizedSearch,
//     ScientificStudy.ScientificStudy,
//     Death.Death,
//   ],
//   "SearchEvent"
// );

// export type SearchEvent = t.TypeOf<typeof SearchEvent>;

export interface EventListMap {
  Protest: Protest.Protest[];
  ProjectImpact: ProjectImpact[];
  ProjectTransaction: ProjectTransaction[];
  Condemned: Condemned.Condemned[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.Uncategorized[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  Death: Death.Death,
  ScientificStudy: ScientificStudy.ScientificStudy,
  Uncategorized: Uncategorized.Uncategorized,
};

export const CreateEventBody = t.union(
  [
    Death.CreateDeathBody,
    ScientificStudy.CreateScientificStudyBody,
    Uncategorized.CreateEventBody,
  ],
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = t.union(
  [
    Death.CreateDeathBody,
    ScientificStudy.CreateScientificStudyBody,
    Uncategorized.EditEventBody,
  ],
  "EditEventBody"
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const EventPayload = t.union(
  [
    Death.DeathPayload,
    ScientificStudy.ScientificStudyPayload,
    Uncategorized.Uncategorized,
  ],
  "EventPayload"
);

export type EventPayload = t.TypeOf<typeof EventPayload>;

export const Event = t.union(
  [Death.Death, ScientificStudy.ScientificStudy, Uncategorized.Uncategorized],
  "EventV2"
);

export type Event = t.TypeOf<typeof Event>;

export {
  Protest,
  Fined,
  Condemned,
  Arrest,
  PublicAnnouncement,
  ProjectImpact,
  ProjectTransaction,
  Death,
  ScientificStudy,
  Uncategorized,
};
