import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { BaseProps } from "../Common/BaseProps.js";
import { BySubjectId } from "../Common/BySubject.js";
import { For } from "../Common/For.js";

export const Arrest = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("Arrest"),
    who: BySubjectId,
    for: t.array(For),
    date: DateFromISOString,
  },
  "Arrest",
);

export type Arrest = t.TypeOf<typeof Arrest>;
