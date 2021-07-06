import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { Point } from "../Common";
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";

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
