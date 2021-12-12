import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Point } from "../Common";
import { BaseProps } from "../Common/BaseProps";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";
import { GetListQuery } from "../Query";

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

export const Death = t.strict(
  {
    ...BaseProps.type.props,
    type: DeathType,
    victim: UUID,
    location: t.union([t.undefined, Point]),
    killer: t.union([t.undefined, ByGroupOrActor]),
    suspects: t.array(ByGroupOrActor),
    news: t.array(t.string),
    media: t.array(t.string),
    date: DateFromISOString,
  },
  "Death"
);

export type Death = t.TypeOf<typeof Death>;

export const DeathV2 = t.strict(
  {
    victim: UUID,
    location: t.union([t.undefined, Point]),
    links: t.array(UUID),
    media: t.array(UUID),
    keywords: t.array(UUID)
  },
  "DeathV2"
);
export type DeathV2 = t.TypeOf<typeof DeathV2>;
