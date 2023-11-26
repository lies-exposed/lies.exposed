import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { BaseProps } from "../Common/BaseProps";
import { BySubjectId } from "../Common/BySubject";

export const PublicAnnouncement = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("PublicAnnouncement"),
    from: nonEmptyArray(BySubjectId),
    publishedBy: nonEmptyArray(BySubjectId),
    // for: For,
    date: DateFromISOString,
  },
  "PublicAnnouncement",
);

export type PublicAnnouncement = t.TypeOf<typeof PublicAnnouncement>;
