import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import * as Arrest from "./Arrest";
import * as Condemned from "./Condemned";
import * as Death from "./Death";
import * as Fined from "./Fined";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as ScientificStudy from "./ScientificStudy";
import * as Uncategorized from "./Uncategorized";
import { ProjectImpact } from "./project/ProjectImpact";
import { ProjectTransaction } from "./project/ProjectTransaction";

export const Event = t.union(
  [Death.Death, ScientificStudy.ScientificStudy, Uncategorized.Uncategorized],
  "Event"
);
export type Event = t.TypeOf<typeof Event>;

export const SearchEvent = t.union(
  [
    Uncategorized.UncategorizedSearch,
    ScientificStudy.ScientificStudy,
    Death.Death,
  ],
  "SearchEvent"
);

export type SearchEvent = t.TypeOf<typeof SearchEvent>;

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

export const EventCommon = t.strict(
  {
    id: UUID,
    excerpt: t.union([t.unknown, t.undefined]),
    date: DateFromISOString,
    media: t.array(t.string),
    keywords: t.array(t.string),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "EventCommon"
);

export const EventPayload = t.union(
  [
    Death.DeathV2,
    ScientificStudy.ScientificStudyV2,
    Uncategorized.UncategorizedV2,
  ],
  "EventPayload"
);

export type EventPayload = t.TypeOf<typeof EventPayload>;

const DeathV2 = t.strict(
  {
    ...EventCommon.type.props,
    type: Death.DeathType,
    payload: Death.DeathV2,
  },
  "DeathEvent"
);
type DeathV2 = t.TypeOf<typeof DeathV2>;

const ScientificStudyV2 = t.strict(
  {
    ...EventCommon.type.props,
    type: ScientificStudy.ScientificStudyType,
    payload: ScientificStudy.ScientificStudyV2,
  },
  "ScientificStudyEvent"
);
type ScientificStudyV2 = t.TypeOf<typeof ScientificStudyV2>;

const UncategorizedV2 = t.strict(
  {
    ...EventCommon.type.props,
    type: Uncategorized.UncategorizedType,
    payload: Uncategorized.UncategorizedV2,
  },
  "UncategorizedEventV2"
);

type UncategorizedV2 = t.TypeOf<typeof UncategorizedV2>

export const EventV2 = t.union(
  [DeathV2, ScientificStudyV2, UncategorizedV2],
  "EventV2"
);

export type EventV2 = t.TypeOf<typeof EventV2>;

export {
  Protest,
  Fined,
  Condemned,
  Arrest,
  Death,
  PublicAnnouncement,
  Uncategorized,
  ScientificStudy,
  ProjectImpact,
  ProjectTransaction,
  DeathV2,
  ScientificStudyV2,
  UncategorizedV2,
};
