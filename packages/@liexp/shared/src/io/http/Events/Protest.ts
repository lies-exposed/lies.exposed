import { Schema } from "effect";
import { BaseProps } from "../Common/BaseProps.js";
import { BySubjectId, For } from "../Common/index.js";
import { Media } from "../Media/Media.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const PROTEST = Schema.Literal("Protest");
export const Protest = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  type: PROTEST,
  for: For,
  organizers: Schema.Array(BySubjectId),
  media: OptionFromNullishToNull(Schema.NonEmptyArray(Media)),
  date: Schema.DateFromString,
}).annotations({
  title: PROTEST.Type,
});
export type Protest = typeof Protest;
