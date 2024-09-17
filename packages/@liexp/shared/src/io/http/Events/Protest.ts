import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "../Common/BaseProps.js";
import { markdownRemark } from "../Common/Markdown.js";
import { BySubjectId, For } from "../Common/index.js";
import { Media } from "../Media/Media.js";

export const PROTEST = t.literal("Protest");
export const Protest = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: PROTEST,
    for: For,
    organizers: t.array(BySubjectId),
    media: optionFromNullable(nonEmptyArray(Media)),
    date: DateFromISOString,
  },
  PROTEST.value,
);
export type Protest = t.TypeOf<typeof Protest>;

export const ProtestMD = markdownRemark(Protest, "ProtestMD");
export type ProtestMD = t.TypeOf<typeof ProtestMD>;
