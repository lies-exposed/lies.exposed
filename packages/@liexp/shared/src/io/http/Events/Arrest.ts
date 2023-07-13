import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../Common/BaseProps";
import { BySubject } from "../Common/BySubject";
import { For } from "../Common/For";

export const Arrest = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("Arrest"),
    who: BySubject,
    for: t.array(For),
    date: DateFromISOString,
  },
  "Arrest",
);

export type Arrest = t.TypeOf<typeof Arrest>;
