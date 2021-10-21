import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Point } from "../Common";
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
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

export const Death = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: t.literal("Death"),
    victim: t.string,
    location: t.union([t.undefined, Point]),
    killer: t.union([t.undefined, ByGroupOrActor]),
    suspects: t.array(ByGroupOrActor),
    news: t.array(t.string),
    images: t.array(t.string),
    date: DateFromISOString,
  },
  "Death"
);

export type Death = t.TypeOf<typeof Death>;
