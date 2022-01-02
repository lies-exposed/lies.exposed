import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { Point } from "../Common";
import { GetListQuery } from "../Query";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const DeathListQuery = t.type(
  {
    ...GetListQuery.props,
    victim: optionFromNullable(t.array(UUID)),
    minDate: optionFromNullable(DateFromISOString),
    maxDate: optionFromNullable(DateFromISOString),
  },
  "DeathListQuery"
);
export type DeathListQuery = t.TypeOf<typeof DeathListQuery>;

export const DeathType = t.literal("Death");
export type DeathType = t.TypeOf<typeof DeathType>;

export const CreateDeathBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: DeathType,
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
    type: DeathType,
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
    type: DeathType,
    payload: DeathPayload,
  },
  "DeathEvent"
);
export type Death = t.TypeOf<typeof Death>;
