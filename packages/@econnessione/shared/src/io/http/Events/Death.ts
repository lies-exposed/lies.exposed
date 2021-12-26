import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Point } from "../Common";
import { GetListQuery } from "../Query";
import { EventCommon } from "./BaseEvent";
import { CreateEventBody } from "./Uncategorized";

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

// export const Death = t.strict(
//   {
//     ...BaseProps.type.props,
//     type: DeathType,
//     victim: UUID,
//     location: t.union([t.undefined, Point]),
//     killer: t.union([t.undefined, ByGroupOrActor]),
//     suspects: t.array(ByGroupOrActor),
//     media: t.array(t.string),
//   },
//   "Death"
// );

// export type Death = t.TypeOf<typeof Death>;

export const CreateDeathBody = t.strict(
  {
    type: DeathType,
    victim: UUID,
    location: optionFromNullable(Point),
  },
  "CreateDeathBody"
);

export type CreateDeathBody = t.TypeOf<typeof CreateEventBody>;

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
