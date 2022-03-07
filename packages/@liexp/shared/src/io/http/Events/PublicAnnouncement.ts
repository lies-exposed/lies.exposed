import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { BaseProps } from "../Common/BaseProps";
import { BySubject } from "../Common/BySubject";

export const PublicAnnouncement = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("PublicAnnouncement"),
    from: nonEmptyArray(BySubject),
    publishedBy: nonEmptyArray(BySubject),
    // for: For,
    date: DateFromISOString,
  },
  "PublicAnnouncement"
);

export type PublicAnnouncement = t.TypeOf<typeof PublicAnnouncement>;
