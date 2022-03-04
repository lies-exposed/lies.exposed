import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../Common/BaseProps";
import { BySubject } from "../Common/BySubject";

export const Condemned = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("Condemned"),
    who: BySubject,
    date: DateFromISOString,
  },
  "Condemned"
);

export type Condemned = t.TypeOf<typeof Condemned>;
