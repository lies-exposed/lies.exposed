import { Schema } from "effect";
import { BaseProps } from "../Common/BaseProps.js";
import { BySubjectId } from "../Common/BySubject.js";

export const PublicAnnouncement = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  type: Schema.Literal("PublicAnnouncement"),
  from: Schema.NonEmptyArray(BySubjectId),
  publishedBy: Schema.NonEmptyArray(BySubjectId),
  // for: For,
  date: Schema.Date,
}).annotations({ title: "PublicAnnouncement" });

export type PublicAnnouncement = typeof PublicAnnouncement.Type;
