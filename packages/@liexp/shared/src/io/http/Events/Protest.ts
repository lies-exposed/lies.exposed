import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { BySubjectId, For } from "../Common";
import { BaseProps } from "../Common/BaseProps";
import { markdownRemark } from "../Common/Markdown";
import { Media } from "../Media";

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
