import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { propsOmit } from "../../utils";
import { Point } from "../Common";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";
import { GetSearchEventsQuery } from "./SearchEventsQuery";

export const DEATH = t.literal("Death");
export type DEATH = t.TypeOf<typeof DEATH>;

export const DeathListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["type"]),
    victim: optionFromNullable(t.array(UUID)),
    minDate: optionFromNullable(DateFromISOString),
    maxDate: optionFromNullable(DateFromISOString),
  },
  "DeathListQuery"
);
export type DeathListQuery = t.TypeOf<typeof DeathListQuery>;

export const CreateDeathBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: DEATH,
    payload: t.strict({
      victim: UUID,
      location: optionFromNullable(Point),
    }),
  },
  "CreateDeathBody"
);

export type CreateDeathBody = t.TypeOf<typeof CreateDeathBody>;

export const EditDeathBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: DEATH,
    payload: t.strict({
      victim: UUID,
      location: optionFromUndefined(Point),
    }),
  },
  "CreateDeathBody"
);

export type EditDeathBody = t.TypeOf<typeof EditDeathBody>;

export const DeathPayload = t.strict(
  {
    victim: UUID,
    location: t.union([t.undefined, Point]),
  },
  "DeathV2"
);
export type DeathPayload = t.TypeOf<typeof DeathPayload>;

export const Death = t.strict(
  {
    ...EventCommon.type.props,
    type: DEATH,
    payload: DeathPayload,
  },
  "DeathEvent"
);
export type Death = t.TypeOf<typeof Death>;
