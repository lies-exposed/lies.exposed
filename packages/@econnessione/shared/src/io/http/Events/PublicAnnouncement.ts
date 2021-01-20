import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
// import { For } from '../Common/For'
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";

export const PublicAnnouncement = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("PublicAnnouncement"),
    from: nonEmptyArray(ByGroupOrActor),
    publishedBy: nonEmptyArray(ByGroupOrActor),
    // for: For,
    date: DateFromISOString,
  },
  "PublicAnnouncement"
);

export type PublicAnnouncement = t.TypeOf<typeof PublicAnnouncement>;
