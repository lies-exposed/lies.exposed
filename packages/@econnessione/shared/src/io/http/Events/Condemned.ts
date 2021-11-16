import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../Common/BaseProps";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";

export const Condemned = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("Condemned"),
    who: ByGroupOrActor,
    date: DateFromISOString,
  },
  "Condemned"
);

export type Condemned = t.TypeOf<typeof Condemned>;
